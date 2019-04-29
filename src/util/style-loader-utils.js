var path = require('path');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');

var o = {
  globalVars: {},
  sourceMap: true
};

exports.updateGlobalVars = function(globalVarsFile) {
  o.globalVars = require("./globalvars-utils")(path.resolve(globalVarsFile));
}
exports.updateGlobalJsonVars = function(data) {
  o.globalVars = data;
}

exports.updateOption = function(isDebug) {
  o.sourceMap = isDebug;
  o.minimize = !isDebug;
  o.extract = !isDebug;
}

exports.cssLoaders = function (options) {
  options = options || {}

  var cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: o.sourceMap
    }
  }
  var postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: o.sourceMap,
      plugins: [
        require('autoprefixer')()
      ]
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders(loader, loaderOptions) {
    var loaders = [cssLoader, postcssLoader]
    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: o.sourceMap
        })
      })
    }

    let styleLoader = 'style-loader';
    if (options.from == 'vue') {
      styleLoader = 'vue-style-loader';
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (o.extract) {
      return [MiniCssExtractPlugin.loader, ...loaders]
      // options.extractPlugin.extract({
      //   use: loaders,
      //   fallback: styleLoader
      // })
    } else {
      return [styleLoader].concat(loaders)
    }
  }
  

  // http://vuejs.github.io/vue-loader/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    less: generateLoaders('less', {
      globalVars: o.globalVars || {}
    }),
    sass: generateLoaders('sass', {
      indentedSyntax: true
    }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  var output = []
  var loaders = exports.cssLoaders(options)
  for (var extension in loaders) {
    var loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }
  return output
}
