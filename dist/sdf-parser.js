/**
 * sdf-parser - SDF parser
 * @version v3.1.0
 * @link https://github.com/cheminfo-js/sdf-parser
 * @license MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["SDFParser"] = factory();
	else
		root["SDFParser"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var parse = __webpack_require__(1);
var stream = __webpack_require__(2);

module.exports = parse;
parse.stream = stream;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function parse(sdf, options = {}) {
    var include = options.include,
        exclude = options.exclude,
        filter = options.filter,
        _options$modifiers = options.modifiers,
        modifiers = _options$modifiers === undefined ? {} : _options$modifiers,
        _options$forEach = options.forEach,
        forEach = _options$forEach === undefined ? {} : _options$forEach,
        _options$dynamicTypin = options.dynamicTyping,
        dynamicTyping = _options$dynamicTypin === undefined ? true : _options$dynamicTypin;


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
                    if ((!exclude || exclude.indexOf(label) === -1) && (!include || include.indexOf(label) > -1)) {
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

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {};

/***/ })
/******/ ]);
});
//# sourceMappingURL=sdf-parser.js.map