import { testRun } from '../testRun.js'

process.env.TARGET = 'bun'
process.env.SERVER = 'hono'

// Blocked by https://github.com/oven-sh/bun/issues/19111
testRun('bun --bun --silent run dev')
