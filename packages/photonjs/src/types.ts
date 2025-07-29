import type {
  PhotonConfig,
  PhotonConfigResolved,
  PhotonEntryBase,
  PhotonEntryPartial,
  PhotonEntryServer,
  PhotonEntryServerConfig,
  PhotonEntryServerPartial,
  PhotonEntryUniversalHandler,
} from './validators/types.js'

export namespace Photon {
  export interface EntryBase extends PhotonEntryBase {}
  export interface EntryServer extends EntryBase, PhotonEntryServer {}
  export interface EntryServerPartial extends Omit<EntryBase, 'name'>, PhotonEntryServerPartial {}
  export interface EntryServerConfig extends Omit<EntryBase, 'id'>, PhotonEntryServerConfig {}
  export interface EntryPartial extends Omit<EntryBase, 'id' | 'name'>, PhotonEntryPartial {}
  export interface EntryUniversalHandler extends EntryBase, PhotonEntryUniversalHandler {}

  export type Entry = EntryServer | EntryUniversalHandler | EntryServerConfig

  export interface Config extends PhotonConfig {
    server?: string | EntryServerPartial
    entries?: Record<string, string | EntryPartial>
  }

  export interface ConfigResolved extends PhotonConfigResolved {
    server: EntryServer
    entries: (EntryUniversalHandler | EntryServerConfig)[]
  }
}
