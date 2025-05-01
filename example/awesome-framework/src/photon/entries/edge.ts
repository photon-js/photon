import type { UniversalMiddleware } from '@universal-middleware/core'
import { apiHandler } from '../middlewares/api-handler'
import { defaultHandler } from '../middlewares/default-handler'
import { logger } from './logger'

export default [logger, apiHandler, defaultHandler] as UniversalMiddleware[]
