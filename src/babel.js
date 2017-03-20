module.exports = (conf,isDebug) => {
    var babelConfig = {};
    babelConfig.presets = [[require.resolve('babel-preset-es2015')]];
    babelConfig.plugins = [
        [require.resolve('babel-plugin-transform-runtime'),require.resolve('babel-plugin-transform-vue-jsx')]
    ];

    if (conf.es7 === true) {
        babelConfig.plugins.push([require.resolve('babel-plugin-transform-async-to-generator')]);
        babelConfig.plugins.push([require.resolve('babel-plugin-transform-flow-strip-types')]);
        babelConfig.plugins.push([require.resolve('babel-plugin-transform-object-rest-spread')]);
    }

    if (conf.react === true) {
        babelConfig.presets.push(require.resolve('babel-preset-react'));
        if (isDebug) {
            babelConfig.plugins.push([require.resolve('babel-plugin-react-transform'), {
                transforms: [{
                    transform: 'react-transform-hmr',
                    imports: ['react'],
                    locals: ['module']
                }]
            }]);
        }
    }
    babelConfig.cacheDirectory = true;

    return babelConfig;
};
