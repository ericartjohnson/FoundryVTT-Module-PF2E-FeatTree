const path = require('path');

module.exports = {
  watch: true,
  devtool: "source-map",
  entry: './src/module.js',
  output: {
    filename: 'module.mjs',
    path: path.resolve(__dirname, 'scripts'),
  },
  mode: 'development'
};