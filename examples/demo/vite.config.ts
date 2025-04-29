import { readFileSync } from 'node:fs'
import { cloudflare } from '@cloudflare/vite-plugin'
import { photonjs } from '@photonjs/core/plugin'
import { isPhotonMeta } from '@photonjs/core/api'
import { defineConfig, type Plugin } from 'vite'
import { render } from './src/entry-server.js'

function simpleFrameworkPlugin(): Plugin {
  let indexHtmlAsset: any

  return {
    name: 'photon-example:dummy-framework',
    transformIndexHtml(html, ctx) {
      console.log('transformIndexHtml')
      const rendered = render(ctx.path)
      return html.replace('<!--app-html-->', rendered.html ?? '')
    },
    config() {
      return {
        ssr: {},
        builder: {
          async buildApp(builder) {
            await builder.build(builder.environments.client!)
            await builder.build(builder.environments.ssr!)
          }
        }
      }
    },
    generateBundle(_opts, bundle) {
      if (this.environment.name !== 'client') {
        indexHtmlAsset = Object.values(bundle).find((asset) => {
          return asset.type === 'chunk' && asset.name === '_index'
        })
        indexHtmlAsset.code = `const _index = ${JSON.stringify(readFileSync('./dist/client/_index.html', 'utf-8'))};
export {
  _index as default
};`
      }
    },
    configEnvironment(name) {
      if (name === 'ssr') {
        return {
          build: {
            outDir: './dist/ssr',
            rollupOptions: {
              // FIXME should be done by photon
              input: 'server.ts'
            },
            emptyOutDir: false
          }
        }
      }
      if (name === 'client') {
        return {
          build: {
            outDir: './dist/client',
            rollupOptions: {
              input: '_index.html'
            }
          }
        }
      }
    },
    sharedDuringBuild: true
  }
}

function photonCloudflarePlugin(): Plugin {
  return {
    name: 'photon-example:cloudflare',

    load(id) {
      if (isPhotonMeta) {

      }
    }
  }
}

export default defineConfig(({ mode }) => {
  return {
    appType: 'custom',
    plugins: [
      mode === 'cloudflare' ? cloudflare({ viteEnvironment: { name: 'ssr' } }) : undefined,
      mode === 'cloudflare' ? photonCloudflarePlugin() : undefined,
      photonjs({
        entry: 'server.ts',
        // Will be automatically configured by @photonjs/cloudflare
        devServer: mode === 'cloudflare' ? false : {}
      }),
      simpleFrameworkPlugin()
    ]
  }
})
