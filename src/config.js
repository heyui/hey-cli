'use strict';

var path = require('path'),
    glob = require('glob'),
    logger = require('./logger'),
    webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    conf;

var fs = require('fs');

const DEFAULT = require('../default/package.default.js');

class Config {

    getPort() {
        if (!conf) {
            throw new Error('configuration is not initialized!');
        }
        return conf.port;
    }

    getHtml5Mode() {
        if (!conf) {
            throw new Error('configuration is not initialized!');
        }
        return conf.html5Mode;
    }

    getConfig() {
        if (!conf) {
            throw new Error('configuration is not initialized!');
        }
        return conf;
    }

    /**
     * load config from package.json if exists, otherwise use default config
     * @param  {[Object]} args : runtime arguments
     * @return {[Object]}
     *         System Config
     */

    loadPackageConfig(args) {
        if (conf) {
            return conf;
        }

        var json = {};
        var source = true;
        try {
            var confPath = path.join(process.cwd(), 'package.json');
            json = require(confPath);
        } catch ( ex ) {
            logger.warn("Can't find package.json, init system config with default. ");

            source = false;
        }

        if (json.hey) {
            conf = json.hey;
        } else {
            logger.warn("Can't find a key named hey in package.json, init system config with default. ");
            conf = DEFAULT;
        }
        conf.port = conf.port || DEFAULT.port;
        if (args && args.port) {
            try {
                conf.port = parseInt(args.port);
            } catch ( err ) {
                logger.warn('Ignore passed error port! ');
            }
        }
        conf.mock = !!conf.mock;
        conf.react = !!conf.react;
        conf.html5Mode = !!conf.html5Mode;

        if(conf.webpack == undefined){
            logger.warn('no webpack config hey=>webpack');
        }
        var pack = conf.webpack || {};
        pack.entry = {};
        pack.plugins = [];
        pack.root = pack.root||"dist";
        let comObj = {}
        // check relationship between chunk and common
        if (pack.commonTrunk) {
            for (let key in pack.commonTrunk) {
                comObj[key] = [];
            }
        }

        // add output
        if (pack.output) {
            for (let key in pack.output) {
                let files = glob.sync(key);
                let resObj = pack.output[key];
                files.forEach((file) => {
                    let entry = file.replace('.html', '');
                    if (resObj && resObj.jsname) {
                        entry = resObj.jsname;
                    }
                    pack.entry[entry] = './' + entry;

                    let name = './' + file;
                    let depends = [];
                    if (resObj && resObj.commons) {
                        resObj.commons.map((common) => {
                            depends.push(common);
                            comObj[common].push(entry);
                        });
                        Array.prototype.push.apply(depends, resObj.commons);
                    } else {
                        if (pack.commonTrunk) {
                            for (let key in pack.commonTrunk) {
                                depends.push(key);

                                comObj[key].push(entry);
                            }
                        }
                    }
                    depends.push(file.replace('.html', ''));
                    // console.log(depends);
                    // writeFile(file);
                    var plugin_obj = {
                        template: name,
                        filename: file,
                        chunks: depends
                    };

                    pack.plugins.push(new HtmlWebpackPlugin(plugin_obj));
                })
            }
        }

        // add common trunk
        if (pack.commonTrunk) {
            for (let key in pack.commonTrunk) {
                pack.entry[key] = pack.commonTrunk[key];
                pack.plugins.push(new webpack.optimize.CommonsChunkPlugin({
                    name: key,
                    chunks: comObj[key]
                }))
            }
        }

        if (pack.global) {
            for (var key in pack.global) {
                if (pack.global[key].startsWith('./') || pack.global[key].startsWith('../')) {
                    pack.global[key] = path.resolve(pack.global[key]);
                }
            }

            logger.debug('ProvidePlugin config from package.json:');
            logger.debug(pack.global);

            pack.plugins.push(new webpack.ProvidePlugin(pack.global));
        }

        conf.webpack = pack;

        return conf;
    }

}

module.exports = new Config();