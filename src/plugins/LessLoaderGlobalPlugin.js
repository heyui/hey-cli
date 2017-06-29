var less = require("less");
var fs=require("fs");
var path=require("path");
var paths=require("../utils/path");
var logger = require('../logger');

function MyPlugin(options) {
  // 根据 options 配置你的插件
}

MyPlugin.prototype.apply = function(compiler) {
  compiler.plugin("compile", function(params) {
    console.log(params);
    console.log("The compiler is starting to compile...");
  });
};

module.exports = MyPlugin;