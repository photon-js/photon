import { apply, serve } from '@photonjs/core/hono'
// @ts-ignore forces resolving through exports conditions
import middlewares from '@photonjs/demo/universal-middlewares'
import { Hono } from 'hono'
import { handler } from './src/photon-handler.js'

async function startServer() {
  const app = new Hono()
  const port = process.env.PORT || 3000

  apply(app, [
    // Adds compress middleware in prod when using node
    ...middlewares,
    // Simulate basic SSR framework
    handler((await import('./_index.html?raw')).default),
  ])

  return serve(app, {
    port: +port,
  })
}

export default await startServer()
