'use strict';

var parse = require('..');

var fs = require('fs');
require('should');

var sdf = fs.readFileSync(__dirname + '/test.sdf', 'utf-8');

describe('SDF Parser', function () {

    var result = parse(sdf);

    it('Check result', function () {
        result.should.be.an.Object();
        result.should.have.properties('labels', 'molecules', 'statistics');
    });

    it('Check statistics', function () {
        result.statistics[0].should.have.properties('counter', 'isNumeric', 'label');
        result.statistics[0].counter.should.be.equal(128);
        result.statistics[0].isNumeric.should.be.equal(false);
        result.statistics[0].label.should.be.equal('Code');
        result.statistics[1].counter.should.be.equal(128);
        result.statistics[1].minValue.should.be.equal(0);
        result.statistics[1].maxValue.should.be.equal(5);
        result.statistics[1].isNumeric.should.be.equal(true);
        result.statistics[1].label.should.be.equal('Number of H-Donors');
        result.statistics[0].always.should.be.equal(true);
        result.statistics[4].always.should.be.equal(false);
    });

    it('Check molecules', function () {
        var molecule = result.molecules[0];
        molecule.Code.should.be.a.String();
        molecule.CLogP.should.be.a.Number();
        molecule.CLogP.should.be.equal(2.7);
        molecule.molfile.split('\n').length.should.equal(37);
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

describe('SDF Parser no dynamicTyping', function () {

    var result = parse(sdf, {
        dynamicTyping: false
    });

    it('Check result', function () {
        result.should.be.an.Object();
        result.should.have.properties('labels', 'molecules', 'statistics');
    });

    it('Check statistics', function () {
        result.statistics[0].should.have.properties('counter', 'isNumeric', 'label');
        result.statistics[0].counter.should.be.equal(128);
        result.statistics[0].isNumeric.should.be.equal(false);
        result.statistics[0].label.should.be.equal('Code');
        result.statistics[1].counter.should.be.equal(128);
        expect(result.statistics[1].minValue).toBeUndefined();
        expect(result.statistics[1].maxValue).toBeUndefined();
        result.statistics[1].isNumeric.should.be.equal(false);
        result.statistics[1].label.should.be.equal('Number of H-Donors');
        result.statistics[0].always.should.be.equal(true);
        result.statistics[4].always.should.be.equal(false);
    });

    it('Check molecules', function () {
        var molecule = result.molecules[0];
        molecule.Code.should.be.a.String();
        molecule.CLogP.should.be.a.String();
        molecule.CLogP.should.be.equal('2.700000000000000e+000');
        molecule.molfile.split('\n').length.should.equal(37);
    });


});
