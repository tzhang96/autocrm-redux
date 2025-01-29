import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: {
    compilerOptions: {
      composite: false,
      incremental: false,
    }
  },
  clean: true,
  minify: false,
  splitting: false,
  sourcemap: true,
  treeshake: true,
}) 