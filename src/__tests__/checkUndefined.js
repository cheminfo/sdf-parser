import fs from 'fs';

import { parse } from '..';

let sdf = fs.readFileSync(`${__dirname}/test.sdf`, 'utf-8');

describe('SDF Parser options and undefined', () => {
  let result = parse(sdf, {
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
