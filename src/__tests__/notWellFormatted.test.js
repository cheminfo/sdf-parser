import fs from 'fs';

import { parse } from '..';

describe('SDF Parser of non well formatted file', () => {
  let sdf = fs.readFileSync(`${__dirname}/test2.sdf`, 'utf-8');
  sdf = sdf.replace(/\r/g, '');
  let result = parse(sdf, { mixedEOL: true });

  it('Check molecules', () => {
    let molecules = result.molecules;
    expect(molecules).toHaveLength(7);
  });
});
