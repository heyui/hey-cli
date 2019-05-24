#!/usr/bin/env node

require('colorful').colorful();

var program = require('commander');
var task = require('../src/task');

program
    .usage('[options]')
    .option('-p, --port [value]', 'specify the port when dev server run')
    .option('-f, --file [value]', 'define the config file')
    .on('-h', printHelp)
    .on('--help', printHelp)
    .parse(process.argv);

function printHelp() {
    console.log('  Examples:'.to.bold.green.color);
    console.log();
    console.log('    hey report -p 9001 -f dist/stat.json    ');
    console.log();
}

var args = {
    port: program.port ? parseInt(program.port) : 8888,
    file: program.file || 'dist/stat.json'
}

task.report(args);
