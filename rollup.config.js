/**
 * Created by henian.xu on 2021/4/8.
 *
 */
import Path from 'path';
import ts from 'rollup-plugin-typescript2';
import path from 'path';

const resolve = (p) => Path.resolve(__dirname, p);

const tsPlugin = ts({
  // check: process.env.NODE_ENV === 'production' && !hasTSChecked,
  tsconfig: path.resolve(__dirname, 'tsconfig.json'),
  cacheRoot: path.resolve(__dirname, 'node_modules/.rts2_cache'),
  tsconfigOverride: {
    compilerOptions: {
      sourceMap: false,
      declaration: false,
      declarationMap: false,
    },
    exclude: ['**/__tests__', 'test-dts'],
  },
});

const outputConfigs = {
  'esm-bundler': {
    file: resolve('dist/esm-bundler.js'),
    format: 'es',
  },
  cjs: {
    file: resolve('dist/cjs.js'),
    format: 'cjs',
  },
  global: {
    file: resolve('dist/global.js'),
    format: 'iife',
    name: 'arrayMaps',
  },
};

export default {
  input: resolve('src/index.ts'),
  plugins: [
    tsPlugin,
    // add
  ],
  // output: outputConfigs['esm-bundler'],
  output: outputConfigs['global'],
};
