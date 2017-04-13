module.exports = (conf, isDebug) => {
  var babelConfig = {babelrc: false,forceEnv:true};
  babelConfig.presets = [require.resolve('babel-preset-es2015'),require.resolve('babel-preset-stage-2')];
  // babelConfig.presets = [require.resolve('babel-preset-es2015'),require.resolve('babel-preset-stage-0')];
  babelConfig.plugins = [
    require.resolve('babel-plugin-syntax-dynamic-import'), require.resolve('babel-plugin-transform-runtime')
  ];

  // if (conf.es7 === true) {
  //   babelConfig.plugins.push([require.resolve('babel-plugin-transform-async-to-generator')]);
  //   babelConfig.plugins.push([require.resolve('babel-plugin-transform-flow-strip-types')]);
  //   babelConfig.plugins.push([require.resolve('babel-plugin-transform-object-rest-spread')]);
  // }

  babelConfig.cacheDirectory = true;

  return babelConfig;
};
