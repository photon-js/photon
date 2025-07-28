import { defaultServerConditions, type Plugin } from 'vite'
import { singleton } from '../utils/dedupe.js'
import { isBun } from '../utils/isBun.js'
import { isDeno } from '../utils/isDeno.js'

export { commonConfig }

function commonConfig(): Plugin[] {
  return [
    singleton({
      name: 'photon:common-config',

      configEnvironment(name, config) {
        if (!config.consumer) {
          config.consumer = name === 'client' ? 'client' : 'server'
        }

        let additionalConditions: { externalConditions?: string[]; conditions?: string[] } = {}

        if (isBun) {
          additionalConditions = {
            conditions: ['bun', ...defaultServerConditions],
            externalConditions: ['bun', ...defaultServerConditions],
          }
        }

        if (isDeno) {
          additionalConditions = {
            conditions: ['deno', ...defaultServerConditions],
            externalConditions: ['deno', ...defaultServerConditions],
          }
        }

        return {
          resolve: {
            noExternal: '@photonjs/core',
            ...additionalConditions,
          },
          build: {
            target: 'es2022',
          },
        }
      },
    }),
    singleton({
      name: 'photon:set-after-build-start',
      enforce: 'post',
      buildStart: {
        order: 'post',
        handler() {
          Object.defineProperty(this.environment.config, 'afterBuildStart', {
            get() {
              return true
            },
          })
        },
      },
    }),
  ]
}
