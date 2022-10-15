import { createInterface } from 'readline';

import { parseString } from 'dynamic-typing';
/**
 *  Parse a SDF file
 * @param {NodeJS.ReadableStream} readStream SDF file to parse
 * @param {object} [options={}]
 * @param {Function} [options.filter] Callback allowing to filter the molecules
 * @param {boolean} [options.dynamicTyping] Dynamically type the data
 */

export async function* iterator(readStream, options = {}) {
  const lines = createInterface(readStream);
  const currentLines = [];
  options = { ...options };
  if (options.dynamicTyping === undefined) options.dynamicTyping = true;

  options.eol = '\n';
  for await (let line of lines) {
    if (line.startsWith('$$$$')) {
      const molecule = getMolecule(currentLines.join(options.eol), options);
      if (!options.filter || options.filter(molecule)) {
        yield molecule;
      }
      currentLines.length = 0;
    } else {
      currentLines.push(line);
    }
  }
}

function getMolecule(sdfPart, options) {
  let parts = sdfPart.split(`${options.eol}>`);
  if (parts.length === 0 || parts[0].length <= 5) return;
  let molecule = {};
  molecule.molfile = parts[0] + options.eol;
  for (let j = 1; j < parts.length; j++) {
    let lines = parts[j].split(options.eol);
    let from = lines[0].indexOf('<');
    let to = lines[0].indexOf('>');
    let label = lines[0].substring(from + 1, to);
    for (let k = 1; k < lines.length - 1; k++) {
      if (molecule[label]) {
        molecule[label] += options.eol + lines[k];
      } else {
        molecule[label] = lines[k];
      }
    }
    if (options.dynamicTyping) {
      molecule[label] = parseString(molecule[label]);
    }
  }
  return molecule;
}
