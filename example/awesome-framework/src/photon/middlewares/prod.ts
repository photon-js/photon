import { enhance, type UniversalMiddleware } from '@universal-middleware/core'
import sirv from '@universal-middleware/sirv'
import { apiHandler } from '../handlers/api-handler'
import { defaultHandler } from '../handlers/default-handler'
import { logger } from './logger'

// sirv middleware in prod (node)
export default [
  logger,
  enhance(sirv('dist/client'), {
    name: 'sirv',
  }),
  apiHandler,
  defaultHandler,
] as UniversalMiddleware[]
