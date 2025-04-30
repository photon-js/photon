import type { PluginContext } from 'rollup'
import { asPhotonEntryId } from '../plugin/utils/entry.js'

export function setPhotonEntry(pluginContext: PluginContext, fileName: string, entry: Photon.Entry) {
  pluginContext.environment.config.photon.entry[fileName] = {
    ...entry,
    id: asPhotonEntryId(entry.id),
  }
}
