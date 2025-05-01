import { enhance, type UniversalMiddleware } from '@universal-middleware/core'
import sirv from '@universal-middleware/sirv'
import { apiMiddleware } from '../middlewares/api'
import { ssrMiddleware } from '../middlewares/ssr'
import { loggerMiddleware } from '../middlewares/logger'

// Production with Node.js/Bun/Deno
export default [
  loggerMiddleware,
  enhance(sirv('dist/client'), { name: 'sirv' }),
  apiMiddleware,
  ssrMiddleware,
] as UniversalMiddleware[]
