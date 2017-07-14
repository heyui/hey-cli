'use strict';
var Utils = require('./util/utils.js');
var logger = require('./logger');
var path = require('path');
var generatorWebpackConfig = require('./generatorWebpackConfig');

function getConfig(args, isDebug) {
  var conf = null;

  var json = {};
  var source = true;
  var error = null;

  try {
    conf = require(path.join(process.cwd(), 'hey.js'));
    source = true;
  } catch (ex) {
    error = ex;
    source = false;
  }

  if (source == false) {
    try {
      json = require(path.join(process.cwd(), 'package.json'));
      if(json.hey){
        conf = json.hey;
        source = true;
      }
    } catch (ex) {
      logger.error("Error: ", ex.toString());
      source = false;
    }
  }
  if (!source) {
    logger.error("Can't find hey.js or package.json 'hey' param. ");
    return false;
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
  if(config === false){
    return false;
  }
  
  var webpackConf = generatorWebpackConfig(config, isDebug);
  return { config: config, webpack: webpackConf };
};
