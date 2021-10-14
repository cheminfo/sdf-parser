'use strict';

let fs = require('fs');

let parse = require('..');

describe('SDF Parser of non well formatted file', function () {
  let sdf = fs.readFileSync(`${__dirname}/test2.sdf`, 'utf-8');
  sdf = sdf.replace(/\r/g, '');
  let result = parse(sdf, { mixedEOL: true });

  it('Check molecules', function () {
    let molecules = result.molecules;
    expect(molecules).toHaveLength(7);
  });
});
