# sdf-parser

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

Allow to parse a SDF file and convert it to an array of objects.

## Use of the package

```bash
npm install sdf-parser
```

In node script:

```js
// allows to parse a file test.sdf that would be present in the same directory

var { parse } = require('sdf-parser');

var fs = require('fs');
var sdf = fs.readFileSync('./test.sdf', 'utf-8');

var result = parse(sdf);
console.log(result);
```

## require('sdf-parser') (sdf, options)

options:

- exclude : array of string containing the fields to discard
- include : array of string containing the fields to keep
- modifiers : object of functions that need to be converted during the parsing
- filter : function that allows to filter the result
- mixedEOL : if set to true will try to deal with mixed End Of Line separator
- dynamicTyping : convert fields containing only number to numbers (default: true)

## Advanced example with filtering and modifiers

```js
var result = parse(sdf, {
  exclude: ['Number of H-Donors'],
  include: ['Number of H-Donors', 'CLogP', 'Code'],
  modifiers: {
    CLogP: function (field) {
      return {
        low: field * 1 - 0.2,
        high: field * 1 + 0.2,
      };
    },
  },
  filter: (entry) => {
    return entry.CLogP && entry.CLogP.low > 4;
  },
});
```

## Iterator

```js
const { iterator } = require('sdf-parser');
const file = await openAsBlob(join(__dirname, 'test.sdf.gz'));

const decompressionStream = new DecompressionStream('gzip');
const textDecoder = new TextDecoderStream();

const stream = file
  .stream()
  .pipeThrough(decompressionStream)
  .pipeThrough(textDecoder);
const results = [];

for await (const entry of iterator(stream)) {
  results.push(entry);
}
```

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/sdf-parser.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/sdf-parser
[ci-image]: https://github.com/cheminfo/sdf-parser/actions/workflows/nodejs.yml/badge.svg
[ci-url]: https://github.com/cheminfo/sdf-parser/actions/workflows/nodejs.yml
[codecov-image]: https://img.shields.io/codecov/c/github/cheminfo/sdf-parser.svg
[codecov-url]: https://codecov.io/gh/cheminfo/sdf-parser
[download-image]: https://img.shields.io/npm/dm/sdf-parser.svg?style=flat-square
[download-url]: https://www.npmjs.com/package/sdf-parser
