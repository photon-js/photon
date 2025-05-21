import { testRunUnsupported } from './testRun.js'

process.env.TARGET = 'cloudflare'
process.env.SERVER = 'fastify'

testRunUnsupported('pnpm run dev --strictPort --port 3000')
