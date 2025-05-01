import { enhance, type UniversalMiddleware } from '@universal-middleware/core'
import sirv from '@universal-middleware/sirv'
import { apiHandler } from '../middlewares/api-handler'
import { defaultHandler } from '../middlewares/default-handler'
import { logger } from '../middlewares/logger'

// Production with Node.js/Bun/Deno
export default [
  logger,
  enhance(sirv('dist/client'), {
    name: 'sirv',
  }),
  apiHandler,
  defaultHandler,
] as UniversalMiddleware[]
