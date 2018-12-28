module.exports = (conf) => {
  let babelConfig = {};
  if(conf.react){
    babelConfig.presets.push([require.resolve('babel-preset-react')]);
  }
  return babelConfig;
};
