import type { Plugin } from 'vite'
import { renderUrl } from '../render.js'

const virtualIndex = 'virtual:awesome-plugin:index.html'

export function awesomeFrameworkPlugin(): Plugin {
  return {
    name: 'awesome-framework',
    config() {
      return {
        ssr: {},
        builder: {
          async buildApp(builder) {
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            await builder.build(builder.environments.client!)
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            await builder.build(builder.environments.ssr!)
          },
        },
      }
    },
    configEnvironment(name) {
      if (name === 'ssr') {
        return {
          build: {
            outDir: './dist/ssr',
            emptyOutDir: false,
          },
        }
      }
      if (name === 'client') {
        return {
          build: {
            rollupOptions: {
              input: {
                index: virtualIndex,
              },
            },
            outDir: './dist/client',
          },
        }
      }
    },
    resolveId(id) {
      if (id === virtualIndex) return 'index.html'
    },
    load(id) {
      if (id === 'index.html') {
        return renderUrl('/')
      }
    },
    sharedDuringBuild: true,
  }
}
