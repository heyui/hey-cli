module.exports = {
  "port": 9000,
  "mock": false, // default false
  "react": false, // use react
  "vue": false,
  "html5Mode": true,
  "timestamp": false,
  "es7": false, // support es7 async, object-rest-spread, flow-strip-types
  "root": "dist",
  "manifest": false,
  "webpack": {
    "sourcemap": false,
    "uglify": true,
    "output": {},
    "commonTrunk": {},
    "global": {},
    "devServer": {},
    "externals": []
  },
  "copy": []
}
