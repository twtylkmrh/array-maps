/**
 * Created by henian.xu on 2021/4/12.
 *
 */

const fs = require('fs-extra');
const path = require('path');
const execa = require('execa');
const chalk = require('chalk');
const args = require('minimist')(process.argv.slice(2));

const resolve = (p) => path.resolve(__dirname, '..', p);

console.log(args);
const targets = args._;
const pkg = require(resolve(`package.json`));

async function build() {
  await fs.remove(resolve(`dist`));

  await execa('rollup', ['-c', '--environment', ['NODE_ENV:production']], {
    stdio: 'inherit',
  });
  console.log();
  console.log(chalk.bold(chalk.yellow(`Rolling up type definitions ...`)));

  // build types
  const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');

  const extractorConfigPath = resolve(`api-extractor.json`);
  const extractorConfig = ExtractorConfig.loadFileAndPrepare(
    extractorConfigPath,
  );

  const extractorResult = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true,
  });

  if (extractorResult.succeeded) {
    // concat additional d.ts to rolled-up dts
    const typesDir = resolve('types');
    if (await fs.exists(typesDir)) {
      const dtsPath = resolve(pkg.types);
      const existing = await fs.readFile(dtsPath, 'utf-8');
      const typeFiles = await fs.readdir(typesDir);
      const toAdd = await Promise.all(
        typeFiles.map((file) => {
          return fs.readFile(path.resolve(typesDir, file), 'utf-8');
        }),
      );
      await fs.writeFile(dtsPath, existing + '\n' + toAdd.join('\n'));
    }
    console.log(
      chalk.bold(chalk.green(`API Extractor completed successfully.`)),
    );
  } else {
    console.error(
      `API Extractor completed with ${extractorResult.errorCount} errors` +
        ` and ${extractorResult.warningCount} warnings`,
    );
    process.exitCode = 1;
  }

  await fs.remove(`./dist/src`);
}

/*async function runParallel(maxConcurrency, source, iteratorFn) {
  const ret = [];
  const executing = [];
  for (const item of source) {
    const p = Promise.resolve().then(() => iteratorFn(item, source));
    ret.push(p);

    if (maxConcurrency <= source.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
}
async function buildAll(targets) {
  await runParallel(require('os').cpus().length, targets, build);
}
async function run() {
  await buildAll();
}*/

build();
