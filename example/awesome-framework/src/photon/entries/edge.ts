import type { UniversalMiddleware } from '@universal-middleware/core'
import { apiMiddleware } from '../middlewares/api'
import { ssrMiddleware } from '../middlewares/ssr'
import { logger } from '../middlewares/logger'

export default [logger, apiMiddleware, ssrMiddleware] as UniversalMiddleware[]
