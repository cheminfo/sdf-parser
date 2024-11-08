import { openAsBlob } from 'node:fs';
import { join } from 'node:path';

import { fileCollectionFromPath } from 'filelist-utils';
import { test, expect } from 'vitest';

import { iterator } from '../iterator';

test('iterator', async () => {
  const fileCollection = await fileCollectionFromPath(join(__dirname, '.'));
  const file = fileCollection.files.find((f) => f.name === 'test.sdf');
  const results = [];

  const textDecoder = new TextDecoderStream();
  for await (const entry of iterator(file.stream().pipeThrough(textDecoder))) {
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

test.skipIf(process.version.startsWith('v18'))('iterator on stream', async () => {
  const file = await openAsBlob(join(__dirname, 'test.sdf.gz'));

  const decompressionStream = new DecompressionStream('gzip');
  const textDecoder = new TextDecoderStream();

  const stream = file
    .stream()
    .pipeThrough(decompressionStream)
    .pipeThrough(textDecoder);
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
  const fileCollection = await fileCollectionFromPath(join(__dirname, '.'));
  const file = fileCollection.filter((file) => file.size === 32233).files[0];
  const results = [];

  const textDecoder = new TextDecoderStream();
  for await (const entry of iterator(file.stream().pipeThrough(textDecoder))) {
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
