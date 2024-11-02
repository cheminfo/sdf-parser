import { parseString } from 'dynamic-typing';

/**
 *  Parse a SDF file
 * @param {ReadableStream} readStream - SDF file to parse
 * @param {object} [options={}]
 * @param {Function} [options.filter] - Callback allowing to filter the molecules
 * @param {string} [options.eol='\n'] - End of line character
 * @param {boolean} [options.dynamicTyping] - Dynamically type the data
 */
export async function* iterator(readStream, options = {}) {
  const { eol = '\n', dynamicTyping = true } = options;

  const lineStream = readStream.pipeThrough(createLineStream());
  const currentLines = [];
  if (options.dynamicTyping === undefined) options.dynamicTyping = true;

  for await (let line of lineStream) {
    if (line.startsWith('$$$$')) {
      const molecule = getMolecule(currentLines.join(eol), {
        eol,
        dynamicTyping,
      });
      if (!options.filter || options.filter(molecule)) {
        yield molecule;
      }
      currentLines.length = 0;
    } else {
      currentLines.push(line);
    }
  }
}

/**
 * Convert a SDF part to an object
 * @param {string} sdfPart
 * @param {object} options
 * @param {string} options.eol
 * @param {boolean} options.dynamicTyping
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

function createLineStream() {
  let buffer = '';
  return new TransformStream({
    async transform(chunk, controller) {
      buffer += chunk;
      let lines = buffer.split('\n');
      for (let i = 0; i < lines.length - 1; i++) {
        controller.enqueue(lines[i]);
      }
      buffer = lines.at(-1);
    },
    flush(controller) {
      if (buffer) controller.enqueue(buffer);
    },
  });
}
