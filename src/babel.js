module.exports = (conf) => {
  let babelConfig = {};
  babelConfig.presets = [require.resolve('babel-preset-env')];
  if(conf.react){
    babelConfig.presets.push([require.resolve('babel-preset-react')]);
  }
  babelConfig.plugins = [
    require.resolve('babel-plugin-syntax-dynamic-import'), require.resolve('babel-plugin-transform-runtime')
  ];

  babelConfig.plugins.push([require.resolve('babel-plugin-transform-async-to-generator')]);
  babelConfig.plugins.push([require.resolve('babel-plugin-transform-flow-strip-types')]);
  babelConfig.plugins.push([require.resolve('babel-plugin-transform-object-rest-spread')]);
  babelConfig.plugins.push([require.resolve('babel-plugin-array-includes')]);

  return babelConfig;
};
