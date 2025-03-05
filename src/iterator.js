import { parseString } from 'dynamic-typing';

import { MolfileStream } from './MolfileStream.js';

/**
 *  Parse a SDF file as an iterator
 * @param {ReadableStream} readStream - SDF file to parse
 * @param {object} [options={}] - iterator options
 * @param {Function} [options.filter] - Callback allowing to filter the molecules
 * @param {string} [options.eol='\n'] - End of line character
 * @param {boolean} [options.dynamicTyping] - Dynamically type the data
 * @yields {object} - Molecule object
 */
export async function* iterator(readStream, options = {}) {
  const { eol = '\n', dynamicTyping = true } = options;

  const moleculeStream = readStream.pipeThrough(new MolfileStream({ eol }));
  for await (const entry of moleculeStream) {
    const molecule = getMolecule(entry, {
      eol,
      dynamicTyping,
    });
    if (!options.filter || options.filter(molecule)) {
      yield molecule;
    }
  }
}

/**
 * Convert a SDF part to an object
 * @param {string} sdfPart - text containing the molfile
 * @param {object} options - options
 * @param {string} options.eol - end of line character
 * @param {boolean} options.dynamicTyping - Dynamically type the data (create numbers and booleans)
 * @returns
 */
function getMolecule(sdfPart, options) {
  const { eol, dynamicTyping } = options;
  let parts = sdfPart.split(`${eol}>`);
  if (parts.length === 0 || parts[0].length <= 5) return;
  let molecule = {};
  molecule.molfile = parts[0] + eol;
  for (let j = 1; j < parts.length; j++) {
    let lines = parts[j].split(eol);
    let from = lines[0].indexOf('<');
    let to = lines[0].indexOf('>');
    let label = lines[0].slice(from + 1, to);
    for (let k = 1; k < lines.length - 1; k++) {
      if (molecule[label]) {
        molecule[label] += eol + lines[k];
      } else {
        molecule[label] = lines[k];
      }
    }
    if (dynamicTyping) {
      molecule[label] = parseString(molecule[label]);
    }
  }
  return molecule;
}
