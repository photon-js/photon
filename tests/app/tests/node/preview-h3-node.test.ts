import { testRun } from '../testRun.js'

process.env.TARGET = 'node'
process.env.SERVER = 'h3'

testRun('pnpm run preview')
