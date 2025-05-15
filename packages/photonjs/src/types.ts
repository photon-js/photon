import type {
  PhotonConfig,
  PhotonConfigResolved,
  PhotonEntryBase,
  PhotonEntryServer,
  PhotonEntryUniversalHandler,
} from './validators/types.js'

declare global {
  export namespace Photon {
    export interface EntryBase extends PhotonEntryBase {}
    export interface EntryServer extends EntryBase, PhotonEntryServer {}
    export interface EntryUniversalHandler extends EntryBase, PhotonEntryUniversalHandler {}

    export type Entry = EntryServer | EntryUniversalHandler

    export interface Config extends PhotonConfig {}

    export interface ConfigResolved extends PhotonConfigResolved {}
  }
}
