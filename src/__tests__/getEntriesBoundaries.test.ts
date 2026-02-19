import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import { getEntriesBoundaries } from '../getEntriesBoundaries.ts';

test.for(['test', 'test1', 'test2'])(
  'Split should match regex behavior - %s.sdf',
  (file) => {
    const sdf = readFileSync(join(import.meta.dirname, `${file}.sdf`), 'utf8');

    const eol = getEol(sdf);

    const sdfParts = sdf.split(new RegExp(String.raw`${eol}\$\$\$\$.*${eol}`));

    expect(sdfParts).toStrictEqual(
      getEntriesBoundaries(sdf, `${eol}$$$$`, eol).map((v) => sdf.slice(...v)),
    );
  },
);

function getEol(sdf: string): string {
  // A set would not work for \r\n matching.
  // eslint-disable-next-line unicorn/prefer-set-has
  const header = sdf.slice(0, 1000);
  if (header.includes('\r\n')) {
    return '\r\n';
  } else if (header.includes('\r')) {
    return '\r';
  } else {
    return '\n';
  }
}

test('should parse sdf files without EOL in the EOF', () => {
  const eol = '\n';
  const sdf = readFileSync(join(import.meta.dirname, 'test4.sdf'), 'utf8');

  expect(getEntriesBoundaries(sdf, `${eol}$$$$`, eol)).toMatchSnapshot();
});
