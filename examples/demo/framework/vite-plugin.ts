import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'

export function simpleFrameworkPlugin(render: (url: string) => { html: string }): Plugin {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            await builder.build(builder.environments.client!)
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            await builder.build(builder.environments.ssr!)
          },
        },
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
            emptyOutDir: false,
          },
        }
      }
      if (name === 'client') {
        return {
          build: {
            outDir: './dist/client',
            rollupOptions: {
              input: '_index.html',
            },
          },
        }
      }
    },
    sharedDuringBuild: true,
  }
}
