import { getEntriesBoundaries } from './getEntriesBoundaries';

export function parse(sdf, options = {}) {
  const {
    include,
    exclude,
    filter,
    modifiers = {},
    forEach = {},
    dynamicTyping = true,
  } = options;

  if (typeof sdf !== 'string') {
    throw new TypeError('Parameter "sdf" must be a string');
  }

  let eol = '\n';
  if (options.mixedEOL) {
    sdf = sdf.replace(/\r\n/g, '\n');
    sdf = sdf.replace(/\r/g, '\n');
  } else {
    // we will find the delimiter in order to be much faster and not use regular expression
    let header = sdf.substr(0, 1000);
    if (header.indexOf('\r\n') > -1) {
      eol = '\r\n';
    } else if (header.indexOf('\r') > -1) {
      eol = '\r';
    }
  }

  let entriesBoundaries = getEntriesBoundaries(sdf, `${eol}$$$$`, eol);
  let molecules = [];
  let labels = {};

  let start = Date.now();

  for (let i = 0; i < entriesBoundaries.length; i++) {
    let sdfPart = sdf.substring(...entriesBoundaries[i]);
    let parts = sdfPart.split(`${eol}>`);
    if (parts.length > 0 && parts[0].length > 5) {
      let molecule = {};
      let currentLabels = [];
      molecule.molfile = parts[0] + eol;
      for (let j = 1; j < parts.length; j++) {
        let lines = parts[j].split(eol);
        let from = lines[0].indexOf('<');
        let to = lines[0].indexOf('>');
        let label = lines[0].substring(from + 1, to);
        currentLabels.push(label);
        if (!labels[label]) {
          labels[label] = {
            counter: 0,
            isNumeric: dynamicTyping,
            keep: false,
          };
          if (
            (!exclude || exclude.indexOf(label) === -1) &&
            (!include || include.indexOf(label) > -1)
          ) {
            labels[label].keep = true;
            if (modifiers[label]) {
              labels[label].modifier = modifiers[label];
            }
            if (forEach[label]) {
              labels[label].forEach = forEach[label];
            }
          }
        }
        if (labels[label].keep) {
          for (let k = 1; k < lines.length - 1; k++) {
            if (molecule[label]) {
              molecule[label] += eol + lines[k];
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
          if (labels[label].isNumeric) {
            if (
              !isFinite(molecule[label]) ||
              molecule[label].match(/^0[0-9]/)
            ) {
              labels[label].isNumeric = false;
            }
          }
        }
      }
      if (!filter || filter(molecule)) {
        molecules.push(molecule);
        // only now we can increase the counter
        for (let j = 0; j < currentLabels.length; j++) {
          labels[currentLabels[j]].counter++;
        }
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
          let value = parseFloat(molecules[j][label]);
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
    molecules: molecules,
    labels: Object.keys(labels),
    statistics: statistics,
  };
}
