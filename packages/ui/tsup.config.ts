import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false,
  clean: false,
  splitting: false,
  external: ['react', 'next'],
  esbuildOptions: (options) => {
    options.banner = {
      js: '"use client";',
    }
  }
}) 