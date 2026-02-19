import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { parse } from '../index.ts';

describe('SDF Parser options', () => {
  const sdf = readFileSync(join(import.meta.dirname, 'test.sdf'), 'utf8');
  const result = parse(sdf, {
    exclude: ['Number of H-Donors'],
    include: ['Number of H-Donors', 'CLogP', 'Code'],
    modifiers: {
      CLogP: (field) => {
        return {
          low: Number(field) - 0.2,
          high: Number(field) + 0.2,
        };
      },
    },
    filter: (entry) => {
      return entry.CLogP && entry.CLogP.low > 4;
    },
  });

  it('Check statistics', () => {
    expect(result.statistics[0].counter).toBe(43);
    expect(result.statistics[0].isNumeric).toBe(false);
    expect(result.statistics[0].label).toBe('Code');
    expect(result.statistics[0].always).toBe(true);
    expect(result.statistics[4].counter).toBe(43);
    expect(result.statistics[4].isNumeric).toBe(false);
    expect(result.statistics[4].label).toBe('CLogP');
    expect(result.statistics[4].always).toBe(true);
  });

  it('Check molecules', () => {
    expect(result.molecules).toHaveLength(43);

    const molecule = result.molecules[0];

    expect(Object.keys(molecule)).toHaveLength(3);
    expect(molecule.Code).toBe('0100380851');
    expect(molecule.CLogP.low).toBeCloseTo(4.8, 0.0001);
    expect(molecule.CLogP.high).toBeCloseTo(5.2, 0.0001);
    expect(molecule.molfile.split('\n')).toHaveLength(56);
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
