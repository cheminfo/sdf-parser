/**
 * Parse the molfile and the properties with > < labels >
 * @param {string} sdfPart
 * @param {*} labels
 * @param {*} currentLabels
 * @param {object} options
 * @returns
 */
export function getMolecule(sdfPart, labels, currentLabels, options) {
  let parts = sdfPart.split(`${options.eol}>`);
  if (parts.length === 0 || parts[0].length <= 5) return;
  let molecule = {};
  molecule.molfile = parts[0] + options.eol;
  for (let j = 1; j < parts.length; j++) {
    let lines = parts[j].split(options.eol);
    let from = lines[0].indexOf('<');
    let to = lines[0].indexOf('>');
    let label = lines[0].slice(from + 1, to);
    currentLabels.push(label);
    if (!labels[label]) {
      labels[label] = {
        counter: 0,
        isNumeric: options.dynamicTyping,
        keep: false,
      };
      if (
        (!options.exclude || !options.exclude.includes(label)) &&
        (!options.include || options.include.includes(label))
      ) {
        labels[label].keep = true;
        if (options.modifiers[label]) {
          labels[label].modifier = options.modifiers[label];
        }
        if (options.forEach[label]) {
          labels[label].forEach = options.forEach[label];
        }
      }
    }
    if (labels[label].keep) {
      for (let k = 1; k < lines.length - 1; k++) {
        if (molecule[label]) {
          molecule[label] += options.eol + lines[k];
        } else {
          molecule[label] = lines[k];
        }
      }
      if (labels[label].modifier) {
        let modifiedValue = labels[label].modifier(molecule[label]);
        if (modifiedValue === undefined || modifiedValue === null) {
          delete molecule[label];
        } else {
          molecule[label] = modifiedValue;
        }
      }
      if (
        labels[label].isNumeric &&
        (!Number.isFinite(+molecule[label]) || molecule[label].match(/^0[0-9]/))
      ) {
        labels[label].isNumeric = false;
      }
    }
  }
  return molecule;
}
