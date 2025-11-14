import type { SrvxHandler } from "@universal-middleware/srvx";

export type BasicHandler = (request: Request) => Response | Promise<Response>;
export type Handler = BasicHandler | SrvxHandler<Universal.Context> | { fetch: BasicHandler };
