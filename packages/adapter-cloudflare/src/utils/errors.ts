import { PhotonBugError, PhotonConfigError, PhotonDependencyError, PhotonUsageError } from '@photonjs/core/errors'

// Utility functions for common error scenarios
export function createMissingExportError(id: string): PhotonUsageError {
  return new PhotonUsageError(`Missing export default in ${JSON.stringify(id)}`)
}

export function createMissingApplyError(): PhotonUsageError {
  return new PhotonUsageError('{ apply } function needs to be called before export')
}

export function createIncompatibleServerError(server: string): PhotonConfigError {
  return new PhotonConfigError(
    `Cloudflare target is not compatible with server "${server}". We recommend using "hono" instead.`,
  )
}

export function createMissingDependencyError(dependency: string, cause?: unknown): PhotonDependencyError {
  return new PhotonDependencyError(
    `${dependency} is not installed. Please install ${dependency} to use this functionality with Cloudflare.`,
    { cause },
  )
}

export function assert(condition: unknown): asserts condition {
  if (condition) return
  throw new PhotonBugError()
}
