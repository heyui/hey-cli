var path = require('path'),
    spawn = require('cross-spawn');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var npmRoot = spawn.sync('npm', ['root', '-g']);
var paths = npmRoot.stdout.toString().split(path.sep);
paths.length -= 1;

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
module.exports = {
    entry: ['./index'],
    output: {
        path: `${process.cwd()}/dist/`,
        publicPath: '/dist/'
    },
    module: {
        loaders: [{
            test: /\.(eot|svg|ttf|woff|woff2)/i,
            loader: "url?limit=2048&name=[path][name].[ext]"
        }, {
            test: /\.(png|jpe?g|gif)$/i,
            loader: "url?limit=8192&name=[path][name].[ext]!img?minimize&progressive=true"
        }, {
            test: /\.json$/,
            loaders: ['json']
        }, {
            test: /\.html?$/,
            loaders: ['html-loader']
        }, {
            test: /\.tpl?$/,
            loaders: ['ejs-loader']
        }]
    },
    resolve: {
        extensions: ['', '.js', '.vue', '.json'],
        alias: {'vue$': 'vue/dist/vue.common.js'},
        root: [
            // project node modules
            path.join(process.cwd(), 'node_modules'),
            // hey node modules
            path.join(__dirname,"..", 'node_modules'),
            // all global node modules
            path.join(paths.join(path.sep), 'node_modules')
        ],
        fallback: [path.join(__dirname, '../node_modules')]
    },
    resolveLoader: {
        root: [
            path.join(__dirname,"..", 'node_modules'),
            path.join(process.cwd(), 'node_modules'),
            path.join(paths.join(path.sep), 'node_modules')
        ],
        fallback: [path.join(__dirname, '../node_modules')]
    },
    /**
     * plugins to hot reload source file
     * @type {Array}
     */
    plugins: [],
    externals: [],
    postcss: function() {
        return [require('autoprefixer')];
    }
}