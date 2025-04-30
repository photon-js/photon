// Will be moved to @photonjs/hono
import { apply, serve } from '@photonjs/core/hono'
import middlewares from 'awesome-framework/universal-middleware'
import { Hono } from 'hono'

async function startServer() {
  const app = new Hono()

  apply(
    app,
    // Adds frameworks middlewares and handlers
    middlewares,
  )

  return serve(app)
}

export default await startServer()
