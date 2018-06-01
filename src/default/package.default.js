module.exports = {
  "port": 9000,
  "react": false, // use react
  "html5Mode": true,
  "timestamp": false,
  "es7": true, // support es7 async, object-rest-spread, flow-strip-types
  "root": "dist",
  "console": false,
  "clean": true,
  "webpack": {
    sourceMap: false,
    "publicPath": '/',
    "output": {},
    "commonTrunk": {},
    "global": {},
    "devServer": {},
    "externals": []
  },
  "copy": []
}
