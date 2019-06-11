'use strict';

var parse = require('..');

var fs = require('fs');

describe('SDF Parser of non well formatted file', function () {
  var sdf = fs.readFileSync(`${__dirname}/test2.sdf`, 'utf-8');
  sdf = sdf.replace(/\r/g, '');
  var result = parse(sdf, { mixedEOL: true });

  it('Check molecules', function () {
    var molecules = result.molecules;
    expect(molecules).toHaveLength(7);
  });
});
