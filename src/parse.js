'use strict';

function parse(sdf, options = {}) {
    const {
        include,
        exclude,
        filter,
        modifiers = {},
        forEach = {},
        dynamicTyping = true
    } = options;

    if (typeof sdf !== 'string') {
        throw new TypeError('Parameter "sdf" must be a string');
    }

    var eol = '\n';
    if (options.mixedEOL) {
        sdf = sdf.replace(/\r\n/g, '\n');
        sdf = sdf.replace(/\r/g, '\n');
    } else {
        // we will find the delimiter in order to be much faster and not use regular expression
        var header = sdf.substr(0, 1000);
        if (header.indexOf('\r\n') > -1) {
            eol = '\r\n';
        } else if (header.indexOf('\r') > -1) {
            eol = '\r';
        }
    }

    var sdfParts = sdf.split(new RegExp(eol + '\\$\\$\\$\\$.*' + eol));
    var molecules = [];
    var labels = {};

    var start = Date.now();

    for (var i = 0; i < sdfParts.length; i++) {
        var sdfPart = sdfParts[i];
        var parts = sdfPart.split(eol + '>');
        if (parts.length > 0 && parts[0].length > 5) {
            var molecule = {};
            var currentLabels = [];
            molecule.molfile = parts[0] + eol;
            for (var j = 1; j < parts.length; j++) {
                var lines = parts[j].split(eol);
                var from = lines[0].indexOf('<');
                var to = lines[0].indexOf('>');
                var label = lines[0].substring(from + 1, to);
                currentLabels.push(label);
                if (!labels[label]) {
                    labels[label] = {
                        counter: 0,
                        isNumeric: dynamicTyping,
                        keep: false
                    };
                    if (
                        (!exclude || exclude.indexOf(label) === -1) &&
                        (!include || include.indexOf(label) > -1)
                    ) {
                        labels[label].keep = true;
                        if (modifiers[label]) labels[label].modifier = modifiers[label];
                        if (forEach[label]) labels[label].forEach = forEach[label];
                    }
                }
                if (labels[label].keep) {
                    for (var k = 1; k < lines.length - 1; k++) {
                        if (molecule[label]) {
                            molecule[label] += eol + lines[k];
                        } else {
                            molecule[label] = lines[k];
                        }
                    }
                    if (labels[label].modifier) {
                        var modifiedValue = labels[label].modifier(molecule[label]);
                        if (modifiedValue === undefined || modifiedValue === null) {
                            delete molecule[label];
                        } else {
                            molecule[label] = modifiedValue;
                        }
                    }
                    if (labels[label].isNumeric) {
                        if (!isFinite(molecule[label]) || molecule[label].match(/^0[0-9]/)) {
                            labels[label].isNumeric = false;
                        }
                    }
                }
            }
            if (!filter || filter(molecule)) {
                molecules.push(molecule);
                // only now we can increase the counter
                for (j = 0; j < currentLabels.length; j++) {
                    var currentLabel = currentLabels[j];
                    labels[currentLabel].counter++;
                }
            }
        }
    }

    // all numeric fields should be converted to numbers
    for (label in labels) {
        currentLabel = labels[label];
        if (currentLabel.isNumeric) {
            currentLabel.minValue = Infinity;
            currentLabel.maxValue = -Infinity;
            for (j = 0; j < molecules.length; j++) {
                if (molecules[j][label]) {
                    var value = parseFloat(molecules[j][label]);
                    molecules[j][label] = value;
                    if (value > currentLabel.maxValue) currentLabel.maxValue = value;
                    if (value < currentLabel.minValue) currentLabel.minValue = value;
                }
            }
        }
    }

    // we check that a label is in all the records
    for (var key in labels) {
        if (labels[key].counter === molecules.length) {
            labels[key].always = true;
        } else {
            labels[key].always = false;
        }
    }

    var statistics = [];
    for (key in labels) {
        var statistic = labels[key];
        statistic.label = key;
        statistics.push(statistic);
    }

    return {
        time: Date.now() - start,
        molecules: molecules,
        labels: Object.keys(labels),
        statistics: statistics
    };

}

module.exports = parse;
