'use strict';
var Utils = require('./util/utils.js');
var logger = require('./logger');
var path = require('path');
var generatorWebpackConfig = require('./generatorWebpackConfig');

function getConfig(args, isDebug, type) {
  var config = null;

  var json = {};
  var source = false;
  var error = null;
  if(args.file) {
    try {
      config = require(path.join(process.cwd(), args.file));
      source = true;
    } catch (ex) {
      error = ex;
      logger.error("Error: ", ex.toString());
      source = false;
    }
    if(source==false) {
      return false;
    }
  }

  if (source == false) {
    try {
      config = require(path.join(process.cwd(), 'hey.js'));
      source = true;
    } catch (ex) {
      error = ex;
      source = false;
    }
  }

  if (source == false) {
    try {
      config = require(path.join(process.cwd(), 'hey.conf.js'));
      source = true;
    } catch (ex) {
      error = ex;
      source = false;
    }
  }

  if (source == false) {
    try {
      json = require(path.join(process.cwd(), 'package.json'));
      if(json.hey){
        config = json.hey;
        source = true;
      }
    } catch (ex) {
      logger.error("Error: ", ex.toString());
      source = false;
    }
  }

  if (!source) {
    logger.error("Can't find "+ (args.file ? (args.file+" or"):'') +" hey.config.js or package.json 'hey' param. ");
    return false;
  }

  var defaultConfig = require('./default/package.default.js');
  config = Utils.extend(true, {}, defaultConfig, config);
  //端口号从命令中获取
  if (args && args.port) {
    try {
      config.port = parseInt(args.port);
    } catch (err) {
      logger.warn('Ignore passed error port! ');
    }
  }

  if (config.webpack == undefined) {
    logger.warn('No webpack config!');
  }

  config.report = args && args.report

  config.root = config.dist = config.dist || config.root;
  config.webpack.root = config.dist || config.root;
  config.webpack.compress = config.webpack.compress === false ? false : true;
  config.webpack.mode = config.webpack.mode || type;

  var timestamp = (!isDebug && config.timestamp) ? (new Date().getTime()) : "";
  config.staticPath = "static" + timestamp + "/";
  config.jsPath = config.staticPath + "js/";
  config.cssPath = config.staticPath + "css/";
  config.hashString = isDebug ? '' : '.[hash:7]';
  config.analyzerPort = config.port + 100;

  return config;
}

module.exports = function (type, args) {
  var isDebug = type == 'development';
  var config = getConfig(args, isDebug, type);
  if(config === false){
    return false;
  }
  
  var webpackConf = generatorWebpackConfig(config, isDebug);
  return { config: config, webpack: webpackConf };
};
