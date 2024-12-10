import { defineConfig } from 'tsup';

export default defineConfig([
  {
    dts: true,
    entry: {
      'respondable-event': './src/index.ts'
    },
    format: ['cjs', 'esm'],
    sourcemap: true,
    target: 'esnext'
  }
]);
