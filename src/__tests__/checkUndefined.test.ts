import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { parse } from '../index.ts';

describe('SDF Parser options and undefined', () => {
  const sdf = readFileSync(join(import.meta.dirname, 'test.sdf'), 'utf8');
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
