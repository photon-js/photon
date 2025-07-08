import { type EnhancedMiddleware, getUniversal, nameSymbol } from '@universal-middleware/core'
import { PhotonConfigError } from '../../utils/assert.js'

type ErrorMessage = (id: string, i: number) => string

export function extractUniversal(
  mi: EnhancedMiddleware | EnhancedMiddleware[],
  id: string,
  errorMessage: ErrorMessage,
) {
  return [mi]
    .flat(Number.POSITIVE_INFINITY)
    .map((x) => getUniversal(x as EnhancedMiddleware))
    .map((m, i) => {
      if (typeof m === 'function' && nameSymbol in m) {
        return m
      }
      throw new PhotonConfigError(errorMessage(id, i))
    })
}
