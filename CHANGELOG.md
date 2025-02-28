# Changelog

## [7.0.3](https://github.com/cheminfo/sdf-parser/compare/v7.0.2...v7.0.3) (2025-02-28)


### Bug Fixes

* iterator was adding a CR that yields to non parsable molfiles ([5dc3afc](https://github.com/cheminfo/sdf-parser/commit/5dc3afcde4f17034b46aa020b48492200dac0eaa))

## [7.0.2](https://github.com/cheminfo/sdf-parser/compare/v7.0.1...v7.0.2) (2025-02-27)


### Bug Fixes

* extension of rollup.config ([6512f04](https://github.com/cheminfo/sdf-parser/commit/6512f0491b0582cd09be3917523c45d44615d021))

## [7.0.1](https://github.com/cheminfo/sdf-parser/compare/v7.0.0...v7.0.1) (2025-02-27)


### Bug Fixes

* wrong file extension and CDN publication ([bcb7572](https://github.com/cheminfo/sdf-parser/commit/bcb7572bdd2ad028566ca07ba1c699ebfc19cdf5))

## [7.0.0](https://github.com/cheminfo/sdf-parser/compare/v6.0.1...v7.0.0) (2025-02-27)


### ⚠ BREAKING CHANGES

* The stream should be piped through a TextDecoderStream like for example: const textDecoder = new TextDecoderStream(); for await (const entry of   iterator(file.stream().pipeThrough(textDecoder)))

### Features

* update iterator implementation for browser compatibility ([6a53960](https://github.com/cheminfo/sdf-parser/commit/6a539603d0a3e15e3f902412fea2aabf49d7ffce))
* use and expose MolfileStream class ([#16](https://github.com/cheminfo/sdf-parser/issues/16)) ([926b8cf](https://github.com/cheminfo/sdf-parser/commit/926b8cff47fce60576724662c79ae996cc1529d9))


### Bug Fixes

* remove side effect on options ([2afdfc8](https://github.com/cheminfo/sdf-parser/commit/2afdfc8e4818d2b587ce2e53c67add726953684a))

## [6.0.1](https://github.com/cheminfo/sdf-parser/compare/v6.0.0...v6.0.1) (2022-10-15)


### Bug Fixes

* update dependencies and remove iterator from browser ([f3275be](https://github.com/cheminfo/sdf-parser/commit/f3275bea7f78a744ca8b0b1918c1ef59720342a8))

## [6.0.0](https://github.com/cheminfo/sdf-parser/compare/v5.0.2...v6.0.0) (2022-08-22)


### ⚠ BREAKING CHANGES

* remove stream function

### Features

* add iterator to parse huge sdf files ([5c6fc9a](https://github.com/cheminfo/sdf-parser/commit/5c6fc9ae497fde15c7b97aa8c74e9aed5ea768da))
* remove stream function ([6320c19](https://github.com/cheminfo/sdf-parser/commit/6320c1959092120b19373c36d19c293e53e338bc))

## [5.0.2](https://github.com/cheminfo/sdf-parser/compare/v5.0.1...v5.0.2) (2022-08-17)


### Bug Fixes

* infinite loop with files without EOL in the EOF ([#7](https://github.com/cheminfo/sdf-parser/issues/7)) ([9266761](https://github.com/cheminfo/sdf-parser/commit/9266761dc6f2536ec5deec0bec0d10e277cb2bb0))

### [5.0.1](https://www.github.com/cheminfo/sdf-parser/compare/v5.0.0...v5.0.1) (2022-03-11)


### Bug Fixes

* add sideEffects: false ([512959b](https://www.github.com/cheminfo/sdf-parser/commit/512959b4a567f690070bfd42259ab9812ec8d8b8))

## [5.0.0](https://github.com/cheminfo/sdf-parser/compare/v4.0.2...v5.0.0) (2021-10-14)


### Features

* migration to es6-module ([03a6569](https://github.com/cheminfo/sdf-parser/commit/03a6569c95225891eaf0acf91ad6649de8382e17))

## [4.0.2](https://github.com/cheminfo/sdf-parser/compare/v4.0.1...v4.0.2) (2020-06-27)

## [4.0.1](https://github.com/cheminfo/sdf-parser/compare/v4.0.0...v4.0.1) (2019-06-12)

### Bug Fixes

- back to pumpify ([387c3eb](https://github.com/cheminfo/sdf-parser/commit/387c3eb))

# [4.0.0](https://github.com/cheminfo/sdf-parser/compare/v3.1.0...v4.0.0) (2019-06-12)

### Bug Fixes

- use pumpify instead of multipipe ([aed47fd](https://github.com/cheminfo/sdf-parser/commit/aed47fd))

### chore

- remove bower.json ([2cc05c5](https://github.com/cheminfo/sdf-parser/commit/2cc05c5))
- remove dist directory ([eba83f7](https://github.com/cheminfo/sdf-parser/commit/eba83f7))

### Features

- add support for stream async iteration ([f41105e](https://github.com/cheminfo/sdf-parser/commit/f41105e))

### BREAKING CHANGES

- The "dist" directory is no longer built and published.
- Bower is no longer supported.

# [3.1.0](https://github.com/cheminfo/sdf-parser/compare/v3.0.1...v3.1.0) (2018-01-26)

## [3.0.1](https://github.com/cheminfo/sdf-parser/compare/v3.0.0...v3.0.1) (2018-01-06)

# [3.0.0](https://github.com/cheminfo/sdf-parser/compare/v2.3.1...v3.0.0) (2018-01-05)

### Features

- add stream functions ([ac7ed88](https://github.com/cheminfo/sdf-parser/commit/ac7ed88))

## [2.3.1](https://github.com/cheminfo/sdf-parser/compare/v2.3.0...v2.3.1) (2017-07-04)

# [2.3.0](https://github.com/cheminfo/sdf-parser/compare/v2.2.2...v2.3.0) (2017-07-04)

## [2.2.2](https://github.com/cheminfo/sdf-parser/compare/v2.2.1...v2.2.2) (2016-06-23)

## [2.2.1](https://github.com/cheminfo/sdf-parser/compare/v2.2.0...v2.2.1) (2016-06-07)

# [2.2.0](https://github.com/cheminfo/sdf-parser/compare/v2.1.1...v2.2.0) (2016-06-07)

## [2.1.1](https://github.com/cheminfo/sdf-parser/compare/v2.1.0...v2.1.1) (2016-06-06)

# [2.1.0](https://github.com/cheminfo/sdf-parser/compare/v2.0.1...v2.1.0) (2016-06-06)

## [2.0.1](https://github.com/cheminfo/sdf-parser/compare/v2.0.0...v2.0.1) (2016-05-21)

# [2.0.0](https://github.com/cheminfo/sdf-parser/compare/v1.0.1...v2.0.0) (2016-05-21)

## [1.0.1](https://github.com/cheminfo/sdf-parser/compare/v1.0.0...v1.0.1) (2015-06-10)

# 1.0.0 (2015-02-13)
