import { testRun } from './testRun.js'

process.env.TARGET = 'node'
process.env.SERVER = 'fastify'

testRun('pnpm run preview')
