'use strict';

var parse = require('..');

var fs = require('fs');
require('should');

var sdf = fs.readFileSync(`${__dirname}/test.sdf`, 'utf-8');

describe('SDF Parser options', function () {

  var result = parse(sdf, {
    exclude: ['Number of H-Donors'],
    include: ['Number of H-Donors', 'CLogP', 'Code'],
    modifiers: {
      CLogP: function (field) {
        return {
          low: field * 1 - 0.2,
          high: field * 1 + 0.2
        };
      }
    },
    filter: function (entry) {
      return (entry.CLogP && entry.CLogP.low > 4);
    }
  });


  it('Check result', function () {
    result.should.be.an.Object();
    result.should.have.properties('labels', 'molecules', 'statistics');
  });
  it('Check statistics', function () {
    result.statistics[0].should.have.properties('counter', 'isNumeric', 'label');
    result.statistics[0].counter.should.be.equal(43);
    result.statistics[0].isNumeric.should.be.equal(false);
    result.statistics[0].label.should.be.equal('Code');
    result.statistics[0].always.should.be.equal(true);
    result.statistics[4].counter.should.be.equal(43);
    result.statistics[4].isNumeric.should.be.equal(false);
    result.statistics[4].label.should.be.equal('CLogP');
    result.statistics[4].always.should.be.equal(true);
  });

  it('Check molecules', function () {
    result.molecules.length.should.be.equal(43);
    var molecule = result.molecules[0];

    Object.keys(molecule).length.should.equal(3);
    molecule.Code.should.be.a.String();
    molecule.CLogP.should.be.a.Object();
    molecule.CLogP.low.should.be.approximately(4.8, 0.0001);
    molecule.CLogP.high.should.be.approximately(5.2, 0.0001);
    molecule.molfile.split('\n').length.should.equal(56);
  });

  it('should throw with non-string argument', function () {
    (function () {
      parse();
    }).should.throw(TypeError);
    (function () {
      parse(42);
    }).should.throw(TypeError);
    (function () {
      parse({});
    }).should.throw(TypeError);
  });

});
