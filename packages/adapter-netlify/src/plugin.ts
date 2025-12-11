import createNetlifyPlugin, { type NetlifyPluginOptions } from "@netlify/vite-plugin";
import { getCatchAllEntry } from "@photonjs/store";
import type { Plugin } from "vite";

const moduleId = "photon:netlify";

export function netlify(config?: NetlifyPluginOptions): Plugin[] {
  return [
    //    {
    //       name: `${moduleId}:config`,
    //       enforce: "pre",
    //       config: {
    //         handler() {
    //           return {
    //             photon: {
    //               /**
    //                * @netlify/vite-plugin does not support code splitting yet
    //                * @see https://docs.netlify.com/build/frameworks/frameworks-api/
    //                */
    //               codeSplitting: {
    //                 target: false,
    //               },
    //               emitEntry: false,
    //             },
    //           };
    //         },
    //       },
    //     },
    //     ...targetLoader("netlify", {
    //       async load(id) {
    //         return {
    //           // language=ts
    //           code: `import entry from ${JSON.stringify(id)};
    //
    // export default {
    //   ...entry
    // };
    // export * from ${JSON.stringify(id)};`,
    //           map: { mappings: "" },
    //         };
    //       },
    //     }),
    // // Some examples in Netlify's documentation are using serverless-http for express
    // // and other node-specific frameworks compatibility, but that is not recommended by Photon.
    // supportedTargetServers("netlify", ["hono", "h3", "srvx"]),
    // TODO move to @photonjs/utils
    // Current version compiles with rou3/compiler.
    // For target supporting URLPattern, we could also provide a version with native URLPattern support.
    // Also perhaps replace the rou3/compiler by a unique concatenated regex matcher (See https://github.com/honojs/hono/blob/57f214663ec63666d5a86620928f90af472e95a4/src/router/reg-exp-router/prepared-router.ts#L156).
    //     {
    //       name: "photon:catch-all",
    //       load: {
    //         filter: {
    //           id: "virtual:photon:catch-all",
    //         },
    //         async handler() {
    //           const imports: string[] = [];
    //           const routesByKey: Record<string, string> = {};
    //           const router = createRouter<string>();
    //
    //           let i = 0;
    //           for (const meta of store.entries.values()) {
    //             const resolved = await this.resolve(meta.id);
    //             if (!resolved) {
    //               throw new Error(`Failed to resolve ${meta.id}`);
    //             }
    //
    //             // FIXME testing with rou3 patterns for now, but this will need transformation from actual URLPatternInit
    //             const rou3Path = meta.pattern as string;
    //             imports.push(`import m${i} from ${JSON.stringify(resolved)};`);
    //             routesByKey[JSON.stringify(`m${i}`)] = `m${i}`;
    //             addRoute(router, "", rou3Path, `m${i++}`);
    //           }
    //
    //           // const findRoute=(m, p) => {}
    //           const compiled = compileRouterToString(router, "findRoute");
    //
    //           //language=js
    //           return `${imports.join("\n")}
    //
    // const __map = ${JSON.stringify(routesByKey, undefined, 2)};
    //
    // ${compiled};
    //
    // export default {
    //   fetch(request) {
    //     const url = new URL(request.url);
    //     const key = findRoute("", url.pathname);
    //     if (!key) return;
    //     return __map[key].fetch(request);
    //   }
    // }`;
    //         },
    //       },
    //     },
    {
      name: `${moduleId}:apply-store`,
      apply: "build",
      enforce: "post",
      configEnvironment: {
        // Give some time to other plugins to declare an entry in the store
        order: "post",
        handler(name, env) {
          if (env.consumer !== "server" && name !== "ssr") return;
          const serverEntry = getCatchAllEntry();
          if (!serverEntry) return;

          return {
            build: {
              rollupOptions: {
                input: {
                  index: serverEntry.id,
                },
              },
            },
          };
        },
      },
    },
    // Currently, the netlify build plugin only checks bundle artifacts and looks for a unique `isEntry` chunk
    ...createNetlifyPlugin({
      ...config,
      build: {
        enabled: true,
        ...config?.build,
      },
    }),
  ];
}
