import { runCommandThatThrows } from '../utils.js'

process.env.TARGET = 'node'
process.env.SERVER = 'tests/non-photon-entry/express'

await runCommandThatThrows('pnpm run preview', 'Cannot guess', 'server type. Make sure to use')
