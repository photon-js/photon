import type { CustomPluginOptions } from 'rollup'
import type { SupportedServers } from '../../validators/types.js'

export function isPhotonMeta(meta?: CustomPluginOptions): meta is { photon: PhotonMeta } {
  return Boolean(meta && 'photon' in meta)
}

export function isPhotonMetaConfig(meta?: CustomPluginOptions): meta is { photonConfig: PhotonMetaConfig } {
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
