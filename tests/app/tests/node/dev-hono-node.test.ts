import { testRun } from '../testRun.js'

process.env.TARGET = 'node'
process.env.SERVER = 'hono'

testRun('pnpm run dev')
