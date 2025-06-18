import type { Photon } from '../../types.js'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type AnyRecord = Record<string, any>

export function isPhotonMeta<T extends AnyRecord>(meta?: T): meta is T & { photon: PhotonMeta } {
  return Boolean(meta && 'photon' in meta)
}

export function isPhotonMetaConfig<T extends AnyRecord>(meta?: T): meta is T & { photonConfig: PhotonMetaConfig } {
  return Boolean(meta && 'photonConfig' in meta)
}

export type PhotonMeta = Photon.EntryServer | Photon.EntryUniversalHandler

export interface PhotonMetaConfig {
  /**
   * If true, whenever a module with this config triggers `hotUpdate`,
   * a 'full-reload' will occur.
   */
  isGlobal?: boolean
}
