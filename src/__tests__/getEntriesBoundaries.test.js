import fs from 'fs';

import { getEntriesBoundaries } from '../getEntriesBoundaries';

let sdf0 = fs.readFileSync(`${__dirname}/test.sdf`, 'utf-8');
let sdf1 = fs.readFileSync(`${__dirname}/test1.sdf`, 'utf-8');
let sdf2 = fs.readFileSync(`${__dirname}/test2.sdf`, 'utf-8');

[sdf0, sdf1, sdf2].forEach((sdf) => {
  let eol = '\n';
  let header = sdf.substr(0, 1000);
  if (header.indexOf('\r\n') > -1) {
    eol = '\r\n';
  } else if (header.indexOf('\r') > -1) {
    eol = '\r';
  }

  test('Split should match regex behavior', () => {
    let sdfParts = sdf.split(new RegExp(`${eol}\\$\\$\\$\\$.*${eol}`));
    expect(sdfParts).toStrictEqual(
      getEntriesBoundaries(sdf, `${eol}$$$$`, eol).map((v) =>
        sdf.substring(...v),
      ),
    );
  });
});
