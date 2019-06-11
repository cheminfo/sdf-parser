'use strict';

var parse = require('..');

var fs = require('fs');

var sdf = fs.readFileSync(`${__dirname}/test.sdf`, 'utf-8');

describe('SDF Parser options', function () {
  var result = parse(sdf, {
    exclude: ['Number of H-Donors'],
    include: ['Number of H-Donors', 'CLogP', 'Code'],
    modifiers: {
      CLogP: function (field) {
        return {
          low: field * 1 - 0.2,
          high: field * 1 + 0.2
        };
      }
    },
    filter: function (entry) {
      return entry.CLogP && entry.CLogP.low > 4;
    }
  });

  it('Check statistics', function () {
    expect(result.statistics[0].counter).toBe(43);
    expect(result.statistics[0].isNumeric).toBe(false);
    expect(result.statistics[0].label).toBe('Code');
    expect(result.statistics[0].always).toBe(true);
    expect(result.statistics[4].counter).toBe(43);
    expect(result.statistics[4].isNumeric).toBe(false);
    expect(result.statistics[4].label).toBe('CLogP');
    expect(result.statistics[4].always).toBe(true);
  });

  it('Check molecules', function () {
    expect(result.molecules).toHaveLength(43);
    var molecule = result.molecules[0];

    expect(Object.keys(molecule)).toHaveLength(3);
    expect(molecule.Code).toBe('0100380851');
    expect(molecule.CLogP.low).toBeCloseTo(4.8, 0.0001);
    expect(molecule.CLogP.high).toBeCloseTo(5.2, 0.0001);
    expect(molecule.molfile.split('\n')).toHaveLength(56);
  });

  it('should throw with non-string argument', function () {
    expect(function () {
      parse();
    }).toThrow(TypeError);
    expect(function () {
      parse(42);
    }).toThrow(TypeError);
    expect(function () {
      parse({});
    }).toThrow(TypeError);
  });
});
