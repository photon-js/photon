export {
  assert,
  assertUsage,
  PhotonError,
  PhotonBugError,
  PhotonUsageError,
  PhotonConfigError,
  PhotonRuntimeError,
  PhotonDependencyError,
}

import pc from '@brillout/picocolors'

/**
 * Base class for all PhotonJS errors
 */
abstract class PhotonError extends Error {
  protected constructor(category: string, message: string, options?: ErrorOptions) {
    super(`${red(`[photon][${category}]`)} ${message}`, options)
    this.name = this.constructor.name
  }
}

/**
 * Internal PhotonJS bugs that should be reported to maintainers
 */
class PhotonBugError extends PhotonError {
  constructor(message?: string, options?: ErrorOptions) {
    const defaultMessage =
      'You stumbled upon a PhotonJS bug. Reach out on GitHub and copy-paste this error — a maintainer will fix the bug.'
    super('Bug', `${message || defaultMessage}`, options)
  }
}

/**
 * User errors due to incorrect usage
 */
class PhotonUsageError extends PhotonError {
  constructor(message: string, options?: ErrorOptions) {
    super('Wrong Usage', message, options)
  }
}

/**
 * Configuration errors
 */
class PhotonConfigError extends PhotonError {
  constructor(message: string, options?: ErrorOptions) {
    super('Config Error', message, options)
  }
}

/**
 * Runtime errors during execution
 */
class PhotonRuntimeError extends PhotonError {
  constructor(message: string, options?: ErrorOptions) {
    super('Runtime Error', message, options)
  }
}

/**
 * Missing dependency errors
 */
class PhotonDependencyError extends PhotonError {
  constructor(message: string, options?: ErrorOptions) {
    super('Dependency Error', message, options)
  }
}

function assert(condition: unknown): asserts condition {
  if (condition) return
  throw new PhotonBugError()
}

function assertUsage(condition: unknown, message: string): asserts condition {
  if (condition) return
  throw new PhotonUsageError(message)
}

function red(str: string) {
  return pc.red(pc.bold(str))
}
