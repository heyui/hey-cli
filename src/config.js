'use strict';
var Utils = require('./util/utils.js');
var logger = require('./logger');
var path = require('path');
var generatorWebpackConfig = require('./generatorWebpackConfig');

function getConfig(args, isDebug) {
  var conf = {};

  var json = {};
  var source = true;
  try {
    json = require(path.join(process.cwd(), 'package.json'));
  } catch (ex) {
    source = false;
  }

  if (source == true && json.hey) {
    conf = json.hey;
  } else {
    try {
      conf = require(path.join(process.cwd(), 'hey.js'));
      source = true;
    } catch (ex) {
      source = false;
    }
  }
  if (!source) {
    logger.error("Can't find package.json or hey.js, init system config with default. ");
    return;
  }
  var defaultConfig = require('./default/package.default.js');
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

  conf.root = conf.dist = conf.dist || conf.root;
  conf.webpack.root = conf.dist || conf.root;

  var timestamp = (!isDebug && conf.timestamp) ? (new Date().getTime()) : "";
  conf.staticPath = "static" + timestamp + "/";
  conf.jsPath = conf.staticPath + "js/";
  conf.cssPath = conf.staticPath + "css/";
  conf.hashString = isDebug ? '' : '.[hash:7]';

  return conf;
}

module.exports = function (type, args) {
  var isDebug = type == 'dev';
  var config = getConfig(args, isDebug);
  var webpackConf = generatorWebpackConfig(config, isDebug);
  return { config: config, webpack: webpackConf };
};
