import type { Plugin } from "vite";
import { getPhotonServerIdWithEntry } from "../../api/api.js";
import type { Photon } from "../../types.js";
import { getPhotonMeta } from "../../utils/meta.js";
import { escapeStringRegexp } from "../utils/escapeStringRegexp.js";
import type { LoadResult, PluginContext } from "../utils/rollupTypes.js";

type LoadHook = (
  this: PluginContext,
  id: string,
  options: {
    meta: Photon.EntryServer;
    ssr?: boolean;
  },
) => Promise<LoadResult> | LoadResult;

type PluginInterop = Record<string, unknown> & { name: string };

/**
 * Create plugins that will emit deployment target files.
 * A custom `load` hook needs to be provided. The generated code will need to:
 * - Load the module pointed by `id`
 * - Create the necessary code that is required by the target, wrapping and calling loaded module
 *
 * @see Cloudflare adapter for usage
 *
 * @param name Target's name, i.e. "cloudflare"
 * @param options The `load` hook
 */
export function targetLoader<T extends { load: LoadHook } & Omit<Plugin, "load" | "resolveId" | "name">>(
  name: string,
  options: T,
): PluginInterop[] {
  const prefix = `photon:${name}`;
  const re_prefix = new RegExp(`^${escapeStringRegexp(prefix)}:`);

  return [
    {
      name: `photon:target-loader:${name}:emit`,

      apply: "build",
      enforce: "post",

      // Any entry added after this hook will be ignored
      // TODO add warnings, but be careful, as entries can be added later to be emitted by other environments
      buildStart: {
        order: "post",
        handler() {
          const envName = this.environment.name;
          const photon = this.environment.config.photon;
          const isEdge = this.environment.config.resolve.conditions.some((x) =>
            ["edge-light", "worker", "workerd", "edge"].includes(x),
          );

          if (photon.defaultBuildEnv === envName) {
            this.emitFile({
              type: "chunk",
              fileName: ensureExtension(photon.server.target || photon.server.name),
              id: `${prefix}:${photon.server.id}`,
            });
          }

          // Emit handlers, each wrapped behind the server entry
          for (const entry of photon.entries) {
            if (
              (entry.env || "ssr") === envName &&
              // if framework codeSplitting is enabled or if a target has explicitely been set, emit a new entry
              (photon.codeSplitting.framework || entry.target)
            ) {
              this.emitFile({
                type: "chunk",
                fileName: ensureExtension(entry.target || entry.name),
                id: `${prefix}:${getPhotonServerIdWithEntry(isEdge ? "edge" : "node", entry.name)}`,
              });
            }
          }
        },
      },

      sharedDuringBuild: true,
    },
    {
      ...options,
      name: `photon:target-loader:${name}:load`,

      resolveId: {
        filter: {
          id: re_prefix,
        },

        async handler(id, importer, opts) {
          const resolved = await this.resolve(id.replace(re_prefix, ""), importer, opts);

          if (!resolved) {
            return this.error(`[photon][${name}] Cannot resolve ${id}`);
          }

          return {
            ...resolved,
            // tag module as target entry for other plugins to use
            meta: {
              ...resolved.meta,
              photonConfig: {
                ...resolved.meta?.photonConfig,
                isTargetEntry: true,
              },
            },
            id: `${prefix}:${resolved.id}`,
          };
        },
      },

      load: {
        filter: {
          id: re_prefix,
        },

        async handler(id, opts) {
          const originalEntryId = id.slice(prefix.length + 1);
          // At this point, all handlers are wrapped with the server entry, so the entry type is always "server"
          const meta = (await getPhotonMeta(this, id)) as Photon.EntryServer;
          return options.load.call(this, originalEntryId, {
            ...opts,
            meta,
          });
        },
      },

      sharedDuringBuild: true,
    },
  ] satisfies Plugin[];
}

function ensureExtension(id: string) {
  if (!id.match(/\.m?js$/)) {
    return `${id}.js`;
  }
  return id;
}
