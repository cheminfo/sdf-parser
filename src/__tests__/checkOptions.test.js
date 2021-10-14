import fs from 'fs';

import { parse } from '..';

let sdf = fs.readFileSync(`${__dirname}/test.sdf`, 'utf-8');

describe('SDF Parser options', () => {
  let result = parse(sdf, {
    exclude: ['Number of H-Donors'],
    include: ['Number of H-Donors', 'CLogP', 'Code'],
    modifiers: {
      CLogP: (field) => {
        return {
          low: field * 1 - 0.2,
          high: field * 1 + 0.2,
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
    let molecule = result.molecules[0];

    expect(Object.keys(molecule)).toHaveLength(3);
    expect(molecule.Code).toBe('0100380851');
    expect(molecule.CLogP.low).toBeCloseTo(4.8, 0.0001);
    expect(molecule.CLogP.high).toBeCloseTo(5.2, 0.0001);
    expect(molecule.molfile.split('\n')).toHaveLength(56);
  });

  it('should throw with non-string argument', () => {
    expect(() => {
      parse();
    }).toThrow(TypeError);
    expect(() => {
      parse(42);
    }).toThrow(TypeError);
    expect(() => {
      parse({});
    }).toThrow(TypeError);
  });
});
