#!/usr/bin/env node

var rimraf = require('rimraf');
var logger = require('../src/logger');

rimraf('dist', () => {
    logger.info('build cleaned, remove dist folder. ');
})