import { enhance, MiddlewareOrder } from '@universal-middleware/core'

export const logger = enhance(
  (request: Request) => {
    console.log('Request:', request.url)
  },
  {
    name: 'log-request',
    order: MiddlewareOrder.LOGGING,
  },
)
