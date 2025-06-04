import type { SupportedServers } from '../../validators/types.js'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type AnyRecord = Record<string, any>

export function isPhotonMeta<T extends AnyRecord>(meta?: T): meta is T & { photon: PhotonMeta } {
  return Boolean(meta && 'photon' in meta)
}

export function isPhotonMetaConfig<T extends AnyRecord>(meta?: T): meta is T & { photonConfig: PhotonMetaConfig } {
  return Boolean(meta && 'photonConfig' in meta)
}

export interface PhotonMetaServer {
  type: 'server'
  server: SupportedServers
}

export interface PhotonMetaUniversalHandler {
  type: 'universal-handler'
  route?: string
}

export type PhotonMeta = PhotonMetaServer | PhotonMetaUniversalHandler

export interface PhotonMetaConfig {
  /**
   * If true, whenever a module with this config triggers `hotUpdate`,
   * a 'full-reload' will occur.
   */
  isGlobal?: boolean
}
