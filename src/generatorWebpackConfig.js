var paths = require('./util/path.js');
var Utils = require('./util/utils.js');
var styleLoaderUtils = require('./util/style-loader-utils.js');
var os = require('os');
var path = require('path'),
  fs = require('fs'),
  logger = require('./logger'),
  webpack = require('webpack'),
  glob = require('glob'),
  ExtractTextPlugin = require('extract-text-webpack-plugin');
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
getbabelConfig = require('./babel');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackCDNPlugin = require('./plugins/HtmlWebpackCDNPlugin');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var chalk = require('chalk');
// var UglifyJsParallelPlugin = require('webpack-uglify-parallel');
// var LessLoaderGlobalPlugin = require('./plugins/LessLoaderGlobalPlugin');
// var ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');
// var ManifestPlugin = require('webpack-manifest-plugin');

/**
 * only given props will be used
 *     entry
 *     output
 *     module: loaders: will be merged with project plugins
 *     resolve
 *     resolveLoader
 *     plugins: will be merged with project plugins
 *     externals
 *     postcss
 */

const initDefaultWebpackConf = function (webpackConfig, isDebug, config) {
  var babelOptions = getbabelConfig(config, isDebug);

  styleLoaderUtils.updateOption(isDebug);

  if (webpackConfig.globalVars) {
    styleLoaderUtils.updateGlobalVars(webpackConfig.globalVars);
    if(isDebug){
      logger.info(chalk.green("提醒：修改"+webpackConfig.globalVars+"文件后需要重启服务"));
    }
  }

  if (webpackConfig.globalJsonVars) {
    styleLoaderUtils.updateGlobalJsonVars(webpackConfig.globalJsonVars);
    if(isDebug){
      logger.info(chalk.green("提醒：修改参数 globalJsonVars 后需要重启服务"));
    }
  }

  const extractCSSPlugin = new ExtractTextPlugin(`${config.cssPath}/[name]${config.hashString}.css`);
  const extractVueCSSPlugin = new ExtractTextPlugin(`${config.cssPath}/[name]-vue${config.hashString}.css`);

  var genWebpackConfig = {
    entry: {},
    output: {
      path: `${process.cwd()}/${webpackConfig.root}/`,
      filename: `${config.jsPath}[name]${config.hashString}.js`,
      chunkFilename: `${config.jsPath}[name]${config.hashString}.js`,
      publicPath: isDebug ? '/':webpackConfig.publicPath
    },
    module: {
      rules: [{
        test: /\.(ico|jpg|png|gif|svg)(\?.*)?$/,
        loader: "url-loader",
        query: {
          limit: webpackConfig.dataUrlLimit || 100,
          name: `${config.staticPath}images/[path][name]${config.hashString}.[ext]`
        }
      }, {
        test: /\.(eot|otf|webp|ttf|woff|woff2)(\?.*)?$/,
        loader: "url-loader",
        query: {
          name: `${config.staticPath}font/[path][name]${config.hashString}.[ext]`
        }
      }, {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: styleLoaderUtils.cssLoaders({ from: 'vue', extractPlugin: extractVueCSSPlugin })
        }
      }, {
        test: /\.html?$/,
        loader: 'html-loader',
        options: {
            attrs: ["img:src", "link:href"],
            interpolate: true,
        },
      }, {
        test: /\.exec\.js$/,
        use: [ 'script-loader' ]
      }, {
        test: /\.tpl?$/,
        loader: 'ejs-loader'
      }, {
        test: /\.json$/,
        loader: 'json-loader',
      }, {
        test: /\.(jsx|js)?$/,
        exclude: /(node_modules|bower_components|\.exec\.js$)/,
        use: [{
          loader: 'babel-loader',
          options: babelOptions
        }]
      }]
    },
    resolve: {
      extensions: ['.js', '.vue', '.jsx', '.json'],
      alias: {
        // 'vue$': 'vue/dist/vue.runtime.esm.js',
        '@': path.join(process.cwd(), 'src'),
      },
      modules: [
        // project node modules
        path.join(process.cwd(), 'node_modules'),
        // hey node modules
        path.join(__dirname, "..", 'node_modules'),
        // all global node modules
        path.join(paths.join(path.sep), 'node_modules')
      ],
    },
    resolveLoader: {
      modules: [
        // project node modules
        path.join(process.cwd(), 'node_modules'),
        // hey node modules
        path.join(__dirname, "..", 'node_modules'),
        // all global node modules
        path.join(paths.join(path.sep), 'node_modules')
      ]
    },
    devtool: (isDebug ? '#eval' : (webpackConfig.sourceMap ? 'source-map' : false)),
    plugins: [
      new webpack.LoaderOptionsPlugin({
        options: {
          minimize: !isDebug,
          debug: isDebug,
          context: process.cwd(),
          babel: babelOptions,
          postcss: [
            require('autoprefixer')
          ]
        }
      }),
      new webpack.DefinePlugin({
        WEBPACK_DEBUG: isDebug,
        'process.env': {
          NODE_ENV: (isDebug ? '"development"' : '"production"')
        }
      }),
    ],
  };

  if(webpackConfig.plugins) {
    genWebpackConfig.plugins = genWebpackConfig.plugins.concat(webpackConfig.plugins);
  }

  if(webpackConfig.module) {
    for(var m in webpackConfig.module) {
      genWebpackConfig.module[m] = webpackConfig.module[m];
    }
  }

  let styles = styleLoaderUtils.styleLoaders({extractPlugin: extractCSSPlugin});

  for (var i = 0; i < styles.length; i++) {
    genWebpackConfig.module.rules.push(styles[i]);
  }

  if (!isDebug) {
    genWebpackConfig.plugins.push(
      new UglifyJsPlugin({
        compress: {
          warnings: false,
          drop_debugger: true,
          drop_console: !webpackConfig.console
        },
        sourceMap: false
      }),
      new OptimizeCSSPlugin({
        cssProcessorOptions: {
          safe: true
        }
      }),
      extractCSSPlugin,
      extractVueCSSPlugin,
      new ExtractTextPlugin({
        filename: `${config.cssPath}/[name]${config.hashString}.css`,
        allChunks: true
      }),
      new webpack.optimize.OccurrenceOrderPlugin()
    );

    if(webpackConfig.htmlPublicPath){
      genWebpackConfig.plugins.push(new HtmlWebpackCDNPlugin())
    }
  }

  if(webpackConfig.alias){
    for(var key in webpackConfig.alias){
      let value = webpackConfig.alias[key];
      if(value.indexOf('.') == 0 || value.indexOf('/') == 0) {
        genWebpackConfig.resolve.alias[key] = path.join(process.cwd(), value);
      } else {
        genWebpackConfig.resolve.alias[key] = value;
      }
    }
  }
  
  var copyConfig = ['node', 'externals', 'stats', 'target', 'devtool', 'performance']
  for(var i = 0; i < copyConfig.length; i++){
    var c = copyConfig[i];
    if(webpackConfig[c]){
      genWebpackConfig[c] = webpackConfig[c];
    }
  }
  // console.log(genWebpackConfig)

  return genWebpackConfig;
};

