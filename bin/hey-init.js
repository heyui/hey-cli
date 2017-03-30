#!/usr/bin/env node

require('colorful').colorful();

var path = require('path');
var ora = require('ora');
var home = require('user-home');
var program = require('commander');
var logger = require('../src/logger');
var generate = require('../src/util/generate');
var download = require('download-git-repo');

program
    .usage('<template-name> [project-name]')
    .parse(process.argv);

program.on('--help', function () {
    console.log('  Examples:')
    console.log()
    console.log('    # create a new project with a vue-based template')
    console.log('    $ hey init vue my-project')
    console.log()
    console.log('    # create a new project with a simple template')
    console.log('    $ hey init simple my-project')
    console.log()
})

function help () {
  program.parse(process.argv)
  if (program.args.length < 1) return program.help()
}
help()

// download template
var tmplType = program.args[0];
var rawName = program.args[1];
var inPlace = !rawName || rawName === '.';
var name = inPlace ? path.relative('../', process.cwd()) : rawName;
var to = path.resolve(rawName || '.');
var clone = program.clone || false;
var tmp = path.join(home, '.hey-template')

function downloadAndGenerate (template) {
  var spinner = ora('downloading template')
  spinner.start()
  download(template, tmp, { clone: clone }, function (err) {
    spinner.stop()
    if (err) logger.fatal('Failed to download repo ' + template + ': ' + err.message.trim())
    generate(name, tmplType, tmp, to, function (err) {
      if (err) logger.fatal(err)
      console.log()
      logger.info('Generated "%s".', name)
    })
  })
}

downloadAndGenerate('heyui/hey-template');
