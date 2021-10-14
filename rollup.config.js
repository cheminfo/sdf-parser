export default {
  input: 'src/index.js',
  output: {
    format: 'cjs',
    file: 'lib/index.js',
    exports: 'named',
  },
  external: ['pumpify', 'split2', 'through2', 'through2-filter'],
};
