import { getUniversalEntries, getUniversalMiddlewares } from 'photon:get-middlewares:dev:hono'
import type { RuntimeAdapterTarget } from '@universal-middleware/core'
import { apply as applyAdapter } from '@universal-middleware/hono'
import { createApply } from '../common.js'
import { devServerMiddleware } from '@photonjs/core/dev'

export const apply = createApply(
  'hono',
  applyAdapter,
  getUniversalEntries,
  getUniversalMiddlewares,
  devServerMiddleware,
)

export type RuntimeAdapter = RuntimeAdapterTarget<'hono'>
