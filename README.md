# hosps ![TypeScript heart icon](https://img.shields.io/badge/♡-%23007ACC.svg?logo=typescript&logoColor=white)

**hosps (hono-object-storage-pmtiles-server)** is an example repo for a tile server using [PMTiles](https://github.com/protomaps/PMTiles) and [Hono](https://honojs.dev/), with an object storage (a.k.a S3-compatible storage) provider.  

While PMTiles support direct usage with range requests, a tile-server is necessary for security and performance like caching.
