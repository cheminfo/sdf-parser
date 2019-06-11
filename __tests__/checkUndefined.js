'use strict';

var parse = require('..');

var fs = require('fs');

var sdf = fs.readFileSync(`${__dirname}/test.sdf`, 'utf-8');

describe('SDF Parser options and undefined', function () {
  var result = parse(sdf, {
    exclude: ['Number of H-Donors'],
    include: ['Number of H-Donors', 'CLogP', 'Code'],
    modifiers: {
      CLogP: function () {
        return undefined;
      }
    },
    filter: function (entry) {
      return entry.CLogP && entry.CLogP.low > 4;
    }
  });

  it('Check molecules', function () {
    expect(result.molecules).toHaveLength(0);
  });
});
