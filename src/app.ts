import { Hono } from 'hono'
import { providersInit } from './providers'
import { tileServerRoutes } from './tile-server-routes'

export const app = new Hono()
  // Initialize providers
  .use(providersInit)

  // Tile server APIs
  .route('', tileServerRoutes)
