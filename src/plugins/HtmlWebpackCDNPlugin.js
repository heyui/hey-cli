var url = require("url");
var trumpet = require("trumpet");
var concat  = require("concat-stream");
var Readable = require('stream').Readable;


function HtmlWebpackCDNPlugin () {
  
}

_prefixer = function(options, attr) {
    return function(node) {
        node.getAttribute(attr, function(uri) {
            uri = url.parse(uri);
            if(uri.host || !uri.path) {
                return;
            }
            node.setAttribute(attr, options.prefix + uri.format());
        });
    };
};

HtmlWebpackCDNPlugin.prototype.apply = function (compiler) {
  var self = this;
  compiler.plugin('compilation', function (compilation) {
    compilation.plugin('html-webpack-plugin-after-html-processing', function (htmlPluginData, callback) {
        if (htmlPluginData.plugin.options.prefix) {
          var stream = new Readable();
          stream.push(htmlPluginData.html);
          stream.push(null);
          
          var tr = trumpet();
          tr.selectAll("script[src]", _prefixer(htmlPluginData.plugin.options, "src"));
          tr.selectAll("link[href]",  _prefixer(htmlPluginData.plugin.options, "href"));
          tr.selectAll("img[src]",    _prefixer(htmlPluginData.plugin.options, "src"));

          tr.pipe(concat(function(data){
            htmlPluginData.html = data;
            callback(null, htmlPluginData);
          }));
          stream.pipe(tr);
        } else {
          callback(null, htmlPluginData)
        }
    });
  });
};


module.exports = HtmlWebpackCDNPlugin;