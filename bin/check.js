#!/usr/bin/env node --no-warnings
const { program } = require('commander');
const packageJSON = require('../package.json');
const score = require('../dist').default;
let options = {};

program.version(packageJSON.version);
program
  .arguments('<pkg>')
  .description('Check package score.', {
    package: 'Package.json'
  })
  .action(function (pkg) {
    options.package = pkg;
  });
  
program.parse(process.argv);

options = Object.assign(options, program.opts());

const main = async () => {
  const result = await score(options.package);
  console.log(JSON.stringify(result, null, 4));
};

main();
