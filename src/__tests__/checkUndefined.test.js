import fs from 'node:fs';

import { describe, expect, it } from 'vitest';

import { parse } from '..';

describe('SDF Parser options and undefined', () => {
  const sdf = fs.readFileSync(`${__dirname}/test.sdf`, 'utf8');
  const result = parse(sdf, {
    exclude: ['Number of H-Donors'],
    include: ['Number of H-Donors', 'CLogP', 'Code'],
    modifiers: {
      CLogP: () => {
        return undefined;
      },
    },
    filter: (entry) => {
      return entry.CLogP && entry.CLogP.low > 4;
    },
  });

  it('Check molecules', () => {
    expect(result.molecules).toHaveLength(0);
  });
});
