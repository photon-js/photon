import { defineConfig, type Options as TsupOptions } from 'tsup'

const commonOptions: TsupOptions = {
  format: ['esm'],
  target: 'es2022',
  esbuildOptions(opts) {
    opts.outbase = 'src'
  },
  dts: true,
  outDir: 'dist',
  treeshake: true,
  removeNodeProtocol: false,
}

export default defineConfig([
  {
    ...commonOptions,
    platform: 'node',
    entry: {
      index: './src/index.ts',
      vite: './src/plugin.ts',
    },
  },
])
