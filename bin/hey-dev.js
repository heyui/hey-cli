#!/usr/bin/env node

require('colorful').colorful();

var program = require('commander');
var task = require('../src/task');
var logger = require('../src/logger');

program
    .usage('[options]')
    .option('-p, --port', 'specify the port when dev server run')
    .option('-r, --report', 'Visualize size of webpack output files with an interactive zoomable treemap.')
    .on('-h', printHelp)
    .on('--help', printHelp)
    .parse(process.argv);

function printHelp() {
    console.log('  Examples:'.to.bold.green.color);
    console.log();
    console.log('    hey dev -p 9001    ');
    console.log();
}

var args = {
    port: program.args[0],
    report: program.report
}

logger.debug("hey dev with options: ");
logger.debug(args);

task.dev(args);
