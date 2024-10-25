# hosps ![TypeScript heart icon](https://img.shields.io/badge/♡-%23007ACC.svg?logo=typescript&logoColor=white)

**hosps (hono-object-storage-pmtiles-server)** is an example repo for a tile server using [PMTiles](https://github.com/protomaps/PMTiles) and [Hono](https://honojs.dev/), with an object storage (a.k.a S3-compatible storage) provider.  

While PMTiles support direct usage with range requests, a tile-server is necessary for security and performance like caching.


### Info & Bench
This PMTiles server is also A LOT MORE faster, and efficient than [Martin tile server](https://github.com/maplibre/martin), though, because of the SDK (`aws-lite`) to interract with object storage provider (S3 / Tigris / R2), the base memory is a bit high, though, for environments like Cloudflare Workers and R2, you could use a custom PMTiles `Source` that could bypass the SDK.

The comparison is also unfair for this server vs Martin, because for this server we fetch from the storage securely with tokens, while with Martin I set the bucket to public and let it directly connect to the storage url without signing overhead.

Bench setup: one fly.io machine for each, size: shared 1x 512MB.
Bench method: fetching random tiles from browser with caching disabled.

Bench code snippets:
```js
const fetchTile = async (domain, z, x, y) => {  
    const url = `https://${domain}/world/${z}/${x}/${y}`;  
    const startTime = performance.now(); // Start time for the fetch  
    const response = await fetch(url);  
    const endTime = performance.now(); // End time for the fetch  
    
    console.log(`Fetched tile at ${url} in ${(endTime - startTime).toFixed(2)} ms`);  
};  

const fetchTiles = async (domain, numTiles) => {  
    const promises = [];  
    const overallStartTime = performance.now(); // Start time for overall fetching  

    for (let i = 0; i < numTiles; i++) {  
        const z = Math.floor(Math.random() * 5);
        const x = Math.floor(Math.random() * 100);
        const y = Math.floor(Math.random() * 100);
        promises.push(fetchTile(domain, z, x, y));  
    }  

    await Promise.all(promises);  
    const overallEndTime = performance.now(); // End time for overall fetching  
    console.log(`Fetched ${numTiles} tiles in ${(overallEndTime - overallStartTime).toFixed(2)} ms`);  
}; 
```
```js
// 10 batches of 500 parallel requests
for (let i=0; i<10; i++)
    await fetchTiles('machine.fly.dev', 500);
```

Martin's results:
```
Fetched 500 tiles in 10455.10 ms
Fetched 500 tiles in 13348.80 ms
Fetched 500 tiles in 13815.40 ms
Fetched 500 tiles in 11839.60 ms
Fetched 500 tiles in 16080.70 ms
Fetched 500 tiles in 22558.40 ms
Fetched 500 tiles in 4051.30 ms
Fetched 500 tiles in 4672.30 ms
Fetched 500 tiles in 3815.60 ms
Fetched 500 tiles in 4101.00 ms
```
Somewhere at the middle a few requests started to fail and then the server went dead from OOM and come back processing a bit faster for some reason idk.  
Base memory: 88-89 MB  
Peak: maxed and died from OOM.  
Firecracker load: 0.2  


Node's results:
```
Fetched 500 tiles in 2175.10 ms
Fetched 500 tiles in 1417.80 ms
Fetched 500 tiles in 1248.80 ms
Fetched 500 tiles in 1344.10 ms
Fetched 500 tiles in 1248.20 ms
Fetched 500 tiles in 1279.30 ms
Fetched 500 tiles in 1376.80 ms
Fetched 500 tiles in 1599.60 ms
Fetched 500 tiles in 1166.70 ms
Fetched 500 tiles in 1176.50 ms
```
Base memory: 160.5 MB  
Peak: 182.5 MB  
Firecracker load: it's so low it doesn't even display any load, when increasing the test to 1000 parallel tiles the max load is 0.1.  
