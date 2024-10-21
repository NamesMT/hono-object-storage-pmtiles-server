import { serve } from 'srvx'
import { app } from './app'

const server = serve({
  fetch(request) {
    return app.fetch(request)
  },
})

server.ready().then(() => {
  // eslint-disable-next-line no-console
  console.info(`🚀 Server ready at ${server.url}`)
})
