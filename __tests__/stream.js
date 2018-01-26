'use strict';

const callbackStream = require('callback-stream');
const fs = require('fs');
const OCL = require('openchemlib/minimal');

const cbStream = callbackStream.bind(null, {objectMode: true});

const {
    entries,
    molecules
} = require('..').stream;

describe('stream', () => {
    it('entries', (done) => {
        fs.createReadStream(__dirname + '/test.sdf')
            .pipe(entries())
            .pipe(cbStream((err, data) => {
                expect(data).toHaveLength(128);
                expect(data[0]).toContain('-ISIS-  04231216572D');
                const mol = OCL.Molecule.fromMolfile(data[5]);
                expect(mol.toMolfile()).toContain('17 18  0  0  0  0  0  0  0  0999 V2000');
                done();
            }));
    });

    it('molecules', (done) => {
        fs.createReadStream(__dirname + '/test.sdf')
            .pipe(molecules())
            .pipe(cbStream((err, data) => {
                expect(data).toHaveLength(128);
                expect(data[0]).toMatchObject({
                    Code: '0100380824',
                    CLogP: 2.7
                });
                expect(data[0].molfile).toContain('-ISIS-  04231216572D');
                done();
            }));
    });

    it('molecules - full result', (done) => {
        fs.createReadStream(__dirname + '/test.sdf')
            .pipe(molecules({fullResult: true}))
            .pipe(cbStream((err, data) => {
                expect(data).toHaveLength(128);
                expect(data[0]).toMatchObject({
                    labels: ['Code', 'Number of H-Donors', 'Number of H-Acceptors', 'Number of Rotatable bonds', 'CLogP']
                });
                expect(data[0].molecules).toHaveLength(1);
                done();
            }));
    });

    it('molecules with filter', (done) => {
        fs.createReadStream(__dirname + '/test.sdf')
            .pipe(molecules({
                filter: (entry) => entry.Code === '0100380869'
            }))
            .pipe(cbStream((err, data) => {
                expect(data).toHaveLength(1);
                done();
            }));
    });
});
