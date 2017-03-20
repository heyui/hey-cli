var path = require('path'),
    spawn = require('cross-spawn');

var npmRoot = spawn.sync('npm', ['root', '-g']);
var paths = npmRoot.stdout.toString().split(path.sep);
paths.pop();

module.exports = paths;