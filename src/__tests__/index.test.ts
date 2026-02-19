import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { parse } from '../index.ts';

const sdf = readFileSync(join(import.meta.dirname, 'test.sdf'), 'utf8');
const sdf1 = readFileSync(join(import.meta.dirname, 'test1.sdf'), 'utf8');

describe('SDF Parser', () => {
  const result = parse(sdf);

  it('Check statistics', () => {
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

  it('Check molecules', () => {
    const molecule = result.molecules[0];

    expect(molecule.Code).toContain('0100380824');
    expect(molecule.CLogP).toBe(2.7);
    expect(molecule.molfile.split('\n')).toHaveLength(37);
  });

  it('should throw with non-string argument', () => {
    expect(() => {
      parse(undefined);
    }).toThrowError(TypeError);
    expect(() => {
      parse(42);
    }).toThrowError(TypeError);
    expect(() => {
      parse({});
    }).toThrowError(TypeError);
  });
});

describe('SDF Parser no dynamicTyping', () => {
  const result = parse(sdf, {
    dynamicTyping: false,
  });

  it('Check statistics', () => {
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

  it('Check molecules', () => {
    const molecule = result.molecules[0];

    expect(typeof molecule.Code).toBe('string');
    expect(typeof molecule.CLogP).toBe('string');
    expect(molecule.CLogP).toBe('2.700000000000000e+000');
    expect(molecule.molfile.split('\n')).toHaveLength(37);
  });
});

describe('SDF Parser one molecule', () => {
  it('Check statistics', () => {
    const result = parse(sdf1);

    expect(result.molecules).toHaveLength(1);
  });
});
