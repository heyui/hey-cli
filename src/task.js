'use strict';
const generatorConfig = require('./config');
const logger = require('./logger');
const webpack = require('webpack');
const glob = require('glob');
const fs = require('fs-extra');
const fss = require("fs");
const rimraf = require('rimraf');
const chalk = require('chalk');
const open = require('open');
const utils = require('./util/utils');
const path = require('path');
const BundleAnalyzer = require('webpack-bundle-analyzer').start;

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
      return;
    }

    var WebpackDevServer = require('webpack-dev-server');
    var serverCfg = {
      hot: true,
      watchOptions: {
        poll: 1000
      },
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Content-Length, Authorization, Accept,X-Requested-With",
        "Access-Control-Allow-Methods": "PUT,POST,GET,DELETE,OPTIONS",
      },
      host: '0.0.0.0',
      disableHostCheck: true,
      compress: true,
      publicPath: webpackConfig.output.publicPath,
      noInfo: true,
      stats: {
        assets: false,
        colors: true,
        builtAt: false,
        modules: false,
        errors: true,
        entrypoints: false,
        errorDetails: true,
      }
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
    let isDone = false;
    compiler.hooks.done.tap('complete', (stats) => {
      if(isDone) {
        return;
      }
      isDone = true;
      try {
        if (config.openBrowser) {
          open("http://localhost:"+config.port);
        }

        logger.info('Compiled successfully');
        logger.info('');
        logger.info('  - Local: ' + chalk.bold.blue(`http://localhost:${config.port}`));
        const ip = utils.getLocalIP();
        if(ip) {
          logger.info('  - Network: ' + chalk.bold.blue(`http://${ip}:${config.port}`));
        }
        if (config.report) {
          logger.info('  - Analyzer: ' + chalk.bold.blue(`http://localhost:${config.analyzerPort}`));
        }
        logger.info('');
        if (!config.report) {
          logger.info('Use webpack-bundle-analyzer: '+ chalk.bold.blue('hey dev -r'));
        }
        logger.info('For more information, see ' + chalk.bold.blue('https://github.com/heyui/hey-cli'));
      } catch (e) {
        logger.error(e);
        return;
      }
    })

    new WebpackDevServer(compiler, serverCfg).listen(config.port, '::', (err) => {
      if (err) {
        logger.error(err);
        process.exit(1);
      }
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
    if(config == null || config === false) return;
    var webpackPack = this.webpackPack;
    if (args.clean || config.clean) {
      logger.info('Start remove ' + config.root + ' folder. ');
      rimraf(config.root, () => {
        logger.info('Build cleaned, removed ' + config.root + ' folder. ');
        webpackPack(config, webpackConfig, args);
      })
    } else {
      webpackPack(config, webpackConfig, args);
    }
  },
  webpackPack(config, webpackConfig, args) {
    logger.info('Start build project... ');
    var compiler = webpack(webpackConfig);
    var logError = global.console.error;
    global.console.error = function(){}
    
    compiler.run((err, stats) => {
      global.console.error = logError;
      if (err) {
        logger.error(err);
        return;
      }
      var jsonStats = stats.toJson();
      if (jsonStats.errors.length > 0) {
        logger.error(jsonStats.errors);
      }
      if (jsonStats.warnings.length > 0) {
        logger.warn(jsonStats.warnings);
      }
      if(config.stat) {
        fss.writeFile(webpackConfig.output.path + '/stat.json', JSON.stringify(jsonStats),  function(err) {
          if (err) {
            return console.error(err);
          }
        });
      }

      logger.info('Compiled successfully');
      if (config.copy && config.copy.length > 0) {
        logger.info('Start copying. ');
        config.copy.forEach((key) => {
          let files = glob.sync(key);
          files.forEach((file) => {
            fs.copySync(file, `${config.root}/${file}`);
          })
        })
        logger.info('Copy complete. ');
      }
      logger.info('Build successfully. ');
      if (!config.report) {
        logger.info('Use webpack-bundle-analyzer: '+ chalk.bold.blue('hey report'));
      }
      logger.info('For more information, see ' + chalk.bold.blue('https://github.com/heyui/hey-cli'));

    });
  },
  report(args) {
    let stats = require(path.join(process.cwd(), args.file));
    BundleAnalyzer(stats, {
      port: args.port
    })
  }
}
