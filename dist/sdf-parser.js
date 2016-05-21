(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["SDFParser"] = factory();
	else
		root["SDFParser"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';

	function parse(sdf) {
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

	    var i = 0, ii = sdfParts.length,
	        sdfPart, parts, molecule, j, jj,
	        lines, from, to, label, k, kk;
	    for (; i < ii; i++) {
	        sdfPart = sdfParts[i];
	        parts = sdfPart.split(crlf + '>');
	        if (parts.length > 0 && parts[0].length > 5) {
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


/***/ }
/******/ ])
});
;