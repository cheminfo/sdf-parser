var parse = require('..');

var fs = require('fs');


describe('SDF Parser of non well formatted file', function () {
    var sdf = fs.readFileSync(__dirname + '/test2.sdf', 'utf-8');
    sdf = sdf.replace(/\r/g,'');
    var result = parse(sdf, {mixedEOL:true});


    it('Check result', function () {
        result.should.be.an.Object;
        result.should.have.properties('labels', 'molecules', 'statistics');
    });

    it('Check statistics', function () {
        result.statistics[0].should.have.properties('counter', 'isNumeric', 'label');
    });

    it('Check molecules', function () {
        var molecules=result.molecules;
        molecules.length.should.equal(7);
    });

});
