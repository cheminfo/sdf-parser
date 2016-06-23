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

	function parse(sdf, options) {
	    var options=options || {};
	    var include=options.include;
	    var exclude=options.exclude;
	    var filter=options.filter;
	    var modifiers=options.modifiers || {};
	    var forEach=options.forEach || {};
	    if (typeof sdf !== 'string') {
	        throw new TypeError('Parameter "sdf" must be a string');
	    }
	    // we will find the delimiter in order to be much faster and not use regular expression
	    var header = sdf.substr(0, 1000);
	    var eol = '\n';
	    if (header.indexOf('\r\n') > -1) {
	        eol = '\r\n';
	    } else if (header.indexOf('\r') > -1) {
	        eol = '\r';
	    }

	    var sdfParts = sdf.split(new RegExp(eol+'\\$\\$\\$\\$.*'+eol));
	    var molecules = [];
	    var labels = {};

	    var start = Date.now();
	    
	    for (var i=0; i < sdfParts.length; i++) {
	        var sdfPart = sdfParts[i];
	        var parts = sdfPart.split(eol + '>');
	        if (parts.length > 0 && parts[0].length > 5) {
	            var molecule = {};
	            var currentLabels=[];
	            molecule.molfile = parts[0] + eol;
	            for (var j = 1; j < parts.length; j++) {
	                var lines = parts[j].split(eol);
	                var from = lines[0].indexOf('<');
	                var to = lines[0].indexOf('>');
	                var label = lines[0].substring(from + 1, to);
	                currentLabels.push(label);
	                if (! labels[label]) {
	                    labels[label] = {
	                        counter: 0,
	                        isNumeric: true,
	                        keep:false
	                    };
	                    if (exclude && exclude.indexOf(label)>-1) {
	                    } else if (! include || include.indexOf(label)>-1) {
	                        labels[label].keep=true;
	                        if (modifiers[label]) labels[label].modifier=modifiers[label];
	                        if (forEach[label]) labels[label].forEach=forEach[label];
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
	                        var modifiedValue=labels[label].modifier(molecule[label]);
	                        if (modifiedValue===undefined || modifiedValue===null) {
	                            delete molecule[label];
	                        } else {
	                            molecule[label]=modifiedValue;
	                        }
	                    }
	                    if (labels[label].isNumeric) {
	                        if (!isFinite(molecule[label])) {
	                            labels[label].isNumeric = false;
	                        }
	                    }
	                }
	            }
	            if (! filter || filter(molecule)) {
	                molecules.push(molecule);
	                // only now we can increase the counter
	                for (var j=0; j<currentLabels.length; j++) {
	                    var currentLabel=currentLabels[j];
	                    labels[currentLabel].counter++;
	                }
	            }
	        }
	    }

	    // all numeric fields should be converted to numbers
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