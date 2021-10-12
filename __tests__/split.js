'use strict';

let fs = require('fs');

let split = require('../src/split');

let sdf0 = fs.readFileSync(`${__dirname}/test.sdf`, 'utf-8');
let sdf1 = fs.readFileSync(`${__dirname}/test.sdf`, 'utf-8');
let sdf2 = fs.readFileSync(`${__dirname}/test.sdf`, 'utf-8');

[sdf0, sdf1, sdf2].forEach(sdf => {
    let eol = '\n';
    let header = sdf.substr(0, 1000);
    if (header.indexOf('\r\n') > -1) {
        eol = '\r\n';
    } else if (header.indexOf('\r') > -1) {
        eol = '\r';
    }

    test('Split should match regex behavior', function () {
        let sdfParts = sdf.split(new RegExp(`${eol}\\$\\$\\$\\$.*${eol}`));
        expect(sdfParts).toEqual(split(sdf, `${eol}$$$$`, eol).map(v => sdf.substring(...v)));
    });
})
