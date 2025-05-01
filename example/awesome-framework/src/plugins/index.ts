import { installPhoton } from '@photonjs/core/vite'
import type { Plugin } from 'vite'
import { awesomeFrameworkPlugin } from './vite-plugin.js'

export function awesomeFramework(): Plugin[] {
  return [awesomeFrameworkPlugin(), ...installPhoton('awesome-framework', { fullInstall: true })]
}
