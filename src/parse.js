import { ensureString } from 'ensure-string';

import { getEntriesBoundaries } from './getEntriesBoundaries';
import { getMolecule } from './util/getMolecule';
/**
 *  Parse a SDF file
 * @param {string|ArrayBuffer|Uint8Array} sdf - SDF file to parse
 * @param {object} [options={}]
 * @param {string[]} [options.include] - List of fields to include
 * @param {string[]} [options.exclude] - List of fields to exclude
 * @param {Function} [options.filter] - Callback allowing to filter the molecules
 * @param {boolean} [options.dynamicTyping] - Dynamically type the data
 * @param {object} [options.modifiers] - Object containing callbacks to apply on some specific fields
 * @param {boolean} [options.mixedEOL=false] - Set to true if you know there is a mixture between \r\n and \n
 * @param {string} [options.eol] - Specify the end of line character. Default will be the one found in the file
 * @returns {object} - Object containing the molecules, the labels and the statistics
 */
export function parse(sdf, options = {}) {
  options = { ...options };
  if (options.modifiers === undefined) options.modifiers = {};
  if (options.forEach === undefined) options.forEach = {};
  if (options.dynamicTyping === undefined) options.dynamicTyping = true;

  sdf = ensureString(sdf);
  if (typeof sdf !== 'string') {
    throw new TypeError('Parameter "sdf" must be a string');
  }

  if (options.eol === undefined) {
    options.eol = '\n';
    if (options.mixedEOL) {
      sdf = sdf.replaceAll('\r\n', '\n');
      sdf = sdf.replaceAll('\r', '\n');
    } else {
      // we will find the delimiter in order to be much faster and not use regular expression
      let header = new Set(sdf.slice(0, 1000));
      if (header.has('\r\n')) {
        options.eol = '\r\n';
      } else if (header.has('\r')) {
        options.eol = '\r';
      }
    }
  }

  let entriesBoundaries = getEntriesBoundaries(
    sdf,
    `${options.eol}$$$$`,
    options.eol,
  );
  let molecules = [];
  let labels = {};

  let start = Date.now();

  for (let i = 0; i < entriesBoundaries.length; i++) {
    let sdfPart = sdf.slice(...entriesBoundaries[i]);
    if (sdfPart.length < 40) continue;
    let currentLabels = [];
    const molecule = getMolecule(sdfPart, labels, currentLabels, options);
    if (!molecule) continue;
    if (!options.filter || options.filter(molecule)) {
      molecules.push(molecule);
      // only now we can increase the counter
      for (let j = 0; j < currentLabels.length; j++) {
        labels[currentLabels[j]].counter++;
      }
    }
  }
  // all numeric fields should be converted to numbers
  for (let label in labels) {
    let currentLabel = labels[label];
    if (currentLabel.isNumeric) {
      currentLabel.minValue = Infinity;
      currentLabel.maxValue = -Infinity;
      for (let j = 0; j < molecules.length; j++) {
        if (molecules[j][label]) {
          let value = Number.parseFloat(molecules[j][label]);
          molecules[j][label] = value;
          if (value > currentLabel.maxValue) {
            currentLabel.maxValue = value;
          }
          if (value < currentLabel.minValue) {
            currentLabel.minValue = value;
          }
        }
      }
    }
  }

  // we check that a label is in all the records
  for (let key in labels) {
    if (labels[key].counter === molecules.length) {
      labels[key].always = true;
    } else {
      labels[key].always = false;
    }
  }

  let statistics = [];
  for (let key in labels) {
    let statistic = labels[key];
    statistic.label = key;
    statistics.push(statistic);
  }

  return {
    time: Date.now() - start,
    molecules,
    labels: Object.keys(labels),
    statistics,
  };
}
