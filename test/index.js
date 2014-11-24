var parse = require('../');

var fs = require('fs');

var sdf = fs.readFileSync(__dirname + '/test.sdf', 'utf-8');

describe('SDF Parser', function () {

    var result = parse(sdf);

    it('should return an object', function () {
        result.should.be.an.Object;
        result.should.have.properties('labels', 'molecules');
    });

    it.skip('numeric fields', function () {



    });

});
