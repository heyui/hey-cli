#!/usr/bin/env node

require('colorful').colorful();
var program = require('commander');
var task = require('../src/task');
var logger = require('../src/logger');
var path = require('path');
var spawn = require('cross-spawn');
var exec = require('child_process').exec;

program
  .usage('[options]')
  .option('-C, --clean', 'clean before a new build')
  .option('-f, --file [value]', 'define the config file')
  .option('-r, --report', 'Visualize size of webpack output files with an interactive zoomable treemap.')
  .on('-h', printHelp)
  .on('--help', printHelp)
  .parse(process.argv);

function printHelp() {
  console.log('  Examples:'.to.bold.green.color);
  console.log();
  console.log('    hey build -C    clean before a new build ');
  console.log();
}

var args = {
  sourcemap: !!program.sourcemap,
  clean: !!program.clean,
  uglify: !!program.uglify,
  file: program.file,
  report: !!program.report
}

logger.debug("hey build with options: ");

task.build(args);