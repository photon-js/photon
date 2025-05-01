import type { UniversalMiddleware } from '@universal-middleware/core'
import { apiMiddleware } from '../middlewares/api'
import { ssrMiddleware } from '../middlewares/ssr'
import { loggerMiddleware } from '../middlewares/logger'

export default [loggerMiddleware, apiMiddleware, ssrMiddleware] as UniversalMiddleware[]
