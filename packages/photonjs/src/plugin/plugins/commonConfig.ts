import { defaultServerConditions, type Plugin } from 'vite'
import { isBun } from '../utils/isBun.js'
import { isDeno } from '../utils/isDeno.js'

export { commonConfig }

function commonConfig(): Plugin[] {
  return [
    {
      name: 'photon:commonConfig',

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
    },
  ]
}
