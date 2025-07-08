import { getUniversalEntries, getUniversalMiddlewares } from 'photon:get-middlewares:dev:express'
import type { RuntimeAdapterTarget } from '@universal-middleware/core'
import { apply as applyAdapter } from '@universal-middleware/express'
import { createApply } from '../common.js'
import { devServerMiddleware } from '@photonjs/core/dev'

export const apply = createApply(
  'express',
  applyAdapter,
  getUniversalEntries,
  getUniversalMiddlewares,
  devServerMiddleware,
)

export type RuntimeAdapter = RuntimeAdapterTarget<'express'>
