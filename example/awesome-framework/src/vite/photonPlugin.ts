import { installPhoton } from '@photonjs/core/vite'
import type { Plugin } from 'vite'

export function photonPlugin(): Plugin[] {
  return installPhoton('awesome-framework', {
    fullInstall: true,
    resolveMiddlewares() {
      return 'awesome-framework/universal-middleware'
    },
  })
}
