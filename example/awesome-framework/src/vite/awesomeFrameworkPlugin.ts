import { addEntry } from "@universal-deploy/store";
import type { Plugin } from "vite";
import { renderUrl } from "../renderUrl.js";

const virtualIndex = "virtual:awesome-plugin:index.html";
const virtualIndexSsr = "virtual:awesome-plugin:index-js";

let clientHtml = "";
export function awesomeFrameworkPlugin(): Plugin[] {
  return [
    {
      name: "awesome-framework",
      config() {
        addEntry({
          id: "awesome-framework/entries/api",
          route: "/api",
          method: "GET",
        });
        addEntry({
          id: "awesome-framework/entries/ssr",
          route: "/**",
          method: "GET",
        });

        return {
          ssr: {
            noExternal: ["awesome-framework"],
          },
          builder: {
            async buildApp(builder) {
              // biome-ignore lint/style/noNonNullAssertion: exists
              await builder.build(builder.environments.client!);
              // biome-ignore lint/style/noNonNullAssertion: exists
              await builder.build(builder.environments.ssr!);
            },
          },
        };
      },
      configEnvironment(name, config) {
        if (config.consumer === "server" || name === "ssr") {
          return {
            optimizeDeps: {
              // awesome-framework is an ESM package, so no need to optimize it
              exclude: ["awesome-framework"],
            },
            build: {
              outDir: config.build?.outDir ?? "./dist/server",
              emptyOutDir: false,
            },
          };
        }
        return {
          build: {
            rollupOptions: {
              input: {
                index: virtualIndex,
              },
            },
            outDir: config.build?.outDir ?? "./dist/client",
          },
        };
      },
      resolveId(id) {
        if (id === virtualIndex) {
          return "index.html";
        }
        if (id === virtualIndexSsr) {
          return virtualIndexSsr;
        }
      },
      transformIndexHtml: {
        handler(html) {
          clientHtml = html;
          return html;
        },
      },
      async load(id) {
        if (id === "index.html") {
          return renderUrl("/");
        }
        if (id === virtualIndexSsr) {
          if (this.environment.config.command === "serve") {
            clientHtml = renderUrl("/");
          }
          return `export default ${JSON.stringify(clientHtml)};`;
        }
      },
      sharedDuringBuild: true,
    },
  ];
}
