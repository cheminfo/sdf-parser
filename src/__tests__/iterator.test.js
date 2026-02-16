import { openAsBlob } from 'node:fs';
import { join } from 'node:path';

import { FileCollection } from 'file-collection';
import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import { iterator } from '../iterator';

test('iterator', async () => {
  const fileCollection = new FileCollection({ ungzip: { gzipExtensions: [] } });
  await fileCollection.appendPath(__dirname);
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

test.skipIf(process.version.startsWith('v18'))(
  'iterator on stream diol.sdf',
  async () => {
    const file = await openAsBlob(join(__dirname, 'diol.sdf'));

    const textDecoder = new TextDecoderStream();
    const results = [];

    for await (const entry of iterator(
      file.stream().pipeThrough(textDecoder),
    )) {
      results.push(entry);
    }

    expect(results).toHaveLength(3);
    expect(results[1]).toMatchInlineSnapshot(`
      {
        "ID": 1234,
        "molfile": "Untitled Document-2
        ChemDraw10111017012D

        6  5  0  0  0  0  0  0  0  0999 V2000
         -0.3572    0.8250    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
          0.3572    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
          1.0717    0.8250    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
         -1.0717    0.4125    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
          0.3572   -0.4125    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0
          1.0717   -0.8250    0.0000 H   1  0  0  0  0  0  0  0  0  0  0  0
        1  2  1  0      
        2  3  1  0      
        1  4  1  0      
        2  5  1  0      
        5  6  1  0      
      M  END
      ",
      }
    `);

    for (const entry of results) {
      const molecule = Molecule.fromMolfile(entry.molfile);

      expect(molecule.getAllAtoms()).toBe(6);
    }
  },
);

test.skipIf(process.version.startsWith('v18'))(
  'iterator on stream, no decompression',
  async () => {
    const file = await openAsBlob(join(__dirname, 'test2.sdf'));

    const textDecoder = new TextDecoderStream();

    const stream = file.stream().pipeThrough(textDecoder);
    const results = [];

    for await (const entry of iterator(stream)) {
      results.push(entry);
    }

    expect(results).toHaveLength(7);
    expect(results[2]).toMatchInlineSnapshot(`
      {
        "Field Strength [MHz]": "0:50.328 ",
        "Solvent": "0:Acetone-D6 ((CD3)2CO) ",
        "Spectrum 13C 0": "23.3;0.0Q;8|23.3;0.0Q;9|23.5;0.0Q;5|23.5;0.0Q;6|26.1;0.0Q;10|60.5;0.0S;2|90.0;0.0S;4|132.1;0.0D;1|",
        "Temperature [K]": "0:298 ",
        "molfile": "1,2,2,5,5-Pentamethyl-3-imidazoline 3-oxide
        CDK
      nmrshiftdb2 2189
       11 11  0  0  0  0  0  0  0  0999 V2000
         -2.4127   -1.4040    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
         -3.2376   -1.3998    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
         -3.4965   -2.1831    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
         -2.8315   -2.6713    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
         -2.1618   -2.1898    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
         -1.3666   -1.9706    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
         -1.4499   -2.5998    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
         -1.8331   -0.8125    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
         -4.2164   -1.7665    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
         -4.0872   -2.7622    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
         -2.8372   -3.4955    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
        1  2  2  0  0  0  0 
        5  6  1  0  0  0  0 
        5  7  1  0  0  0  0 
        2  3  1  0  0  0  0 
        1  8  1  0  0  0  0 
        3  4  1  0  0  0  0 
        3  9  1  0  0  0  0 
        4  5  1  0  0  0  0 
        3 10  1  0  0  0  0 
        5  1  1  0  0  0  0 
        4 11  1  0  0  0  0 
      M  CHG  1   1   1
      M  CHG  1   8  -1
      M  END
      ",
        "nmrshiftdb2 ID": 2189,
      }
    `);

    for (const entry of results) {
      const molecule = Molecule.fromMolfile(entry.molfile);

      expect(molecule.getAllAtoms()).toBeGreaterThan(5);
    }
  },
);

test.skipIf(process.version.startsWith('v18'))(
  'iterator on stream with decompression',
  async () => {
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

    for (const entry of results) {
      const molecule = Molecule.fromMolfile(entry.molfile);

      expect(molecule.getAllAtoms()).toBeGreaterThan(6);
    }
  },
);

test('iterator on fileCollection stream and decompression on the fly', async () => {
  const fileCollection = new FileCollection({
    ungzip: { gzipExtensions: [] },
  });
  await fileCollection.appendPath(__dirname);

  const byteStream = fileCollection.files.find((file) => file.size === 32233);
  const results = [];

  const decompressionStream = byteStream
    .stream()
    .pipeThrough(new DecompressionStream('gzip'));

  const textDecoder = new TextDecoderStream();
  for await (const entry of iterator(
    decompressionStream.pipeThrough(textDecoder),
  )) {
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
