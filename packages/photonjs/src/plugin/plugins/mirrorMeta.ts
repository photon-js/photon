import { getUniversalProp, pathSymbol } from '@universal-middleware/core'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { createRunnableDevEnvironment, type Plugin } from 'vite'
import { assert, assertUsage } from '../../utils/assert.js'
import type { PhotonEntryServer } from '../../validators/types.js'
import { isPhotonMeta } from '../utils/entry.js'

export function mirrorMeta(): Plugin[] {
  return [
    // Extract Universal Middleware metadata and add them to Photon meta
    {
      name: 'photon:runtime-meta-to-photon',
      enforce: 'pre',
      apply: 'build',

      async moduleParsed(info) {
        // Import the module in RunnableDevEnvironment during build to extract exports
        if (isPhotonMeta(info.meta) && info.meta.photon.type === 'universal-handler' && !info.meta.photon.route) {
          const ssr = createRunnableDevEnvironment('inline_ssr', this.environment.config, {
            runnerOptions: {
              hmr: {
                logger: false,
              },
            },
            hot: false,
          })
          await ssr.init()

          try {
            const mod = await ssr.runner.import(info.id)
            if (mod && 'default' in mod) {
              const def = await mod.default
              const route = getUniversalProp(def, pathSymbol)

              // Attached extracted runtime metadata to photon meta
              if (route) {
                info.meta.photon.route = route
              }
            }
          } finally {
            await ssr.runner.close()
          }
        }
      },

      sharedDuringBuild: true,
    },
    // Extract Photon meta of an entry, and apply them to runtime through enhance
    {
      name: 'photon:photon-meta-to-runtime',

      applyToEnvironment(env) {
        return env.name !== 'inline_ssr'
      },

      transform(code, id) {
        const info = this.getModuleInfo(id)
        if (!info) return

        if (isPhotonMeta(info.meta) && (info.meta.photon as PhotonEntryServer).route) {
          const ast = this.parse(code)

          const magicString = new MagicString(code)
          let hasExportDefault = false
          let hasEnhanceImport = false

          walk(ast, {
            enter(node) {
              if (
                !hasEnhanceImport &&
                node.type === 'ImportDeclaration' &&
                node.source.value === '@universal-middleware/core'
              ) {
                // Check if enhance is among the imported specifiers
                for (const specifier of node.specifiers) {
                  if (
                    (specifier.type === 'ImportSpecifier' &&
                      specifier.imported &&
                      'name' in specifier.imported &&
                      specifier.imported.name === 'enhance') ||
                    (specifier.type === 'ImportDefaultSpecifier' && specifier.local.name === 'enhance')
                  ) {
                    hasEnhanceImport = true
                  }
                }
              }

              if (node.type === 'ExportAllDeclaration') {
                if (node.exported && 'name' in node.exported && node.exported.name === 'default') {
                  hasExportDefault = true
                  // TODO
                  assertUsage(false, `Entry ${id}: export { ... as default } is not yet supported`)
                }
              }
              if (node.type === 'ExportDefaultDeclaration') {
                hasExportDefault = true

                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                const declarationStart: number = (node.declaration as any).start
                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                const declarationEnd: number = (node.declaration as any).end

                assert(declarationStart)
                assert(declarationEnd)

                // Replace the declaration with enhance call
                magicString.overwrite(
                  declarationStart,
                  declarationEnd,
                  `enhance(${code.slice(declarationStart, declarationEnd)}, {
  name: ${JSON.stringify(id)},
  method: ['GET', 'POST'],
  path: ${JSON.stringify(info.meta.photon.route)},
  immutable: false
})`,
                )
              }
            },
          })

          assertUsage(hasExportDefault, `Entry ${id} must have a default export`)

          if (!hasEnhanceImport) {
            magicString.prepend(`import { enhance } from '@universal-middleware/core';\n`)
          }

          return {
            code: magicString.toString(),
            map: magicString.generateMap(),
          }
        }
      },

      sharedDuringBuild: true,
    },
  ]
}
