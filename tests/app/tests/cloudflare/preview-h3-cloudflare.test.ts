import { testRun } from '../testRun.js'

process.env.TARGET = 'cloudflare'
process.env.SERVER = 'h3'

testRun('pnpm run preview:vite --strictPort --port 3000')
