'use strict';
var generatorConfig = require('./config');
var logger = require('./logger');
var webpack = require('webpack');
var glob = require('glob');
var fs = require('fs-extra');
var fss = require("fs");
var rimraf = require('rimraf');
var ProgressPlugin = require('webpack/lib/ProgressPlugin');
var chalk = require('chalk');
var open = require('open');


module.exports = {
  /**
   * load webpack config and start webpack dev server
   * @return {[type]} [description]
   */
  dev: function (args) {
    var result = generatorConfig('development', args);
    if(result === false) return;

    var webpackConfig = result.webpack;
    var config = result.config;

    try {
      var compiler = webpack(webpackConfig);
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
      },
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Content-Length, Authorization, Accept,X-Requested-With",
        "Access-Control-Allow-Methods": "PUT,POST,GET,DELETE,OPTIONS",
      },
    }
    var devServer = config.webpack.devServer;
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

    logger.debug('webpack dev server start with config: ');
    serverCfg.disableHostCheck = true;
    serverCfg.compress = true;
    var isOpened = false;
    compiler.apply(new ProgressPlugin(function(percentage, msg, msg2, msg3, msg4) {
      if(percentage == 1 && !isOpened && config.openBrowser) {
        open("http://localhost:"+config.port);
        isOpened = true;
      }
    }));
    new WebpackDevServer(compiler, serverCfg).listen(config.port, '::', (err) => {
      if (err) {
        logger.error(err);
        process.exit(1);
      }

      logger.info('----------------------------------');
      logger.info('Starting server on ' + chalk.bold.red("http://localhost:"+config.port));
      logger.info('----------------------------------');
    });
  },
  /**
   * use webpack and build bundle
   * @return {[type]} [description]
   */
  build: function (args, after) {
    var result = generatorConfig('production', args);
    var config = result.config;
    var webpackConfig = result.webpack;
    if(config === false) return;
    var webpackPack = this.webpackPack;
    if (args.clean || config.clean) {
      logger.info('start remove ' + config.root + ' folder. ');
      rimraf(config.root, () => {
        logger.info('build cleaned, removed ' + config.root + ' folder. ');
        webpackPack(config, webpackConfig, args);
      })
    } else {
      webpackPack(config, webpackConfig, args);
    }
  },
  webpackPack(config, webpackConfig, args) {
    logger.info('start build project... ');
    var compiler = webpack(webpackConfig);

    var ProgressBar = require('progress');
    var bar = new ProgressBar('  building [:bar] :percent :etas', { 
      complete: '=',
      incomplete: ' ',
      total: 100
    });
    var logError = global.console.error;
    global.console.error = function(){}
    
    compiler.apply(new ProgressPlugin(function(percentage, msg, msg2, msg3, msg4) {
      // logger.info((percentage * 100) + '%', msg, msg2||"");
      bar.update(percentage);
    }));
    
    compiler.run((err, stats) => {
      global.console.error = logError;
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
      // if (args.profile) {
        fss.writeFile(webpackConfig.output.path + '/stat.json', JSON.stringify(jsonStats),  function(err) {
          if (err) {
              return console.error(err);
          }
          console.log("stat文件生成成功！");
       });
      // }

      logger.info('build complete. ');
      if (config.copy && config.copy.length > 0) {
        logger.info('start copying. ');
        config.copy.forEach((key) => {
          let files = glob.sync(key);
          files.forEach((file) => {
            fs.copySync(file, `${config.root}/${file}`);
          })
          logger.info('copy complete. ');
        })
      }
      logger.info('build successfully. ');

    });
  }
}
