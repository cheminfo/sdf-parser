# sdf-parser

  [![NPM version][npm-image]][npm-url]
  [![build status][travis-image]][travis-url]
  [![David deps][david-image]][david-url]
  [![npm download][download-image]][download-url]

Allow to parse a SDF file and convert it to an array of objects

## Use of the package

```bash
npm install sdf-parser
```

In node script:
```js

// allows to parse a file test.sdf that would be present in the same directory

var parse = require('sdf-parser');

var fs = require('fs');
var sdf = fs.readFileSync('./test.sdf', 'utf-8');

var result = parse(sdf);
console.log(result);

```

## require('sdf-parser') (sdf, options)

options:
* exclude : array of string containing the fields to discard
* include : array of string containing the fields to keep
* modifiers : object of functions that need to be converted during the parsing
* filter : function that allows to filter the result

## Advanced example with filtering and modifiers

```
var result = parse(sdf, {
    exclude:["Number of H-Donors"],
    include:["Number of H-Donors",'CLogP','Code'],
    modifiers: {
        CLogP: function(field) {
            return {
                low: field*1-0.2,
                high: field*1+0.2
            }
        }
    },
    filter: function(entry) {
        return (entry.CLogP && entry.CLogP.low>4);
    }
});
```


## Test

```bash
npm test
```

## Build

```bash
npm run build
```

## License

  [MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/sdf-parser.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/sdf-parser
[travis-image]: https://img.shields.io/travis/cheminfo-js/sdf-parser/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/cheminfo-js/sdf-parser
[david-image]: https://img.shields.io/david/cheminfo-js/sdf-parser.svg?style=flat-square
[david-url]: https://david-dm.org/cheminfo-js/sdf-parser
[download-image]: https://img.shields.io/npm/dm/sdf-parser.svg?style=flat-square
[download-url]: https://www.npmjs.com/package/sdf-parser
