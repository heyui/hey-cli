#!/usr/bin/env node

require('colorful').colorful();
var List = require('prompt-list');

var path = require('path');
var ora = require('ora');
var home = require('user-home');
var program = require('commander');
var logger = require('../src/logger');
var generate = require('../src/util/generate');
var download = require('download-git-repo');

program
  .usage('<project-name>')
  .parse(process.argv);

program.on('--help', function () {
  console.log()
  console.log('    # create a new project with a template')
  console.log('    - template: Simple');
  console.log('    - template: HeyUI');
  console.log('    - template: Vue');
  console.log('    - template: React');
  console.log('    - template: ElementUI');
  console.log('    - template: iViewUI');
  console.log()
})

function help() {
  program.parse(process.argv)
  if (program.args.length < 1) return program.help()
}
help()

var enquirer = new List({
  name: 'Templates',
  message: 'Which template would you like to choose?',
  choices: [
    'Simple',
    'HeyUI',
    'Vue',
    'React',
    'ElementUI',
    'iViewUI'
  ]
});

enquirer.run()
.then(function(answers) {
  logger.info('Use Template ' + answers);
  // download template
  var tmplType = answers.toLowerCase();
  var rawName = program.args[0];
  var inPlace = !rawName || rawName === '.';
  var name = inPlace ? path.relative('../', process.cwd()) : rawName;
  var to = path.resolve(rawName || '.');
  var clone = program.clone || false;
  var tmp = path.join(home, '.hey-cli-template')

  function downloadAndGenerate(template) {
    var spinner = ora('downloading template....')
    spinner.start()
    download('github:'+template, tmp, { clone: clone }, function (err) {
      spinner.stop()
      if (err){
        logger.fatal('Failed to download repo ' + template + ': ' + err.message.trim())
        return;
      }
      generate(name, tmplType, tmp, to, function (err) {
        if (err) logger.fatal(err)
        logger.info('Project %s generation success.', name);
        console.log('====================================');
        console.log('  cd %s', name);
        console.log('  npm install');
        console.log('  hey dev');
        console.log('====================================');
      })
    })
  }

  downloadAndGenerate('heyui/hey-cli-template');
})
.catch(function(err) {
  console.log(err);
});
