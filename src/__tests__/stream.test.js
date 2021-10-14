import fs from 'fs';

import callbackStream from 'callback-stream';
import OCL from 'openchemlib/minimal';

import { entries, molecules } from '..';

const cbStream = callbackStream.bind(null, { objectMode: true });

describe('stream', () => {
  it('entries', () =>
    new Promise((resolve) => {
      fs.createReadStream(`${__dirname}/test.sdf`)
        .pipe(entries())
        .pipe(
          cbStream((err, data) => {
            expect(err).toBeNull();
            expect(data).toHaveLength(128);
            expect(data[0]).toContain('-ISIS-  04231216572D');
            const mol = OCL.Molecule.fromMolfile(data[5]);
            expect(mol.toMolfile()).toContain(
              '17 18  0  0  0  0  0  0  0  0999 V2000',
            );
            resolve();
          }),
        );
    }));

  it('molecules', () =>
    new Promise((resolve) => {
      fs.createReadStream(`${__dirname}/test.sdf`)
        .pipe(molecules())
        .pipe(
          cbStream((err, data) => {
            expect(err).toBeNull();
            expect(data).toHaveLength(128);
            expect(data[0]).toMatchObject({
              Code: '0100380824',
              CLogP: 2.7,
            });
            expect(data[0].molfile).toContain('-ISIS-  04231216572D');
            resolve();
          }),
        );
    }));

  it('molecules - full result', () =>
    new Promise((resolve) => {
      fs.createReadStream(`${__dirname}/test.sdf`)
        .pipe(molecules({ fullResult: true }))
        .pipe(
          cbStream((err, data) => {
            expect(err).toBeNull();
            expect(data).toHaveLength(128);
            expect(data[0]).toMatchObject({
              labels: [
                'Code',
                'Number of H-Donors',
                'Number of H-Acceptors',
                'Number of Rotatable bonds',
                'CLogP',
              ],
            });
            expect(data[0].molecules).toHaveLength(1);
            resolve();
          }),
        );
    }));

  it('molecules with filter', () =>
    new Promise((resolve) => {
      fs.createReadStream(`${__dirname}/test.sdf`)
        .pipe(
          molecules({
            filter: (entry) => entry.Code === '0100380869',
          }),
        )
        .pipe(
          cbStream((err, data) => {
            expect(err).toBeNull();
            expect(data).toHaveLength(1);
            resolve();
          }),
        );
    }));

  it('async iteration', async () => {
    const stream = fs
      .createReadStream(`${__dirname}/test.sdf`)
      .pipe(molecules());
    let count = 0;
    for await (const molecule of stream) {
      count++;
      expect(molecule.molfile.toString()).toContain('0999 V2000');
    }
    expect(count).toBe(128);
  });
});
