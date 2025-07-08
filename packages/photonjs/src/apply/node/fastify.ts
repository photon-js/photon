import { getUniversalEntries, getUniversalMiddlewares } from 'photon:get-middlewares:node:fastify'
import type { RuntimeAdapterTarget } from '@universal-middleware/core'
import { apply as applyAdapter } from '@universal-middleware/fastify'
import { createAsyncApply } from '../common.js'

export const apply = createAsyncApply('fastify', applyAdapter, getUniversalEntries, getUniversalMiddlewares)

export type RuntimeAdapter = RuntimeAdapterTarget<'fastify'>
