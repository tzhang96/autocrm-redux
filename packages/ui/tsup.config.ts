import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'next'],
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