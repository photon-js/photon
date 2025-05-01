import { installPhoton } from '@photonjs/core/vite'
import type { Plugin } from 'vite'
import { awesomeFrameworkPlugin } from './awesomeFrameworkPlugin.js'

export function awesomeFramework(): Plugin[] {
  return [awesomeFrameworkPlugin(), ...installPhoton('awesome-framework', { fullInstall: true })]
}
