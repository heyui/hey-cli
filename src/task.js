'use strict';
var generatorConfig = require('./config');
var logger = require('./logger');
var webpack = require('webpack');
var glob = require('glob');
var fs = require('fs-extra');
var rimraf = require('rimraf');


module.exports = {
  /**
   * load webpack config and start webpack dev server
   * @return {[type]} [description]
   */
  dev: function (args) {
    var config = generatorConfig('dev', args);
    if(config === false) return;

    var webpack_config = config.webpack;

    try {
      // console.log(webpack_config.process);
      // webpack_config.process = {};
      var compiler = webpack(webpack_config);
    } catch (e) {
      logger.error(e);
    }

    var WebpackDevServer = require('webpack-dev-server');
    var serverCfg = {
      hot: true,
      watchOptions: {
        poll: 1000
      },
      stats: {
        colors: true
      }
    }
    var devServer = config.config.webpack.devServer;
    if (devServer) {
      for (var key in devServer) {
        if (key == 'proxy') {
          serverCfg.proxy = {};
          let proxy = devServer[key];
          for (let proxyKey of Object.keys(proxy)) {
            var proxyConfig = proxy[proxyKey];
            if (typeof (proxyConfig) == "object") {
              proxyConfig.toProxy = true;
              proxyConfig.changeOrigin = true;
            }
            serverCfg.proxy[proxyKey] = proxyConfig;
          }
        } else {
          serverCfg[key] = devServer[key];
        }
      }
    }
    // logger.info(serverCfg);
    // console.log(serverCfg);

    logger.debug('webpack dev server start with config: ');
    serverCfg.disableHostCheck = true;
    serverCfg.compress = true;
    serverCfg.setup = function(app){
      app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
        res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
        next();
      });
    }
    new WebpackDevServer(compiler, serverCfg).listen(config.config.port, '::', (err) => {
      if (err) {
        logger.error(err);
        process.exit(1);
      }

      logger.info('----------------------------------');
      logger.info(`Server listening at localhost:${config.config.port}`);
      logger.info('----------------------------------');
    });
  },
  /**
   * use webpack and build bundle
   * @return {[type]} [description]
   */
  build: function (args, after) {
    var config = generatorConfig('release', args);
    if(config === false) return;
    var webpackPack = this.webpackPack;
    if (args.clean) {
      logger.info('start remove ' + config.config.root + ' folder. ');
      rimraf(config.config.root, () => {
        logger.info('build cleaned, removed ' + config.config.root + ' folder. ');
        webpackPack(config);
      })
    } else {
      webpackPack(config);
    }
  },
  webpackPack(config, after) {
    logger.info('start build project... ');
    var compiler = webpack(config.webpack);
    compiler.run((err, stats) => {
      if (err) {
        logger.error(err);
      }
      var jsonStats = stats.toJson();
      if (jsonStats.errors.length > 0) {
        logger.error(jsonStats.errors);
      }
      if (jsonStats.warnings.length > 0) {
        logger.warn(jsonStats.warnings);
      }

      logger.info('build complete. ');
      logger.info('start copying. ');
      var conf = config.config;
      if (conf.copy && conf.copy.length > 0) {
        conf.copy.forEach((key) => {
          let files = glob.sync(key);
          files.forEach((file) => {
            fs.copySync(file, `${conf.root}/${file}`);
          })
        })
      }
      logger.info('copy complete. ');
      logger.info('build successfully. ');

      if (after && typeof after === "function") {
        after();
      }
    });
  }
}
