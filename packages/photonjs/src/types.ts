import type {
  PhotonConfig,
  PhotonConfigResolved,
  PhotonEntryBase,
  PhotonEntryServer,
  PhotonEntryServerPartial,
  PhotonEntryUniversalHandler,
  PhotonEntryUniversalHandlerPartial,
} from './validators/types.js'

export namespace Photon {
  export interface EntryBase extends PhotonEntryBase {}
  export interface EntryServer extends EntryBase, PhotonEntryServer {}
  export interface EntryServerPartial extends Omit<EntryBase, 'name'>, PhotonEntryServerPartial {}
  export interface EntryUniversalHandler extends EntryBase, PhotonEntryUniversalHandler {}
  export interface EntryUniversalHandlerPartial extends Omit<EntryBase, 'name'>, PhotonEntryUniversalHandlerPartial {}

  export type Entry = EntryServer | EntryUniversalHandler

  export interface Config extends PhotonConfig {
    handlers?: Record<string, string | EntryUniversalHandlerPartial>
    server?: string | EntryServerPartial
    additionalServerConfigs?: Omit<EntryBase, 'id' | 'resolvedId'>[]
  }

  export interface ConfigResolved extends PhotonConfigResolved {
    handlers: Record<string, Photon.EntryUniversalHandler>
    server: Photon.EntryServer
    additionalServerConfigs: Omit<EntryBase, 'id' | 'resolvedId'>[]
  }
}
