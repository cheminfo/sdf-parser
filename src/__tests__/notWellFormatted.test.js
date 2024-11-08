import fs from 'node:fs';

import { describe, it, expect } from 'vitest';

import { parse } from '..';

describe('SDF Parser of non well formatted file', () => {
  let sdf = fs.readFileSync(`${__dirname}/test2.sdf`, 'utf8');
  sdf = sdf.replaceAll('\r', '');
  let result = parse(sdf, { mixedEOL: true });

  it('Check molecules', () => {
    let molecules = result.molecules;
    expect(molecules).toHaveLength(7);
  });
});
