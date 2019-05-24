
const chalk = require('chalk');
const log4js = require('log4js');
log4js.configure({
  appenders: {
    out: { type: 'stdout', layout: {
      type: 'pattern',
      pattern: '%[%c%] %m'
    }}
  },
  categories: {
    default: { appenders: ['out'], level: 'info' }
  }
});
var logger = log4js.getLogger('[HEY]');
module.exports = logger;
