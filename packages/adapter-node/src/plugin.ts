import { installPhoton } from '@photonjs/core/vite'
import type { Plugin } from 'vite'

const virtualPhotonNodeId = 'photon:node:bundle-entries'

export function node(): Plugin[] {
  return [
    {
      name: 'photon:node',
      apply: 'build',

      resolveId(id) {
        if (id === virtualPhotonNodeId) {
          return id
        }
      },

      load(id) {
        if (id === virtualPhotonNodeId) {
          const handlers = Object.entries(this.environment.config.photon.handlers).map(([_, v]) => v.id)
          return `export default ${JSON.stringify(handlers)};`
        }
      },
    },
    ...installPhoton('@photonjs/node', {
      resolveMiddlewares() {
        // TODO also for dev
        return virtualPhotonNodeId
      },
    }),
  ]
}
