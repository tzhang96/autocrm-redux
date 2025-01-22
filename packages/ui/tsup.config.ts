import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ['react'],
  esbuildOptions(options) {
    options.tsconfig = './tsconfig.json'
    options.banner = {
      js: '"use client";'
    }
  },
  loader: {
    '.tsx': 'tsx'
  }
}) 