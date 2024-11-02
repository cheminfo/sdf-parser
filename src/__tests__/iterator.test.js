import { createReadStream, ReadStream } from 'fs';
import { join } from 'path';
import { createGunzip } from 'zlib';

import { fileCollectionFromPath } from 'filelist-utils';
import { test, expect } from 'vitest';

import { iterator } from '../iterator';

test('iterator', async () => {
  const files = (
    await fileCollectionFromPath(join(__dirname, '.'))
  ).files.filter((file) => file.name === 'test.sdf');
  const results = [];

  if (parseInt(process.versions.node, 10) >= 18) {
    for await (const entry of iterator(ReadStream.fromWeb(files[0].stream()))) {
      results.push(entry);
    }
    expect(results).toHaveLength(128);
    expect(results[0]).toMatchInlineSnapshot(`
    {
      "CLogP": 2.7,
      "Code": 100380824,
      "Number of H-Acceptors": 3,
      "Number of H-Donors": 1,
      "Number of Rotatable bonds": 1,
      "molfile": "
      -ISIS-  04231216572D

     15 16  0  0  0  0  0  0  0  0999 V2000
        2.4792    1.7000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
        2.4292    0.3500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
        0.4042    1.1208    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
        1.2167    2.1833    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
        1.1542   -0.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0
       -0.9208    1.1208    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
        3.4792   -0.4500    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
        0.8792    3.4458    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
       -1.6000   -0.0292    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
       -0.9625   -1.1792    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
       -1.6208   -2.3292    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
       -0.9125   -3.4375    0.0000 Br  0  0  0  0  0  0  0  0  0  0  0  0
       -3.5958   -1.1792    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
       -2.9208   -0.0292    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
       -3.0333   -2.3292    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
      2  1  1  0  0  0  0
      3  4  1  0  0  0  0
      4  1  1  0  0  0  0
      5  2  1  0  0  0  0
      6  3  2  0  0  0  0
      7  2  2  0  0  0  0
      8  4  2  0  0  0  0
      9  6  1  0  0  0  0
     10  9  2  0  0  0  0
     11 10  1  0  0  0  0
     12 11  1  0  0  0  0
     13 14  2  0  0  0  0
     14  9  1  0  0  0  0
     15 13  1  0  0  0  0
      3  5  1  0  0  0  0
     15 11  2  0  0  0  0
    M  END
    ",
    }
  `);
  }
});

test('iterator on stream', async () => {
  const readStream = createReadStream(join(__dirname, 'test.sdf.gz'));
  const stream = readStream.pipe(createGunzip());
  const results = [];
  for await (const entry of iterator(stream)) {
    results.push(entry);
  }
  expect(results).toHaveLength(128);
  expect(results[0]).toMatchInlineSnapshot(`
    {
      "CLogP": 2.7,
      "Code": 100380824,
      "Number of H-Acceptors": 3,
      "Number of H-Donors": 1,
      "Number of Rotatable bonds": 1,
      "molfile": "
      -ISIS-  04231216572D

     15 16  0  0  0  0  0  0  0  0999 V2000
        2.4792    1.7000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
        2.4292    0.3500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
        0.4042    1.1208    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
        1.2167    2.1833    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
        1.1542   -0.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0
       -0.9208    1.1208    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
        3.4792   -0.4500    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
        0.8792    3.4458    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
       -1.6000   -0.0292    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
       -0.9625   -1.1792    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
       -1.6208   -2.3292    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
       -0.9125   -3.4375    0.0000 Br  0  0  0  0  0  0  0  0  0  0  0  0
       -3.5958   -1.1792    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
       -2.9208   -0.0292    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
       -3.0333   -2.3292    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
      2  1  1  0  0  0  0
      3  4  1  0  0  0  0
      4  1  1  0  0  0  0
      5  2  1  0  0  0  0
      6  3  2  0  0  0  0
      7  2  2  0  0  0  0
      8  4  2  0  0  0  0
      9  6  1  0  0  0  0
     10  9  2  0  0  0  0
     11 10  1  0  0  0  0
     12 11  1  0  0  0  0
     13 14  2  0  0  0  0
     14  9  1  0  0  0  0
     15 13  1  0  0  0  0
      3  5  1  0  0  0  0
     15 11  2  0  0  0  0
    M  END
    ",
    }
  `);
});

test('iterator on fileCollection stream', async () => {
  const file = (await fileCollectionFromPath(join(__dirname, '.'))).filter(
    (file) => file.size === 32233,
  ).files[0];
  const results = [];

  if (parseInt(process.versions.node, 10) >= 18) {
    for await (const entry of iterator(ReadStream.fromWeb(file.stream()))) {
      results.push(entry);
    }
    expect(results).toHaveLength(128);
    expect(results[0]).toMatchInlineSnapshot(`
    {
      "CLogP": 2.7,
      "Code": 100380824,
      "Number of H-Acceptors": 3,
      "Number of H-Donors": 1,
      "Number of Rotatable bonds": 1,
      "molfile": "
      -ISIS-  04231216572D

     15 16  0  0  0  0  0  0  0  0999 V2000
        2.4792    1.7000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
        2.4292    0.3500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
        0.4042    1.1208    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
        1.2167    2.1833    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
        1.1542   -0.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0
       -0.9208    1.1208    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
        3.4792   -0.4500    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
        0.8792    3.4458    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
       -1.6000   -0.0292    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
       -0.9625   -1.1792    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
       -1.6208   -2.3292    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
       -0.9125   -3.4375    0.0000 Br  0  0  0  0  0  0  0  0  0  0  0  0
       -3.5958   -1.1792    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
       -2.9208   -0.0292    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
       -3.0333   -2.3292    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
      2  1  1  0  0  0  0
      3  4  1  0  0  0  0
      4  1  1  0  0  0  0
      5  2  1  0  0  0  0
      6  3  2  0  0  0  0
      7  2  2  0  0  0  0
      8  4  2  0  0  0  0
      9  6  1  0  0  0  0
     10  9  2  0  0  0  0
     11 10  1  0  0  0  0
     12 11  1  0  0  0  0
     13 14  2  0  0  0  0
     14  9  1  0  0  0  0
     15 13  1  0  0  0  0
      3  5  1  0  0  0  0
     15 11  2  0  0  0  0
    M  END
    ",
    }
  `);
  }
});
