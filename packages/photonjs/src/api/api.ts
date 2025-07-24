import { z } from 'zod/v4'
import type { PluginContext } from '../plugin/utils/rollupTypes.js'
import type { Photon } from '../types.js'
import { PhotonConfigError } from '../utils/assert.js'
import { entryToPhoton } from '../validators/coerce.js'
import { PhotonEntryServerConfig, PhotonEntryUniversalHandler } from '../validators/validators.js'

/**
 * Registers a new Photon entry.
 * @throws {PhotonConfigError} will throw an error if an entry with this name already exists.
 */
export function addPhotonEntry(pluginContext: PluginContext, name: string, entry: Photon.EntryPartial) {
  if (pluginContext.environment.config.photon.entries.some((e) => e.name === entry.name)) {
    throw new PhotonConfigError(`Photon entry with name "${entry.name}" already exists.`)
  }

  const parsed = z
    .union([PhotonEntryUniversalHandler, PhotonEntryServerConfig])
    .parse(entryToPhoton('handler-entry', entry, name))

  if (pluginContext.environment.config.photon.codeSplitting && parsed.type === 'server-config') {
    throw new PhotonConfigError(
      `Photon entry with name "${entry.name}" is of type "server-config" but code splitting is enabled. Please disable code splitting or use "universal-handler" instead.`,
    )
  }

  pluginContext.environment.config.photon.entries.push(parsed)
}

export function getPhotonServerIdWithHandler(condition: 'dev' | 'node' | 'edge', handlerId: string) {
  return `photon:server-entry-with-handler:${condition}:${handlerId}`
}
