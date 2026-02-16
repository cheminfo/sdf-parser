import fs from 'node:fs';

import { describe, expect, it } from 'vitest';

import { parse } from '..';

describe('SDF Parser of non well formatted file', () => {
  it('Check molecules', () => {
    let sdf = fs.readFileSync(`${__dirname}/test2.sdf`, 'utf8');
    sdf = sdf.replaceAll('\r', '');
    const result = parse(sdf, { mixedEOL: true });

    const molecules = result.molecules;

    expect(molecules).toHaveLength(7);
  });
});
