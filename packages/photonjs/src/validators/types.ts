import type { z } from 'zod/v4'
import type * as Validators from './validators.js'

export type SupportedServers = z.infer<typeof Validators.SupportedServers>

export type PhotonEntryServer = z.infer<typeof Validators.PhotonEntryServer>
export type PhotonEntryServerPartial = z.infer<typeof Validators.PhotonEntryServerPartial>
export type PhotonEntryUniversalHandler = z.infer<typeof Validators.PhotonEntryUniversalHandler>
export type PhotonEntryUniversalHandlerPartial = z.infer<typeof Validators.PhotonEntryUniversalHandlerPartial>
export type PhotonEntryBase = z.infer<typeof Validators.PhotonEntryBase>

export type PhotonConfig = z.infer<typeof Validators.PhotonConfig>

export type PhotonConfigResolved = z.infer<typeof Validators.PhotonConfigResolved>

export type GetPhotonCondition = Validators.GetPhotonCondition
