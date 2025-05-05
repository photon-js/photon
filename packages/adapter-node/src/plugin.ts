import { installPhoton } from '@photonjs/core/vite'
import type { Plugin } from 'vite'

export function node(): Plugin[] {
  return [
    {
      name: 'photon:node',
      apply: 'build',

      resolveId(id) {
        if (id === 'photon:node:bundle-entries') {
          return id
        }
      },

      load(id) {
        const entries = Object.entries(this.environment.config.photon.entry)
          .filter(([k, v]) => k !== 'index' && v.type === 'universal-handler')
          .map(([_, v]) => v.id)
        if (id === 'photon:node:bundle-entries') {
          return `export default ${JSON.stringify(entries)};`
        }
      },
    },
    ...installPhoton('@photonjs/node', {
      resolveMiddlewares() {
        // TODO also for dev
        return 'photon:node:bundle-entries'
      },
    }),
  ]
}
