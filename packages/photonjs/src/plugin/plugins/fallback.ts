import type { Plugin } from 'vite'

export { fallback }

function fallback(): Plugin {
  return {
    name: 'photon:fallback',

    resolveId(id) {
      if (id === 'photon:fallback-entry') {
        // FIXME
        return id
      }
    },

    load(id) {
      if (id === 'photon:fallback-entry') {
        //language=ts
        return {
          code: `import { apply, serve } from '@photonjs/core/hono'
import { Hono } from 'hono'

function startServer() {
  const app = new Hono()
  apply(app)

  const port = process.env.PORT || 3000

  return serve(app, {
    port: +port
  })
}

export default startServer()
`,
          map: { mappings: '' },
        }
      }
    },
  }
}
