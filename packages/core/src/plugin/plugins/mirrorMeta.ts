import { getUniversalProp, pathSymbol } from "@universal-middleware/core";
import { walk } from "estree-walker";
import MagicString from "magic-string";
import { createRunnableDevEnvironment, type Plugin, type RunnableDevEnvironment } from "vite";
import { assert, assertUsage } from "../../utils/assert.js";
import { createDeferred } from "../../utils/deferred.js";
import { singleton } from "../utils/dedupe.js";
import { isPhotonMeta, type PhotonMeta } from "../utils/entry.js";

export function mirrorMeta(): Plugin[] {
  let lastSsr: Promise<RunnableDevEnvironment> | undefined;
  return [
    // Extract Universal Middleware metadata and add them to Photon meta
    singleton({
      name: "photon:runtime-meta-to-photon",
      enforce: "pre",
      apply: "build",

      config() {
        return {
          environments: {
            inline_ssr: {},
          },
        };
      },

      async moduleParsed(info) {
        // Import the module in RunnableDevEnvironment during build to extract exports
        if (isPhotonMeta(info.meta) && info.meta.photon.type === "universal-handler" && !info.meta.photon.route) {
          const ssr = lastSsr
            ? await lastSsr
            : createRunnableDevEnvironment("inline_ssr", this.environment.config, {
                runnerOptions: {
                  hmr: {
                    logger: false,
                  },
                },
                hot: false,
              });
          if (!lastSsr) {
            const deferred = createDeferred<RunnableDevEnvironment>();
            lastSsr = deferred.promise;
            await ssr.init();
            deferred.resolve(ssr);
          }

          try {
            const mod = await ssr.runner.import(info.id);
            if (mod && "default" in mod) {
              const def = await mod.default;
              const route = getUniversalProp(def, pathSymbol);

              // Attached extracted runtime metadata to photon meta
              if (route) {
                info.meta.photon.route = route;
              }
            }
          } finally {
            // await ssr.runner.close()
          }
        }
      },

      async buildEnd() {
        if (lastSsr && !(await lastSsr).runner.isClosed()) {
          return (await lastSsr).runner.close();
        }
      },

      sharedDuringBuild: true,
    }),
    // Extract Photon meta of an entry, and apply them to runtime through enhance
    singleton({
      name: "photon:photon-meta-to-runtime",

      applyToEnvironment(env) {
        return !env.name.includes("inline_ssr");
      },

      transform(code, id) {
        const info = this.getModuleInfo(id);
        if (!info) return;

        if (isPhotonMeta(info.meta) && info.meta.photon.route && info.meta.photon.type === "universal-handler") {
          const ast = this.parse(code);

          const magicString = new MagicString(code);
          let hasExportDefault = false;
          let hasEnhanceImport = false;

          walk(ast, {
            enter(node) {
              if (
                !hasEnhanceImport &&
                node.type === "ImportDeclaration" &&
                typeof node.source.value === "string" &&
                node.source.value.includes("@universal-middleware/core")
              ) {
                // Check if enhance is among the imported specifiers
                for (const specifier of node.specifiers) {
                  if (
                    (specifier.type === "ImportSpecifier" &&
                      specifier.imported &&
                      "name" in specifier.imported &&
                      specifier.imported.name === "enhance") ||
                    (specifier.type === "ImportDefaultSpecifier" && specifier.local.name === "enhance")
                  ) {
                    hasEnhanceImport = true;
                  }
                }
              }

              if (node.type === "ExportAllDeclaration") {
                if (node.exported && "name" in node.exported && node.exported.name === "default") {
                  hasExportDefault = true;
                  // TODO
                  assertUsage(false, `Entry ${id}: export { ... as default } is not yet supported`);
                }
              }
              if (node.type === "ExportDefaultDeclaration") {
                hasExportDefault = true;

                // biome-ignore lint/suspicious/noExplicitAny: any
                const declarationStart: number = (node.declaration as any).start;
                // biome-ignore lint/suspicious/noExplicitAny: any
                const declarationEnd: number = (node.declaration as any).end;

                assert(declarationStart);
                assert(declarationEnd);

                // Replace the declaration with enhance call
                magicString.overwrite(
                  declarationStart,
                  declarationEnd,
                  `enhance(${code.slice(declarationStart, declarationEnd)}, {
  name: ${JSON.stringify(id)},
  method: ['GET', 'POST'],
  path: ${JSON.stringify(info.meta.photon.route)},
  context: ${JSON.stringify({ photon: photonMetaAsContext(info.meta.photon) })},
  immutable: false
})`,
                );
              }
            },
          });

          assertUsage(hasExportDefault, `Entry ${id} must have a default export`);

          if (!hasEnhanceImport) {
            magicString.prepend(
              `import { enhance } from 'virtual:photon:resolve-from-photon:@universal-middleware/core';\n`,
            );
          }

          if (!magicString.hasChanged()) return;

          return {
            code: magicString.toString(),
            map: magicString.generateMap(),
          };
        }
      },

      sharedDuringBuild: true,
    }),
  ];
}

function photonMetaAsContext(photonMeta: PhotonMeta) {
  const { id: _, resolvedId: __, ...photonMetaClean } = photonMeta;
  return photonMetaClean;
}
