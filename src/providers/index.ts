import { env as honoEnv } from 'hono/adapter'
import { createMiddleware } from 'hono/factory'
import { runtime } from 'std-env'
import { initTigrisMain } from './storage/tigris-main'

let initialized = false
export const providersInit = createMiddleware(async (c, next) => {
  // Inject workerd env to global context
  // @ts-expect-error globalThis not typed
  globalThis.__env__ = honoEnv(c)

  // Should only be initialized once except on platforms that cannot share data between requests
  if (!initialized && !['workerd'].includes(runtime)) {
    await Promise.all([
      initTigrisMain(),
    ])

    initialized = true
  }

  await next()
})
