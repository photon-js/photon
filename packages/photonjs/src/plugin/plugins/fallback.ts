import type { Plugin } from 'vite'
import { ifPhotonModule } from '../utils/virtual.js'

export { fallback }

function fallback(): Plugin {
  return {
    name: 'photon:fallback',

    resolveId(id) {
      return ifPhotonModule('fallback-entry', id, () => {
        return id
      })
    },

    load(id) {
      return ifPhotonModule('fallback-entry', id, () => {
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
          map: { mappings: '' } as const,
        }
      })
    },
  }
}
