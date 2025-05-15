import type { PluginContext } from 'rollup'
import { asPhotonEntryId } from '../plugin/utils/virtual.js'

export function setPhotonHandler(pluginContext: PluginContext, fileName: string, entry: Photon.EntryUniversalHandler) {
  pluginContext.environment.config.photon.handlers[fileName] = {
    ...entry,
    id: asPhotonEntryId(entry.id, 'handler-entry'),
  }
}
