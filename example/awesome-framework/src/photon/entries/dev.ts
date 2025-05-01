import type { UniversalMiddleware } from '@universal-middleware/core'
import { apiHandler } from '../middlewares/api'
import { defaultHandler } from '../middlewares/ssr'
import { logger } from '../middlewares/logger'

export default [logger, apiHandler, defaultHandler] as UniversalMiddleware[]
