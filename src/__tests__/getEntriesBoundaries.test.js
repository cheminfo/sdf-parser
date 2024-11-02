import fs from 'node:fs';

import { test, expect } from 'vitest';

import { getEntriesBoundaries } from '../getEntriesBoundaries';

let sdf0 = fs.readFileSync(`${__dirname}/test.sdf`, 'utf8');
let sdf1 = fs.readFileSync(`${__dirname}/test1.sdf`, 'utf8');
let sdf2 = fs.readFileSync(`${__dirname}/test2.sdf`, 'utf8');

for (const sdf of [sdf0, sdf1, sdf2]) {
  let eol = '\n';
  let header = new Set(sdf.slice(0, 1000));
  if (header.has('\r\n')) {
    eol = '\r\n';
  } else if (header.has('\r')) {
    eol = '\r';
  }

  test('Split should match regex behavior', () => {
    let sdfParts = sdf.split(new RegExp(`${eol}\\$\\$\\$\\$.*${eol}`));
    expect(sdfParts).toStrictEqual(
      getEntriesBoundaries(sdf, `${eol}$$$$`, eol).map((v) => sdf.slice(...v)),
    );
  });
}

test('should parse sdf files without EOL in the EOF', () => {
  const eol = '\n';
  const sdf = fs.readFileSync(`${__dirname}/test4.sdf`, 'utf8');

  expect(getEntriesBoundaries(sdf, `${eol}$$$$`, eol)).toMatchSnapshot();
});
