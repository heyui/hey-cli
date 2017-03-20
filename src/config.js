'use strict';
var Utils = require('./util/utils.js');
var logger = require('./logger');
var path = require('path');
var generatorWebpackConfig = require('./generatorWebpackConfig');

function getConfig(args) {
  var conf = {};

  var json = {};
  var source = true;
  try {
    json = require(path.join(process.cwd(), 'package.json'));
  } catch (ex) {
    source = false;
  }

  if (json.hey) {
    conf = json.hey;
  } else {
    try {
      json = require(path.join(process.cwd(), 'hey.js'));
    } catch (ex) {
      source = false;
    }
  }
  if (!source) {
    logger.warn("Can't find package.json or hey.js, init system config with default. ");

  }
  var defaultConfig = require('../default/package.default.js');
  conf = Utils.extend(true, {}, defaultConfig, conf);
  //端口号从命令中获取
  if (args && args.port) {
    try {
      conf.port = parseInt(args.port);
    } catch (err) {
      logger.warn('Ignore passed error port! ');
    }
  }

  if (conf.webpack == undefined) {
    logger.warn('No webpack config!');
  }

  return conf;
}

module.exports = function(type, args) {
  var isDebug = type == 'dev';
  var config = getConfig(args);
  var webpackConf = generatorWebpackConfig(config, isDebug);
  return {config:config,webpack:webpackConf};
};
