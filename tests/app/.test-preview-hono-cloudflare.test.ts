import { testRun } from './testRun.js'

process.env.TARGET = 'cloudflare'
process.env.SERVER = 'hono'

testRun('pnpm run preview:vite --strictPort --port 3000')
