const path = require('path');

module.exports = {
  watch: false,
  devtool: "source-map",
  entry: './src/feattree.js',
  output: {
    filename: 'feattree.mjs',
    path: path.resolve(__dirname, 'scripts'),
    publicPath: '/modules/pf2e-feattree-local/scripts/',
    clean: true
  },
  mode: 'production'
};