import { runCommandThatThrows } from '../utils.js'

process.env.TARGET = 'cloudflare'
process.env.SERVER = 'tests/no-export-default/hono'

await runCommandThatThrows('pnpm run preview:vite --strictPort --port 3000', 'no default export was found')
