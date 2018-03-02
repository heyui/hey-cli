module.exports = (conf, isDebug) => {
  var babelConfig = {babelrc: false,forceEnv:true};
  babelConfig.presets = [require.resolve('babel-preset-env')];
  // babelConfig.presets = [require.resolve('babel-preset-es2015'),require.resolve('babel-preset-stage-0')];

  if(conf.react){
    babelConfig.presets.push([require.resolve('babel-preset-react')]);
  }
  babelConfig.plugins = [
    require.resolve('babel-plugin-syntax-dynamic-import'), require.resolve('babel-plugin-transform-runtime')
  ];

  // if (conf.es7 === true) {
    babelConfig.plugins.push([require.resolve('babel-plugin-transform-async-to-generator')]);
    babelConfig.plugins.push([require.resolve('babel-plugin-transform-flow-strip-types')]);
    babelConfig.plugins.push([require.resolve('babel-plugin-transform-object-rest-spread')]);
    babelConfig.plugins.push([require.resolve('babel-plugin-array-includes')]);
  // }

  babelConfig.cacheDirectory = true;

  return babelConfig;
};
