import type { UniversalMiddleware } from '@universal-middleware/core'
import { apiHandler } from '../middlewares/api'
import { ssrMiddleware } from '../middlewares/ssr'
import { logger } from '../middlewares/logger'

export default [logger, apiHandler, ssrMiddleware] as UniversalMiddleware[]
