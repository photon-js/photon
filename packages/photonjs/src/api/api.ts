import type { PluginContext } from '../plugin/utils/rollupTypes.js'
import { asPhotonEntryId } from '../plugin/utils/virtual.js'
import type { Photon } from '../types.js'
import { PhotonConfigError } from '../utils/assert.js'
import { PhotonEntryBase, PhotonEntryUniversalHandler } from '../validators/validators.js'

// FIXME Omit<Photon.EntryUniversalHandler, 'name'> is sometimes not computed at all (defaulting to any)
/**
 * Registers a new Photon handler.
 * @throws {PhotonConfigError} will throw an error if a handler with this name already exists.
 */
export function addPhotonHandler(
  pluginContext: PluginContext,
  name: string,
  entry: Omit<Photon.EntryUniversalHandler, 'name'>,
) {
  if (name in pluginContext.environment.config.photon.handlers)
    throw new PhotonConfigError(`Photon handler "${name}" already exists.`)
  pluginContext.environment.config.photon.handlers[name] = PhotonEntryUniversalHandler.parse({
    ...entry,
    name,
    id: asPhotonEntryId((entry as Photon.EntryUniversalHandler).id, 'handler-entry'),
  })
}

/**
 * Frameworks and library can use this helper to register an additional configuration for the server.
 * This will then be used by compatible deployment targets to create additional output files.
 */
export function addPhotonServerConfig(
  pluginContext: PluginContext,
  config: Omit<Photon.EntryBase, 'id' | 'resolvedId'>,
) {
  pluginContext.environment.config.photon.additionalServerConfigs.push(
    PhotonEntryBase.omit({ id: true, resolvedId: true }).parse(config),
  )
}

export function getPhotonServerIdWithHandler(condition: 'dev' | 'node' | 'edge', handlerId: string) {
  return `photon:server-entry-with-handler:${condition}:${handlerId}`
}
