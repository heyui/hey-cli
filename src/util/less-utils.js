var less = require("less");
var fs=require("fs");
var path=require("path");
var paths=require("./path");
var logger = require('../logger');


module.exports = function (source,query,isDebug) {
  query = query || {};
  var camelCase = query.camelCase || false;
  var lessVars = {};
  
  var paletteLess = fs.readFileSync(source, 'utf8');
  paletteLess = paletteLess.replace(/\@import \(less\) \"\~/, ("@import (less) \""+ path.join(process.cwd(), 'node_modules') + "/"));
  less.parse(paletteLess, {
    paths:[path.dirname(source)]
  }, function (err, root, imports, options) {
    try {
      var evalEnv = new less.contexts.Eval(options);
      var evaldRoot = root.eval(evalEnv);
      var ruleset = evaldRoot.rules;
      ruleset.forEach(function (rule) {
        if (rule.variable === true) {
          var name;
          if (camelCase === false) {
            name = rule.name.substr(1);
          } else {
            name = convertToCamelcase(rule.name.substr(1));
          }

          var value = rule.value;
          lessVars[name] = value.toCSS();
        }
      });
      if(isDebug){
        logger.info("修改全局定义的less参数后记得重启~~~");
      }
      // logger.info("全局定义的less参数:", Object.keys(lessVars).join(','));
      // console.log(lessVars);
    } catch (err) {
    }
    
  });

  return lessVars;
};

function convertToCamelcase(input) {
  return input.toLowerCase().replace(/-(.)/g, function (match, group) {
    return group.toUpperCase();
  });
};
