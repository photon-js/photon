import type { PluginContext } from 'rollup'
import { asPhotonEntryId } from '../plugin/utils/virtual.js'

export function setPhotonHandler(pluginContext: PluginContext, fileName: string, entry: Photon.EntryUniversalHandler) {
  pluginContext.environment.config.photon.handlers[fileName] = {
    ...entry,
    id: asPhotonEntryId(entry.id, 'handler-entry'),
  }
}

export function getPhotonServerEntryId(
  pluginContext: PluginContext,
  opts?: { handlerId: string; condition: 'dev' | 'node' | 'edge' },
) {
  if (!opts) {
    return pluginContext.environment.config.photon.server.id
  }
  return `${pluginContext.environment.config.photon.server.id}?photonCondition=${opts.condition}&photonHandlerId=${opts.handlerId}`
}
