import { testRunUnsupported } from './testRun.js'

process.env.TARGET = 'cloudflare'
process.env.SERVER = 'express'

// @ts-ignore
await testRunUnsupported('pnpm run preview:vite --strictPort --port 3000')
