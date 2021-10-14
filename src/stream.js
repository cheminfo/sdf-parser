import pipeline from 'pumpify';
import split2 from 'split2';
import through2 from 'through2';
import filter from 'through2-filter';

import { parse } from './parse';

const filterStream = filter.bind(null, { objectMode: true });
function filterCb(chunk) {
  return chunk.length > 1 && chunk.trim().length > 1;
}

export function entries() {
  return pipeline.obj(
    split2(/\r?\n\${4}.*\r?\n/),
    filterStream(filterCb),
    through2({ objectMode: true }, function process(value, encoding, callback) {
      const eol = value.includes('\r\n') ? '\r\n' : '\n';
      this.push(`${value + eol}$$$$${eol}`);
      callback();
    }),
  );
}

export function molecules(options) {
  return pipeline.obj(
    entries(),
    through2({ objectMode: true }, function process(value, encoding, callback) {
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
    }),
  );
}
