import { isPhotonMeta, type PhotonMeta } from '../plugin/utils/entry.js'
import type { PluginContext } from '../plugin/utils/rollupTypes.js'
import { asPhotonEntryId } from '../plugin/utils/virtual.js'
import { assertUsage, PhotonUsageError } from './assert.js'

interface HintToMeta {
  'handler-entry': Photon.EntryUniversalHandler
  'server-entry': Photon.EntryServer
}

/**
 * Retrieves Photon metadata associated with a specific entry
 */
export async function getPhotonMeta<T extends 'handler-entry' | 'server-entry' | undefined>(
  pluginContext: PluginContext,
  id: string,
  hint?: T,
): Promise<T extends 'handler-entry' | 'server-entry' ? HintToMeta[T] : PhotonMeta> {
  const actualId = hint ? asPhotonEntryId(id, hint) : id

  {
    const info = pluginContext.getModuleInfo(actualId)
    if (isPhotonMeta(info?.meta)) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      return info.meta.photon as any
    }
  }

  const resolved = await pluginContext.resolve(actualId, undefined, { isEntry: true })
  assertUsage(resolved, `Could not resolve ${actualId}`)

  if (isPhotonMeta(resolved.meta)) {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return resolved.meta.photon as any
  }

  {
    const info = pluginContext.getModuleInfo(resolved.id)
    if (isPhotonMeta(info?.meta)) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      return info.meta.photon as any
    }
  }

  throw new PhotonUsageError(`Could not find Photon meta for "${id}" (hint: ${hint})`)
}
