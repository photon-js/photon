import type { Plugin } from "vite";
import { getPhotonMeta } from "../../utils/meta.js";
import { singleton } from "../utils/dedupe.js";
import type { PluginContext } from "../utils/rollupTypes.js";
import { ifPhotonModule } from "../utils/virtual.js";

async function getAllPhotonMiddlewares(
  pluginContext: PluginContext,
  condition: "dev" | "edge" | "node",
  server: string,
  handlerId?: string,
) {
  const isDev = condition === "dev";
  const defaultBuildEnv = pluginContext.environment.config.photon.defaultBuildEnv;
  const currentEnv = pluginContext.environment.name;

  const metaHandler = handlerId ? await getPhotonMeta(pluginContext, handlerId, "handler-entry") : null;

  // middlewares
  const getMiddlewares = pluginContext.environment.config.photon.middlewares ?? [];
  const middlewares =
    metaHandler?.compositionMode === "isolated"
      ? []
      : getMiddlewares
          .map((m) => m.call(pluginContext, condition as "dev" | "node" | "edge", server))
          .filter((x) => typeof x === "string" || Array.isArray(x))
          .flat(1);

  // handlers
  let universalEntries = pluginContext.environment.config.photon.entries.filter((e) => e.type === "universal-handler");
  if (!isDev) {
    // Only inject entries for the current environment
    universalEntries = universalEntries.filter((h) => (h.env || defaultBuildEnv) === currentEnv);
    if (pluginContext.environment.config.photon.codeSplitting.target) {
      // Do not inject isolated entries when target supports code splitting
      universalEntries = universalEntries.filter((h) => h.compositionMode !== "isolated");
    }
  }
  const universalEntriesIds = metaHandler ? [metaHandler.id] : universalEntries.map((e) => e.id);

  //language=javascript
  return `
import { getUniversal, nameSymbol } from 'virtual:photon:resolve-from-photon:@universal-middleware/core';
import { PhotonConfigError } from 'virtual:photon:resolve-from-photon:@photonjs/core/errors';
${middlewares.map((m, i) => `import m${i} from ${JSON.stringify(m)};`).join("\n")}
${universalEntriesIds.map((m, i) => `import u${i} from ${JSON.stringify(m)};`).join("\n")}

function errorMessageMiddleware(id) {
  return \`"\${id}" default export must respect the following type: UniversalMiddleware | UniversalMiddleware[]. Each individual middleware must be wrapped with enhance helper. See https://universal-middleware.dev/helpers/enhance\`
}

function errorMessageEntry(id) {
  return \`"\${id}" default export must respect the following type: UniversalHandler. Make sure this entry have a route defined through Photon config or through enhance helper (https://universal-middleware.dev/helpers/enhance)\`
}

export function extractUniversal(mi, id, errorMessage) {
  return [mi]
    .flat(Number.POSITIVE_INFINITY)
    .map(getUniversal)
    .map((m, i) => {
      if (typeof m === 'function' && nameSymbol in m) {
        return m;
      }
      throw new PhotonConfigError(errorMessage(id, i));
    }
  );
}

export function getUniversalMiddlewares() {
  return [${middlewares.map((m, i) => `extractUniversal(m${i}, ${JSON.stringify(m)}, errorMessageMiddleware)`).join(", ")}].flat(1);
}

export function getUniversalEntries() {
  return [${universalEntriesIds.map((m, i) => `extractUniversal(u${i}, ${JSON.stringify(m)}, errorMessageEntry)`).join(", ")}].flat(1);
}
`;
}

export function getMiddlewaresPlugin(): Plugin[] {
  return [
    singleton({
      name: "photon:get-middlewares",

      async resolveId(id, _importer, opts) {
        return ifPhotonModule("get-middlewares", id, () => ({
          id,
          moduleSideEffects: false,
          meta: {
            photonHandler: opts.attributes.photonHandler,
          },
        }));
      },

      load(id) {
        return ifPhotonModule("get-middlewares", id, async ({ condition, server, handler }) => {
          return {
            code: await getAllPhotonMiddlewares(this, condition as "dev" | "edge" | "node", server, handler),
            map: { mappings: "" } as const,
          };
        });
      },
    }),
  ];
}