function initCommonOutputPlugins(genWebpack, webpackConfig, config, isDebug) {
  let comObj = {}
    // check relationship between chunk and common
  if (webpackConfig.commonTrunk) {
    for (let key in webpackConfig.commonTrunk) {
      comObj[key] = [];
    }
  }

  // add output
  if (webpackConfig.output) {
    for (let key in webpackConfig.output) {
      let files = glob.sync(key);
      let resObj = webpackConfig.output[key];
      files.forEach((file) => {
        let entry = file.replace('.html', '');
        if (resObj && resObj.entry) {
          entry = resObj.entry;
        } else {
          entry = './' + entry;
        }
        genWebpack.entry[entry] = entry;

        let depends = [];
        if (resObj && resObj.commons) {
          resObj.commons.map((common) => {
            depends.push(common);
            comObj[common].push(entry);
          });
          Array.prototype.push.apply(depends, resObj.commons);
        } else {
          if (webpackConfig.commonTrunk) {
            for (let key in webpackConfig.commonTrunk) {
              depends.push(key);
              comObj[key].push(entry);
            }
          }
        }
        depends.push(entry);
        let name = './' + file;
        var plugin_obj = {
          template: name,
          filename: file,
          chunks: depends,
        };

        if (!isDebug) {
          Utils.extend(plugin_obj, {
            inject: true,
            prefix: webpackConfig.htmlPublicPath,
            minify: {
              removeComments: true,
              collapseWhitespace: true,
              removeAttributeQuotes: true
            },
            chunksSortMode: 'auto'
          })
        }

        genWebpack.plugins.push(new HtmlWebpackPlugin(plugin_obj));
      })
    }
  }

  // add common trunk
  if (webpackConfig.commonTrunk) {
    for (let key in webpackConfig.commonTrunk) {
      genWebpack.entry[key] = webpackConfig.commonTrunk[key];
      genWebpack.plugins.push(new webpack.optimize.CommonsChunkPlugin({
        name: key,
        filename: `${config.jsPath}common/${key}${config.hashString}.js`,
        chunks: comObj[key],
        minChunks: function (module) {
          // this assumes your vendor imports exist in the node_modules directory
          return module.context && module.context.indexOf('node_modules') !== -1;
        }
      }))
    }
  }

  if (webpackConfig.global) {
    var globals = {};
    for (var key in webpackConfig.global) {
      if (webpackConfig.global[key].startsWith('./') || webpackConfig.global[key].startsWith('../')) {
        globals[key] = path.resolve(webpackConfig.global[key]);
      } else {
        globals[key] = webpackConfig.global[key];
      }
    }

    genWebpack.plugins.push(new webpack.ProvidePlugin(globals));
  }

  return genWebpack;
}

