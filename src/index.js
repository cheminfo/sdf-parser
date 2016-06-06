'use strict';

function parse(sdf, options) {
    var options=options || {};
    var include=options.include;
    var exclude=options.exclude;
    if (typeof sdf !== 'string') {
        throw new TypeError('Parameter "sdf" must be a string');
    }
    // we will find the delimiter in order to be much faster and not use regular expression
    var header = sdf.substr(0, 1000);
    var crlf = '\n';
    if (header.indexOf('\r\n') > -1) {
        crlf = '\r\n';
    } else if (header.indexOf('\r') > -1) {
        crlf = '\r';
    }

    var sdfParts = sdf.split(crlf + '$$$$' + crlf);
    var molecules = [];
    var labels = {};

    var start = Date.now();
    
    for (var i=0; i < sdfParts.length; i++) {
        var sdfPart = sdfParts[i];
        var parts = sdfPart.split(crlf + '>');
        if (parts.length > 0 && parts[0].length > 5) {
            var molecule = {};
            molecules.push(molecule);
            molecule.molfile = parts[0] + crlf;
            for (var j = 1; j < parts.length; j++) {
                var lines = parts[j].split(crlf);
                var from = lines[0].indexOf('<');
                var to = lines[0].indexOf('>');
                var label = lines[0].substring(from + 1, to);
                if (labels[label]) {
                    labels[label].counter++;
                } else {
                    labels[label] = {counter: 1, isNumeric: true};
                    if (exclude && exclude.indexOf(label)>-1) {
                        labels[label].keep=false;
                    } else if (! include || include.indexOf(label)>-1) {
                        labels[label].keep=true;
                    } else {
                        labels[label].keep=false;
                    }
                }
                if (labels[label].keep) {
                    for (var k = 1; k < lines.length - 1; k++) {
                        if (molecule[label]) {
                            molecule[label] += crlf + lines[k];
                        } else {
                            molecule[label] = lines[k];
                        }
                    }
                    if (labels[label].isNumeric) {
                        if (!isFinite(molecule[label])) {
                            labels[label].isNumeric = false;
                        }
                    }
                }
            }
        }
    }

    // all numeric fields should be converted to numbers
    var numericFields = [];
    for (var label in labels) {
        var currentLabel = labels[label];
        if (currentLabel.isNumeric) {
            currentLabel.minValue = Infinity;
            currentLabel.maxValue = -Infinity;
            for (var j = 0; j < molecules.length; j++) {
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
    for (var key in labels) {
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
