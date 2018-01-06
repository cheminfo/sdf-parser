'use strict';

const combine = require('multipipe');
const split2 = require('split2');
const filter = require('through2-filter');
const through2 = require('through2');

const parse = require('./parse');

const filterStream = filter.bind(null, {objectMode: true});
function filterCb(chunk) {
    return chunk.length > 1 && chunk.trim().length > 1;
}

function entries() {
    return combine(
        split2(/\r?\n\${4}.*\r?\n/),
        filterStream(filterCb),
        through2({objectMode: true}, function (value, encoding, callback) {
            const eol = value.includes('\r\n') ? '\r\n' : '\n';
            this.push(value + eol + '$$$$' + eol);
            callback();
        })
    );
}

function molecules(options) {
    return combine(
        entries(),
        through2({objectMode: true}, function (value, encoding, callback) {
            try {
                const parsed = parse(value, options);
                if (parsed.molecules.length === 1) {
                    if (options && options.fullResult) {
                        this.push(parsed);
                    } else {
                        this.push(parsed.molecules[0]);
                    }
                }
                callback();
            } catch (e) {
                callback(e);
            }
        })
    );
}

module.exports = {
    entries,
    molecules
};
