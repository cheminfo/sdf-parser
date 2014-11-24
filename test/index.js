var parse = require('../');

var fs = require('fs');

var sdf = fs.readFileSync(__dirname + '/test.sdf', 'utf-8');

describe('SDF Parser', function () {

    var result = parse(sdf);

    console.log(result.statistics);

    it('Check result', function () {
        result.should.be.an.Object;
        result.should.have.properties('labels', 'molecules', 'statistics');
    });

    it('Check statistics', function () {
        result.statistics[0].should.have.properties('counter', 'isNumeric', 'label');
        result.statistics[0].counter.should.be.equal(128);
        result.statistics[0].isNumeric.should.be.equal(false);
        result.statistics[0].label.should.be.equal('Code');
        result.statistics[1].counter.should.be.equal(128);
        result.statistics[1].isNumeric.should.be.equal(true);
        result.statistics[1].label.should.be.equal('Number of H-Donors');
    });



});
