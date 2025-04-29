import { apply, serve } from '@photonjs/core/hono'
import { Hono } from 'hono'
// @ts-ignore
import middlewares from 'photon-example/universal-middlewares'
import { handler } from './src/photon-handler.js'

async function startServer() {
  const app = new Hono()
  const port = process.env.PORT || 3000

  apply(app, [...middlewares, handler((await import('./_index.html?raw')).default)])

  return serve(app, {
    port: +port
  })
}

export default await startServer()
