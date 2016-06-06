var parse = require('..');

var fs = require('fs');

var sdf = fs.readFileSync(__dirname + '/test.sdf', 'utf-8');

describe('SDF Parser options', function () {

    var result = parse(sdf, {only:['CLogP','Code']});
    
    it('Check result', function () {
        result.should.be.an.Object;
        result.should.have.properties('labels', 'molecules', 'statistics');
    });

    it('Check statistics', function () {
        result.statistics[0].should.have.properties('counter', 'isNumeric', 'label');
        result.statistics[0].counter.should.be.equal(128);
        result.statistics[0].isNumeric.should.be.equal(false);
        result.statistics[0].label.should.be.equal('Code');
        result.statistics[4].counter.should.be.equal(127);
        result.statistics[4].minValue.should.be.equal(-1.4);
        result.statistics[4].maxValue.should.be.equal(7);
        result.statistics[4].isNumeric.should.be.equal(true);
        result.statistics[4].label.should.be.equal('CLogP');
        result.statistics[0].always.should.be.equal(true);
    });

    it('Check molecules', function () {
        var molecule=result.molecules[0];
        molecule.Code.should.be.a.String;
        molecule.CLogP.should.be.a.Number;
        molecule.CLogP.should.be.equal(2.7);
        molecule.molfile.split("\n").length.should.equal(37);
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
    })

});
