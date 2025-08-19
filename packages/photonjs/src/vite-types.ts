/// <reference types="vite" />
import type { Photon } from './types.js'

declare module 'vite' {
  interface UserConfig {
    photon?: Photon.Config | Photon.Config[]
    afterBuildStart?: boolean
  }

  interface ResolvedConfig {
    photon: Photon.ConfigResolved
  }
}
