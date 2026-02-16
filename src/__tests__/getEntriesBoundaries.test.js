import fs from 'node:fs';

import { expect, test } from 'vitest';

import { getEntriesBoundaries } from '../getEntriesBoundaries';

test.for(['test', 'test1', 'test2'])(
  'Split should match regex behavior - %s.sdf',
  (file) => {
    const sdf = fs.readFileSync(`${__dirname}/${file}.sdf`, 'utf8');

    const eol = getEol(sdf);

    let sdfParts = sdf.split(new RegExp(String.raw`${eol}\$\$\$\$.*${eol}`));

    expect(sdfParts).toStrictEqual(
      getEntriesBoundaries(sdf, `${eol}$$$$`, eol).map((v) => sdf.slice(...v)),
    );
  },
);

function getEol(sdf) {
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
  const sdf = fs.readFileSync(`${__dirname}/test4.sdf`, 'utf8');

  expect(getEntriesBoundaries(sdf, `${eol}$$$$`, eol)).toMatchSnapshot();
});
