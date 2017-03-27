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
    .option('-C, --no-clean', 'disable clean before a new build')
    .on('-h', printHelp)
    .on('--help', printHelp)
    .parse(process.argv);

function printHelp() {
    console.log('  Examples:'.to.bold.green.color);
    console.log();
    console.log('    hey build -C     clean before a new build ');
    console.log();
}

var args = {
    sourcemap: !!program.sourcemap,
    clean: !!program.clean,
    uglify: !!program.uglify
}

logger.debug("hey build with options: ");

// if (program.clean) {
    // var cleanScript = path.join(__dirname, '/hey-clean.js');
    // spawn(cleanScript, {
    //     stdio: 'inherit'
    // }).on('close', (code) => {
    //     task.build(args);
    // });
// } else {
    task.build(args);
// }
