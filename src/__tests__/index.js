'use strict';

let fs = require('fs');

let parse = require('..');

let sdf = fs.readFileSync(`${__dirname}/test.sdf`, 'utf-8');
let sdf1 = fs.readFileSync(`${__dirname}/test1.sdf`, 'utf-8');

describe('SDF Parser', function () {
  let result = parse(sdf);

  it('Check statistics', function () {
    expect(result.statistics[0].counter).toBe(128);
    expect(result.statistics[0].isNumeric).toBe(false);
    expect(result.statistics[0].label).toBe('Code');
    expect(result.statistics[1].counter).toBe(128);
    expect(result.statistics[1].minValue).toBe(0);
    expect(result.statistics[1].maxValue).toBe(5);
    expect(result.statistics[1].isNumeric).toBe(true);
    expect(result.statistics[1].label).toBe('Number of H-Donors');
    expect(result.statistics[0].always).toBe(true);
    expect(result.statistics[4].always).toBe(false);
  });

  it('Check molecules', function () {
    let molecule = result.molecules[0];
    expect(molecule.Code).toContain('0100380824');
    expect(molecule.CLogP).toBe(2.7);
    expect(molecule.molfile.split('\n')).toHaveLength(37);
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

describe('SDF Parser no dynamicTyping', function () {
  let result = parse(sdf, {
    dynamicTyping: false,
  });

  it('Check statistics', function () {
    expect(result.statistics[0].counter).toBe(128);
    expect(result.statistics[0].isNumeric).toBe(false);
    expect(result.statistics[0].label).toBe('Code');
    expect(result.statistics[1].counter).toBe(128);
    expect(result.statistics[1].minValue).toBeUndefined();
    expect(result.statistics[1].maxValue).toBeUndefined();
    expect(result.statistics[1].isNumeric).toBe(false);
    expect(result.statistics[1].label).toBe('Number of H-Donors');
    expect(result.statistics[0].always).toBe(true);
    expect(result.statistics[4].always).toBe(false);
  });

  it('Check molecules', function () {
    let molecule = result.molecules[0];
    expect(typeof molecule.Code).toBe('string');
    expect(typeof molecule.CLogP).toBe('string');
    expect(molecule.CLogP).toBe('2.700000000000000e+000');
    expect(molecule.molfile.split('\n')).toHaveLength(37);
  });
});

describe('SDF Parser one molecule', function () {
  let result = parse(sdf1);
  it('Check statistics', function () {
    expect(result.molecules).toHaveLength(1);
  });
});
