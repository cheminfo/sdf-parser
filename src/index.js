'use strict';

const parse = require('./parse');
const stream = require('./stream');

module.exports = parse;
parse.stream = stream;
