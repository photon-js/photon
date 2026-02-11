import type { ServerOptions as SrvxServerOptions } from "srvx";

export type ServerOptions = Omit<SrvxServerOptions, "manual">;

export interface PhotonPluginOptions {
  /**
   * Path to server entry
   */
  entry: string;
}
