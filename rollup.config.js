// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";

export default {
  input: 'src/frontend.ts',
  output: {
    format: 'iife',
    name: 'spc',
    file: './.tmp/build/PBISPC.js'
  },
  plugins: [
    typescript({ tsconfig: 'tsconfig.json' }),
    json(),
    nodeResolve({ browser: true }),
    commonjs(),
    terser()
  ]
};
