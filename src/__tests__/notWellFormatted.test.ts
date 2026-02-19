import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { parse } from '../index.ts';

describe('SDF Parser of non well formatted file', () => {
  it('Check molecules', () => {
    let sdf = readFileSync(join(import.meta.dirname, 'test2.sdf'), 'utf8');
    sdf = sdf.replaceAll('\r', '');
    const result = parse(sdf, { mixedEOL: true });

    const { molecules } = result;

    expect(molecules).toHaveLength(7);
  });
});
