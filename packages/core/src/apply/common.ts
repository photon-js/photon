import {
  type EnhancedMiddleware,
  getUniversalProp,
  nameSymbol,
  type UniversalHandler,
  type UniversalMiddleware,
} from "@universal-middleware/core";
import { extractUniversal } from "../plugin/utils/universal.js";

function errorMessageMiddleware(_id: string, index: number) {
  return `Additional middleware at index ${index} default export must respect the following type: UniversalMiddleware | UniversalMiddleware[]. Each individual middleware must be wrapped with enhance helper. See https://universal-middleware.dev/helpers/enhance`;
}

type Apply<App> = (app: App, middlewares: EnhancedMiddleware[]) => void;
type AsyncApply<App> = (app: App, middlewares: EnhancedMiddleware[]) => Promise<void>;

export function createApply<App>(
  server: string,
  applyAdapter: Apply<App>,
  getUniversalEntries: () => UniversalHandler[],
  getUniversalMiddlewares: () => UniversalMiddleware[],
  devServerMiddleware?: () => UniversalMiddleware,
) {
  return function apply<T extends App>(app: T, additionalMiddlewares?: UniversalMiddleware[]): T {
    const middlewares = getUniversalMiddlewares();
    const entries = getUniversalEntries();
    if (devServerMiddleware) {
      middlewares.unshift(devServerMiddleware());
    }

    // dedupe
    if (additionalMiddlewares) {
      for (const middleware of extractUniversal(additionalMiddlewares, "", errorMessageMiddleware)) {
        const i = middlewares.findIndex(
          (m) => getUniversalProp(m, nameSymbol) === getUniversalProp(middleware, nameSymbol),
        );
        if (i !== -1) {
          middlewares.splice(i, 1);
        }
        middlewares.push(middleware);
      }
    }

    applyAdapter(app, [...middlewares, ...entries]);

    // biome-ignore lint/suspicious/noExplicitAny: any
    (app as any)[Symbol.for("photon:server")] = server;

    return app;
  };
}

export function createAsyncApply<App>(
  server: string,
  applyAdapter: AsyncApply<App>,
  getUniversalEntries: () => UniversalHandler[],
  getUniversalMiddlewares: () => UniversalMiddleware[],
  devServerMiddleware?: () => UniversalMiddleware,
) {
  return async function apply<T extends App>(app: T, additionalMiddlewares?: UniversalMiddleware[]): Promise<T> {
    const middlewares = getUniversalMiddlewares();
    const entries = getUniversalEntries();
    if (devServerMiddleware) {
      middlewares.unshift(devServerMiddleware());
    }

    // dedupe
    if (additionalMiddlewares) {
      for (const middleware of extractUniversal(additionalMiddlewares, "", errorMessageMiddleware)) {
        const i = middlewares.findIndex(
          (m) => getUniversalProp(m, nameSymbol) === getUniversalProp(middleware, nameSymbol),
        );
        if (i !== -1) {
          middlewares.splice(i, 1);
        }
        middlewares.push(middleware);
      }
    }

    await applyAdapter(app, [...middlewares, ...entries]);

    // biome-ignore lint/suspicious/noExplicitAny: any
    (app as any)[Symbol.for("photon:server")] = server;

    return app;
  };
}
