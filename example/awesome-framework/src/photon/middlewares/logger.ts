import { enhance, MiddlewareOrder } from '@universal-middleware/core'

export const loggerMiddleware = enhance(
  (request: Request) => {
    console.log('Request:', request.url)
  },
  // enhance() adds meta data (a Universal Middleware in itself is just a Request => Response function)
  {
    name: 'log-request',
    order: MiddlewareOrder.LOGGING,
  },
)
