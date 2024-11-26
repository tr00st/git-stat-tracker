import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: ['src/index.ts', 'src/utils/buildHelp.ts'],
  output: {
    dir: 'dist',
    format: 'es',
    preserveModules: true, // This keeps your file structure
    entryFileNames: '[name].js'
  },
  plugins: [
    commonjs({
      // This helps with default imports from CommonJS modules
      defaultIsModuleExports: true
    }),
    typescript({
      tsconfig: './tsconfig.json'
    }),
    nodeResolve(),
    json()
  ],
  external: [
    /node_modules/
  ]
}
