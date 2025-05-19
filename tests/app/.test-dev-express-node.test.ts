import { testRun } from './testRun.js'

process.env.TARGET = 'node'
process.env.SERVER = 'express'

testRun('pnpm run dev')
