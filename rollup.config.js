/**
 * Created by henian.xu on 2021/4/8.
 *
 */
import Path from 'path';
import ts from 'rollup-plugin-typescript2';
import path from 'path';

const resolve = (p) => Path.resolve(__dirname, p);

const isDev = process.env.NODE_ENV !== 'production';

// ensure TS checks only once for each build
let hasTSChecked = false;

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

const packageFormats = isDev ? ['global'] : Object.keys(outputConfigs);
function createConfig(format, output, plugins = []) {
  if (!output) {
    console.log(require('chalk').yellow(`invalid format: "${format}"`));
    process.exit(1);
  }

  const shouldEmitDeclarations = !isDev && !hasTSChecked;

  const tsPlugin = ts({
    // check: process.env.NODE_ENV === 'production' && !hasTSChecked,
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    cacheRoot: path.resolve(__dirname, 'node_modules/.rts2_cache'),
    tsconfigOverride: {
      compilerOptions: {
        sourceMap: false,
        declaration: shouldEmitDeclarations,
        declarationMap: shouldEmitDeclarations,
      },
      exclude: ['**/__tests__', 'test-dts'],
    },
  });
  // we only need to check TS and generate declarations once for each build.
  // it also seems to run into weird issues when checking multiple times
  // during a single build.
  hasTSChecked = true;

  return {
    input: resolve('src/index.ts'),
    plugins: [
      tsPlugin,
      ...plugins,
      // add
    ],
    // output: outputConfigs['esm-bundler'],
    output: output,
  };
}

function createMinifiedConfig(format) {
  const { terser } = require('rollup-plugin-terser');
  return createConfig(
    format,
    {
      file: outputConfigs[format].file.replace(/\.js$/, '.prod.js'),
      format: outputConfigs[format].format,
    },
    [
      terser({
        module: /^esm/.test(format),
        compress: {
          ecma: 2015,
          pure_getters: true,
        },
        safari10: true,
      }),
    ],
  );
}

function createProductionConfig(format) {
  return createConfig(format, {
    file: resolve(`dist/${format}.prod.js`),
    format: outputConfigs[format].format,
  });
}
const packageConfigs = packageFormats.map((format) =>
  createConfig(format, outputConfigs[format]),
);

if (!isDev) {
  packageFormats.forEach((format) => {
    if (format === 'cjs') {
      packageConfigs.push(createProductionConfig(format));
    }
    if (/^(global|esm-browser)(-runtime)?/.test(format)) {
      packageConfigs.push(createMinifiedConfig(format));
    }
  });
}
export default packageConfigs;
