'use strict';
var generatorConfig = require('./config');
var logger = require('./logger');
var webpack = require('webpack');
var glob = require('glob');
var fs = require('fs-extra');


module.exports = {
    /**
     * load webpack config and start webpack dev server
     * @return {[type]} [description]
     */
    dev: function(args) {
        var config = generatorConfig('dev', args);

        var webpack_config = config.webpack;

        try{
            var compiler = webpack(webpack_config);
        }catch(e){
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
            for(var key in devServer){
                serverCfg[key] = devServer[key];
            }
        }
        // logger.info(serverCfg);

        logger.debug('webpack dev server start with config: ');
        new WebpackDevServer(compiler, serverCfg).listen(config.config.port, '0.0.0.0', (err) => {
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
    build: function(args, after) {
        var config = generatorConfig('release', args);
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
                    logger.info(conf.root);
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