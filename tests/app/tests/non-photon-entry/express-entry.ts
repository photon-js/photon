import express, { type Express } from 'express'

function startServer(): Express {
  const app = express()

  app.listen(3000)

  return app
}

export default startServer()
