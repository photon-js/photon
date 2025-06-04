import type { Plugin } from 'vite'
import { assertUsage } from '../../utils/assert.js'
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
      return ifPhotonModule('fallback-entry', id, ({ query }) => {
        const q = new URLSearchParams(query)
        const handlerId = q.get('photonHandlerId')
        const condition = q.get('photonCondition')
        if (handlerId) {
          assertUsage(condition, `Missing { photonCondition } query for handler ${handlerId}`)
        }
        //language=ts
        return {
          code: `
${
  handlerId
    ? `import { serve } from '@photonjs/core/hono/serve'
import { apply } from ${JSON.stringify(`photon:virtual-apply-handler:${condition}:hono:${handlerId}`)}`
    : "import { apply, serve } from '@photonjs/core/hono'"
}
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
