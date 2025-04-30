import type { UniversalMiddleware } from "@universal-middleware/core";
import { apiHandler } from '../handlers/api-handler'
import { defaultHandler } from '../handlers/default-handler'
import { logger } from './logger'

export default [logger, apiHandler, defaultHandler] as UniversalMiddleware[]
