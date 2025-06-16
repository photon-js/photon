import type { PluginContext } from '../plugin/utils/rollupTypes.js'
import { asPhotonEntryId } from '../plugin/utils/virtual.js'
import type { Photon } from "../types.js";

export function setPhotonHandler(pluginContext: PluginContext, fileName: string, entry: Photon.EntryUniversalHandler) {
  pluginContext.environment.config.photon.handlers[fileName] = {
    ...entry,
    id: asPhotonEntryId(entry.id, 'handler-entry'),
  }
}

export function getPhotonServerIdWithHandler(condition: 'dev' | 'node' | 'edge', handlerId: string) {
  return `photon:server-entry-with-handler:${condition}:${handlerId}`
}
