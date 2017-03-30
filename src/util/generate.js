var Metalsmith = require('metalsmith')
var path = require('path')

/**
 * Generate a template given a `src` and `dest`.
 *
 * @param {String} name
 * @param {String} src
 * @param {String} dest
 * @param {Function} done
 */

module.exports = function generate (name, tmplType, src, dest, done) {
  // var opts = getOptions(name, src)
  var metalsmith = Metalsmith(path.join(src, tmplType))
  var data = Object.assign(metalsmith.metadata(), {
    destDirName: name,
    inPlace: dest === process.cwd(),
    noEscape: true
  })

  metalsmith
    .clean(false)
    .source('.') // start from template root instead of `./src` which is Metalsmith's default for `source`
    .destination(dest)
    .build(function (err, files) {
      done(err)
    })

  return data
}
