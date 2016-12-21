'use strict';

var spawn = require('cross-spawn'),
    fs = require('fs-extra'),
    path = require('path'),
    glob = require('glob'),
    utils = require('./utils'),
    logger = require('./logger');

var webpack = require('webpack');
// 加载编码转换模块  
// var iconv = require('iconv-lite'); 

module.exports = {
    /**
     * load webpack config and start webpack dev server
     * @return {[type]} [description]
     */
    dev: function(args) {
        var config = utils.loadWebpackCfg('dev', args);

        var pack_config = config.pack_config;
        // pack_config.entry = { app: [ '/Users/alicia/Documents/develop/mytest/build/dev-client', '/Users/alicia/Documents/develop/mytest/src/main.js' ] };
        // console.log(pack_config);
        var compiler = webpack(pack_config);
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
        if (pack_config.html5Mode) {
            serverCfg.historyApiFallback = true;
        }
        if (pack_config.devServer && pack_config.devServer.proxy) {
            var _proxy = pack_config.devServer.proxy;
            serverCfg.proxy = {};
            for(var key of Object.keys(_proxy)){
                var proxyConfig = _proxy[key];
                if(typeof(proxyConfig)=="object"){
                    proxyConfig.toProxy = true;
                    proxyConfig.changeOrigin = true;
                }
                serverCfg.proxy[key] = proxyConfig;
            }
        }

        logger.debug('webpack dev server start with config: ');
        logger.debug(serverCfg);

        new WebpackDevServer(compiler, serverCfg).listen(config.sysConfig.port, '0.0.0.0', (err) => {
            if (err) {
                logger.error(err);
                process.exit(1);
            }

            logger.info('----------------------------------');
            logger.info(`Server listening at localhost:${config.sysConfig.port}`);
            logger.info('----------------------------------');
        });
    },
    /**
     * use webpack and build bundle
     * @return {[type]} [description]
     */
    build: function(args, after) {
        var config = utils.loadWebpackCfg('release', args);

        logger.info('start build project... ');
        var compiler = webpack(config.pack_config);
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

            var conf = config.sysConfig;
            if (conf.copy && conf.copy.length > 0) {
                conf.copy.forEach((key) => {
                    let files = glob.sync(key);
                    files.forEach((file) => {
                        fs.copySync(file, `${conf.root}/${file}`);
                    })
                })
            }

            logger.info('build successfully. ');

            if (after && typeof after === "function") {
                after();
            }
        });
    }
}