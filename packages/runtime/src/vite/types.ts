export interface PhotonPluginOptions {
  /**
   * Path to server entry
   */
  entry: string;
  /**
   * Determines how this server entry handles routing.
   *
   * @default "root"
   *
   * @description
   * - `"root"`: This entry is the main routing entry point. It handles all routing for the app.
   * - `"delegated"`: Routing is handled by an external process. This entry can be reused under multiple routes.
   */
  routingMode?: "root" | "delegated";
}
