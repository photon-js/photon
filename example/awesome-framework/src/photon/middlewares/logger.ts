import { enhance, MiddlewareOrder } from '@universal-middleware/core'

export const loggerMiddleware = enhance(
  (request: Request) => {
    console.log('Request:', request.url)
  },
  {
    name: 'log-request',
    order: MiddlewareOrder.LOGGING,
  },
)
