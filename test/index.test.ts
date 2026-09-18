import { app } from '#src/app.js'
import { expect, it } from 'vitest'

it('exports a Hono app', () => {
  expect(app).toBeDefined()
  expect(typeof app.fetch).toBe('function')
  expect(typeof app.request).toBe('function')
})
