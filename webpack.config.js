const HtmlWebpackPlugin = require('html-webpack-plugin');
let webpack = require('webpack');
let path = require('path');
let fs = require('fs');
const nodeExternals = require('webpack-node-externals');
const dotenv = require('dotenv-webpack');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: './src/index.js',
  target: 'node',
  mode: "production",
  output: {

    filename: '[name].js',
    path: path.resolve(__dirname, 'back'),

  },

  externalsPresets: { node: true },
  externals: [nodeExternals()],
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
    minimize: true,
    minimizer: [new TerserPlugin()],
    moduleIds: false,
    chunkIds: false,
  },
  plugins: [
    new dotenv({
      path: './.env.pack'
    }),
    new webpack.ids.DeterministicModuleIdsPlugin({
      maxLength: 5,
    }),
    new webpack.ids.DeterministicChunkIdsPlugin({
      maxLength: 5,
    }),
    new webpack.ids.HashedModuleIdsPlugin({
      context: __dirname,
      hashFunction: 'sha256',
      hashDigest: 'hex',
      hashDigestLength: 20,
    }),
    new HtmlWebpackPlugin({ template: './src/index.html' })
  ]
}