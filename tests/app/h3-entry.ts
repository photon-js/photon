// Will be moved to @photonjs/h3
import { apply, serve } from '@photonjs/core/h3'
import awesomeFramework from 'awesome-framework/universal-middleware'
import { createApp } from 'h3'

async function startServer() {
  const app = createApp()

  apply(
    app,
    // Adds the framework's middlewares
    awesomeFramework,
  )

  return serve(app)
}

export default await startServer()
