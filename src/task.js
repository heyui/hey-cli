'use strict';

var spawn = require('cross-spawn'),
    fs = require('fs-extra'),
    path = require('path'),
    glob = require('glob'),
    config = require('./config'),
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
        var pack_config = utils.loadWebpackCfg('dev', args);
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

        if (config.getHtml5Mode()) {
            serverCfg.historyApiFallback = true;
        }

        logger.debug('webpack dev server start with config: ');
        logger.debug(serverCfg);

        new WebpackDevServer(compiler, serverCfg).listen(config.getPort(), '0.0.0.0', (err) => {
            if (err) {
                logger.error(err);
                process.exit(1);
            }

            logger.info('----------------------------------');
            logger.info(`Server listening at localhost:${config.getPort()}`);
            logger.info('----------------------------------');
        });
    },
    /**
     * use webpack and build bundle
     * @return {[type]} [description]
     */
    build: function(args, after) {
        var pack_config = utils.loadWebpackCfg('release', args);
        logger.info('start build project... ');
        var compiler = webpack(pack_config);
        if(!args.root)args.root="dist";
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

            var conf = config.getConfig();
            if (conf.copy && conf.copy.length > 0) {
                conf.copy.forEach((key) => {
                    let files = glob.sync(key);
                    files.forEach((file) => {
                        fs.copySync(file, `${args.root}/${file}`);
                    })
                })
            }

            logger.info('build successfully. ');


            // var writeFile = function(file){
            //     var str = "<script>console.log('"+args.headVersion+"')</script>";  
            //     var arr = iconv.encode(str, 'utf8'); 
            //     fs.appendFile(file, arr, function(err){  
            //         if(err)  
            //             console.log("fail " + err);
            //     });  
            // }
            // let files = glob.sync(`${args.root}/index.html`);
            // files.forEach((file) => {
            //     writeFile(file);
            // })

            if (after && typeof after === "function") {
                after();
            }
        });
    }
}