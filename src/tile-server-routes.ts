import type { TypedResponse } from 'hono'
import { ObjectStorageLiteSource } from '@namesmt/pmtiles-sources/sources/object-storage-lite'
import { Hono } from 'hono'
import { sha256 } from 'hono/utils/crypto'
import { PMTiles, ResolvedValueCache, TileType } from 'pmtiles'
import { env } from 'std-env'
import { getTigrisMain } from './providers/storage/tigris-main'

const worldCache = new ResolvedValueCache(25, undefined, undefined) // You should use SharedPromiseCache if possible

export const tileServerRoutes = new Hono()
  .get(
    '/world/:z/:x/:y',
    async (c) => {
      const { z, x, y } = c.req.param()

      const tigrisMain = await getTigrisMain()

      if (!env.PMTILES_WORLD_BUCKET || !env.PMTILES_WORLD_PATH)
        throw new Error('Missing env for `world` bucket')

      const worldSource = new ObjectStorageLiteSource(tigrisMain.S3, env.PMTILES_WORLD_BUCKET, env.PMTILES_WORLD_PATH)
      const worldPmtiles = new PMTiles(worldSource, worldCache) // On platforms without CompressionStream support you would need to pass in a custom decompress fn

      const header = await worldPmtiles.getHeader()

      // Fail-fast if the source is weird (we expect it to be a valid vector tile source)
      if (header.tileType !== TileType.Mvt)
        return c.text('Source type is not vector', 500)

      // Fail-fast if user requesting a zoom level that doesn't exists
      if (+z < header.minZoom || +z > header.maxZoom)
        return c.text('', 404)

      const tileResult = await worldPmtiles.getZxy(+z, +x, +y)

      // Return when tile is not found (empty)
      if (!tileResult)
        return c.text('', 204)

      // Set response headers and the vector tile data
      c.header('Content-Type', 'application/vnd.mapbox-vector-tile')
      c.header('Cache-Control', 'public, max-age=31536000, immutable') // Cache for a year :D
      c.header('ETag', tileResult.etag || await sha256(tileResult.data) as string)
      return c.body(tileResult.data, 200) as Response & TypedResponse<object, 200, 'buffer'>
    },
  )
