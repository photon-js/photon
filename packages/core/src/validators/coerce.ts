import { isBun } from "../plugin/utils/isBun.js";
import { isDeno } from "../plugin/utils/isDeno.js";
import { asPhotonEntryId } from "../plugin/utils/virtual.js";
import type { Photon } from "../types.js";
import { assert, PhotonConfigError } from "../utils/assert.js";
import type { PhotonConfig, PhotonEntryPartial, PhotonEntryServerPartial } from "./types.js";
import * as Validators from "./validators.js";

export function entryToPhoton(
  defaultType: "server-entry",
  entry: string | PhotonEntryServerPartial,
  name: "index",
): Photon.EntryServer;
export function entryToPhoton(
  defaultType: "handler-entry",
  entry: string | PhotonEntryPartial,
  name: string,
): Photon.EntryUniversalHandler | Photon.EntryServerConfig;
export function entryToPhoton(
  defaultType: "server-entry" | "handler-entry",
  entry: string | PhotonEntryServerPartial | PhotonEntryPartial,
  name: string,
): Photon.Entry {
  assert(name);
  if (typeof entry === "string") {
    return {
      id: asPhotonEntryId(entry, defaultType),
      name,
      type: defaultType === "server-entry" ? "server" : "universal-handler",
    };
  }
  if (entry.type === "server-config" || entry.id === "virtual:photon:server-entry" || !entry.id) {
    return {
      ...entry,
      id: "virtual:photon:server-entry",
      type: "server-config",
      name,
    };
  }
  return {
    ...entry,
    id: asPhotonEntryId(entry.id, defaultType),
    type: defaultType === "server-entry" ? "server" : "universal-handler",
    name,
  };
}

function entriesToPhoton(
  entries: PhotonConfig["entries"],
): (Photon.EntryUniversalHandler | Photon.EntryServerConfig)[] {
  return Object.entries(entries ?? {}).map(([key, value]) => entryToPhoton("handler-entry", value, key));
}

function excludeTrue<T>(v: T): Partial<Exclude<T, true>> {
  if (v === true) return {};
  return v as Exclude<T, true>;
}

const resolver = Validators.PhotonConfig.transform((c) => {
  return Validators.PhotonConfigResolved.parse({
    // Allows Photon targets to add custom options
    ...c,
    entries: entriesToPhoton(c.entries),
    server: c.server
      ? entryToPhoton("server-entry", c.server, "index")
      : entryToPhoton(
          "server-entry",
          {
            id: "virtual:photon:fallback-entry",
            type: "server",
            server: "srvx",
          },
          "index",
        ),
    devServer:
      c.devServer === false
        ? false
        : {
            env: excludeTrue(c.devServer)?.env ?? "ssr",
            autoServe: excludeTrue(c.devServer)?.autoServe ?? true,
          },
    middlewares: c.middlewares ?? [],
    codeSplitting: {
      framework: c.codeSplitting?.framework ?? true,
      target: c.codeSplitting?.target ?? false,
    },
    defaultBuildEnv: c.defaultBuildEnv ?? "ssr",
    hmr: c.hmr ?? (isBun || isDeno ? "prefer-restart" : true),
    target: c.target ?? "node",
  });
});

export function mergePhotonConfig(configs: Photon.Config[]): Photon.Config {
  const resolving: Photon.Config = {};
  resolving.entries = {};
  resolving.middlewares = [];
  resolving.codeSplitting = {};
  for (const config of configs) {
    // server
    if (config.server) {
      resolving.server = config.server;
    }

    // entries
    // Check for duplicate entries
    if (config.entries) {
      const names = new Set<string>();
      for (const name of [...Object.keys(resolving.entries), ...Object.keys(config.entries)]) {
        if (names.has(name)) {
          throw new PhotonConfigError(`Duplicate entry name: ${name}`);
        }
        names.add(name);
      }
      Object.assign(resolving.entries, config.entries);
    }

    // middlewares
    if (config.middlewares) {
      resolving.middlewares.push(...config.middlewares);
    }

    // devServer
    // if devServer has already been set to false, keep it that way
    if (resolving.devServer !== false) {
      if (config.devServer === false) {
        resolving.devServer = false;
      } else if (config.devServer) {
        resolving.devServer = config.devServer;
      }
    }

    // hmr
    if (typeof config.hmr !== "undefined") {
      resolving.hmr = config.hmr;
    }

    // codeSplitting
    // if codeSplitting has already been set to false, keep it that way
    if (resolving.codeSplitting.framework !== false) {
      if (typeof config.codeSplitting?.framework !== "undefined") {
        resolving.codeSplitting.framework = config.codeSplitting.framework;
      }
    }
    if (resolving.codeSplitting.target !== false) {
      if (typeof config.codeSplitting?.target !== "undefined") {
        resolving.codeSplitting.target = config.codeSplitting.target;
      }
    }

    if (config.defaultBuildEnv) {
      resolving.defaultBuildEnv = config.defaultBuildEnv;
    }
  }
  return resolving;
}

export function resolvePhotonConfig(config: Photon.Config | Photon.Config[] | undefined): Photon.ConfigResolved {
  const _config: Photon.Config | undefined = Array.isArray(config) ? mergePhotonConfig(config) : config;
  return resolver.parse(_config ?? {});
}
