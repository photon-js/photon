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

        let additionalResolveConfig: { externalConditions?: string[]; conditions?: string[]; noExternal?: string } = {}

        if (isBun) {
          additionalResolveConfig = {
            conditions: ['bun', ...defaultServerConditions],
            externalConditions: ['bun', ...defaultServerConditions],
          }
        }

        if (isDeno) {
          additionalResolveConfig = {
            conditions: ['deno', ...defaultServerConditions],
            externalConditions: ['deno', ...defaultServerConditions],
          }
        }

        // do not override `noExternal: true`
        if (config.resolve?.noExternal !== true) {
          additionalResolveConfig.noExternal = '@photonjs/core'
        }

        return {
          resolve: {
            ...additionalResolveConfig,
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
