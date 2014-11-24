'use strict';


// options: an object

function parse(sdf, options) {
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

    var i = 0, ii = sdfParts.length,
        sdfPart, parts, molecule, j, jj,
        lines, from, to, label, k, kk;
    for (; i < ii; i++) {
        sdfPart = sdfParts[i];
        parts = sdfPart.split(crlf + '>');
        if (parts.length > 0 && parts[0].length > 10) {
            molecule = {};
            molecules.push(molecule);
            molecule.molfile = {type: 'mol2d', value: parts[0] + crlf};
            jj = parts.length;
            for (j = 1; j < jj; j++) {
                lines = parts[j].split(crlf);
                from = lines[0].indexOf('<');
                to = lines[0].indexOf('>');
                label = lines[0].substring(from + 1, to);
                if (labels[label]) {
                    labels[label].counter++;
                } else {
                    labels[label] = {counter: 1, isNumeric: true};
                }
                kk = lines.length - 1;
                for (k = 1; k < kk; k++) {
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

    var statistics = [];

    for (var key in labels) {
        var statistic=labels[key];
        statistic.label=key;
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