function initUmdOutputPlugins(genWebpack, webpackConfig, config, isDebug) {
  let comObj = {};
  if (webpackConfig.umd) {
    let entrys = webpackConfig.umd.entry;
    let resObj = webpackConfig.umd;
    if(Utils.isObject(entrys)) {
      let entry = {};
      for(let key in entrys){
        entry[key] = path.resolve(entrys[key]);
      }
      genWebpack.entry = entry;
    } else {
      genWebpack.entry = path.resolve(entrys);
    }
    genWebpack.output = {
      path: `${process.cwd()}/${config.root}`,
      filename: resObj.filename,
      library: resObj.library,
      libraryTarget: 'umd'
    };
  }
  return genWebpack;
}

function parseEntry(config, entry, isDebug) {
  if (entry) {
    if (Utils.isString(entry)) {
      entry = [entry];
      if (isDebug) {
        entry.unshift(`webpack-dev-server/client?http://localhost:${config.port}`, 'webpack/hot/dev-server');
      }
    } else if (Utils.isArray(entry)) {
      if (isDebug) {
        entry.unshift(`webpack-dev-server/client?http://localhost:${config.port}`, 'webpack/hot/dev-server');
      }
    } else if (Utils.isObject(entry)) {
      for (var key in entry) {
        entry[key] = parseEntry(config, entry[key], isDebug);
      }
    }
    return entry;
  } else {
    logger.error('No entry is found!');
  }
}

module.exports = function (config, isDebug) {
  var webpackConfig = config.webpack || {};
  var genWebpack = initDefaultWebpackConf(webpackConfig, isDebug, config);
  genWebpack = initCommonOutputPlugins(genWebpack, webpackConfig, config, isDebug);
  genWebpack = initUmdOutputPlugins(genWebpack, webpackConfig, config, isDebug);
  genWebpack.entry = parseEntry(config, genWebpack.entry, isDebug);

  if (isDebug) {
    genWebpack.plugins.push(new webpack.HotModuleReplacementPlugin());
    // var IPv4 = "localhost";
    // if (os && os.networkInterfaces() && os.networkInterfaces().en0) {
    //   for (var i = 0; i < os.networkInterfaces().en0.length; i++) {
    //     if (os.networkInterfaces().en0[i].family == 'IPv4') {
    //       IPv4 = os.networkInterfaces().en0[i].address;
    //     }
    //   }
    // }
    // genWebpack.output.publicPath = `http://${IPv4}:${webpackConfig.port}/`;
  }
  // logger.info(genWebpack);
  // logger.info(genWebpack.module.rules);
  return genWebpack;
}
