'use strict';
var os = require('os');  

var pack_default = require('./pack');
var babel = require('./babel');
var config = require('./config');
var path = require('path'),
    fs = require('fs'),
    logger = require('./logger'),
    webpack = require('webpack'),
    ExtractTextPlugin = require('extract-text-webpack-plugin');

class Utils {

    /**
     * load webpack:
     *     @task dev: add dev-server and enable HMR, according to mock config, enable mock
     *     @task release: add uglifyjs
     * @return config
     */
    loadWebpackCfg(target, args) {

        var sysConfig = config.loadPackageConfig(args);

        var pack_config = this.mergeConfig(sysConfig.webpack,target);

        switch (target) {
        case 'dev':
            var isDebug = true;
            pack_config.devtool = '#eval-source-map';

            var conf = config.getConfig();
            if (conf.mock === true) {
                var babelQueryStr = babel(isDebug);
                var entryPath = [];
                for (var key in pack_config.entry) {
                    var entry = pack_config.entry[key];
                    var type = Object.prototype.toString.call(entry);
                    if (type === 'object String]') {
                        entryPath.push(path.resolve(process.cwd(), entry + '.js'));
                    } else if (type === '[object Array]') {
                        entryPath.push(path.resolve(process.cwd(), entry[entry.length - 1] + '.js'));
                    }
                }

                //load mock.js before all
                pack_config.module.loaders.push({
                    test: new RegExp(entryPath.join('|')),
                    exclude: /(node_modules|bower_components)/,
                    loaders: [`imports?Mock=${process.cwd()}/mock/mock.js`, `babel-loader?${babelQueryStr}`]
                });
            }

            // config css and less loader
            pack_config.module.loaders.push({
                test: /\.css$/,
                loaders: ['style', 'css?sourceMap']
            });
            pack_config.module.loaders.push({
                test: /\.less$/,
                exclude: /(node_modules|bower_components)/,
                loaders: ['style', 'css?sourceMap!less?sourceMap']
            });

            // add plugin
            pack_config.plugins.push(new webpack.HotModuleReplacementPlugin());
            pack_config.plugins.push(new webpack.DefinePlugin({
                WEBPACK_DEBUG: true,
                'process.env': {
                    NODE_ENV: '"development"'
                }
            }));

            // pack_config.output.publicPath = '/assets/';

            var IPv4 = "localhost";  
            if(os){
                for(var i=0;i<os.networkInterfaces().en0.length;i++){  
                    if(os.networkInterfaces().en0[i].family=='IPv4'){  
                        IPv4=os.networkInterfaces().en0[i].address;  
                    }  
                }  
            }
            pack_config.output.publicPath = `http://${IPv4}:${config.getPort()}/`;
            logger.debug('dev server start with webpack config: ');
            logger.debug(pack_config);

            return {sysConfig:sysConfig,pack_config:pack_config};
        case 'release':
            var sourcemap = !!args.sourcemap ? "?source-map" : "";

            if (args.sourcemap) {
                pack_config.devtool = '#source-map';
            } else {
                pack_config.devtool = '#cheap-source-map';
            }

            pack_config.module.loaders.push({
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style', `css${sourcemap}!postcss`)
            });
            pack_config.module.loaders.push({
                test: /\.less$/,
                exclude: /(node_modules|bower_components)/,
                loader: ExtractTextPlugin.extract('style', `css${sourcemap}!postcss!less${sourcemap}`)
            });

            pack_config.plugins.push(new ExtractTextPlugin(`[name].[hash].css`));
            if (args.uglify) {
                pack_config.plugins.push(new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: false
                    },
                    sourceMap: !!args.sourcemap
                }));
            }

            pack_config.plugins.push(new webpack.DefinePlugin({
                WEBPACK_DEBUG: false,
                'process.env': {
                    NODE_ENV: '"production"'
                }
            }));

            logger.debug('hey release with webpack config: ');
            logger.debug(pack_config);

            return {sysConfig:sysConfig,pack_config:pack_config};
        default:
            break;
        }

        return null;
    }

    /**
     * parse entry
     * @param  {[string]} dev:
     *     dev: add dev server and HMR entries
     *     release: do nothing with enties expcet convert string to array
     * @return {[type]}
     */
    parseEntry(entry, dev, depth) {
        if (entry) {
            var type = Object.prototype.toString.call(entry);
            if (type === '[object String]') {
                entry = [entry];
                if (dev) {
                    entry.unshift(`webpack-dev-server/client?http://localhost:${config.getPort()}`, 'webpack/hot/dev-server');
                }
            } else if (type === '[object Array]') {
                if (dev) {
                    entry.unshift(`webpack-dev-server/client?http://localhost:${config.getPort()}`, 'webpack/hot/dev-server');
                }
            } else {
                for (var key in entry) {
                    entry[key] = this.parseEntry(entry[key], dev);
                }
            }

            return entry;
        } else {
            logger.error('No entry is found!');
        }
    }

    /**
     * merge webpack default config, user's config, and config from package.json
     * @param  {Boolean} isDebug : is debug mode, add dev-sever entry or not
     * @return {[Object]}
     */
    mergeConfig(conf, target) {
        var isDebug = target ==='dev';
        var pack = {
            entry: conf.entry || 'main',
            plugins: conf.plugins,
            devServer: conf.devServer,
            resolve: conf.resolve,
            output: {
                publicPath: conf.publicPath,
                path:`${process.cwd()}/${conf.root}/`
            }
        }

        var pack_config = pack;
        if (!pack.entry) {
            pack_config.entry = pack_default.entry;
        }
        pack_config.entry = this.parseEntry(pack_config.entry, isDebug);
        // use hey default webpack config, for build use
        // var publicPath = pack_config.output && pack_config.output.publicPath;
        // pack_config.output = pack_default.output;
        // if (publicPath) {
        //     pack_config.output.publicPath = publicPath;
        // }

        // hash control, add hash when release
        let hash = '';
        if (!isDebug) {
            hash = '.[hash]';
        }
        pack_config.output.filename = `[name]${hash}.js`;
        pack_config.output.chunkFilename = `[id]${hash}.js`;

        if (pack_config.module && pack_config.module.loaders) {
            Array.prototype.push.apply(pack_default.module.loaders, pack_config.module.loaders);
        } else {
            pack_config.module = {};
        }
        pack_config.module.loaders = pack_default.module.loaders;
        pack_config.module.loaders.push({
            test: /\.jsx?$/,
            exclude: /(node_modules|bower_components)/,
            loaders: [`babel-loader?${babel(isDebug)}`]
        });

        // config loader for vue
        pack_config.module.loaders.push({
            test: /\.vue$/,
            exclude: /(node_modules|bower_components)/,
            loaders: ['vue-loader?${babel(isDebug)']
        });
        pack_config.vue = {
            loaders: {
                js: `babel-loader?${babel(isDebug)}`,
                html:`vue-html-loader?minimize=false`
            }
        };
        
        pack_config.resolve = pack_default.resolve;

        pack_config.resolveLoader = pack.resolveLoader || pack_default.resolveLoader;

        if (pack_config.plugins) {
            Array.prototype.push.apply(pack_default.plugins, pack_config.plugins);
        }
        pack_config.plugins = pack_default.plugins;

        if (pack_config.externals) {
            Array.prototype.push.apply(pack_default.externals, pack_config.externals);
        }

        pack_config.externals = pack_default.externals;
        pack_config.postcss = pack_default.postcss;
        if (pack.devServer) {
            pack_config.devServer = pack.devServer;
        }

        return pack_config;
    }

}

module.exports = new Utils();
