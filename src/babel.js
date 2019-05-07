module.exports = (conf) => {
  let babelConfig = {};
  babelConfig.presets = [require.resolve('@babel/preset-env')];
  babelConfig.plugins = [
    require.resolve('@babel/plugin-syntax-dynamic-import'), require.resolve('@babel/plugin-transform-runtime')
  ];

  if (conf.react) {
    babelConfig.presets.push([require.resolve('@babel/preset-react')]);
  }

  if (conf.webpack.import) {
    babelConfig.plugins.push([require.resolve('babel-plugin-import'), conf.webpack.import]);
  }

  babelConfig.plugins.push([require.resolve('@babel/plugin-transform-async-to-generator')]);
  babelConfig.plugins.push([require.resolve('@babel/plugin-transform-flow-strip-types')]);
  babelConfig.plugins.push([require.resolve('@babel/plugin-proposal-object-rest-spread')]);
  babelConfig.plugins.push([require.resolve('@babel/plugin-transform-modules-commonjs')]);

  return babelConfig;
};
