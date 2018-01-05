var parse = require('..');

var fs = require('fs');
require('should');

var sdf = fs.readFileSync(__dirname + '/test.sdf', 'utf-8');

describe('SDF Parser options and undefined', function () {

    var result = parse(sdf, {
        exclude:["Number of H-Donors"],
        include:["Number of H-Donors",'CLogP','Code'],
        modifiers: {
            CLogP: function(field) {
                return undefined
            }
        },
        filter: function(entry) {
            return (entry.CLogP && entry.CLogP.low>4);
        }
    });
    


    it('Check result', function () {
        result.should.be.an.Object;
        result.should.have.properties('labels', 'molecules', 'statistics');
    });


    it('Check molecules', function () {
        result.molecules.length.should.be.equal(0);
    });

});
