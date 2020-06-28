module.exports = {
  context: __dirname,
  entry: './src/SolvusServer.ts',
  target: 'node',
  // node: {
  //   __dirname: false,
  //   __filename: false,
  // },
  mode: 'development',
  output: {
    filename: './SolvusServer.js',
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, loader: 'source-map-loader' },
      { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
      {
        test: /\.node$/,
        use: 'node-loader',
      },
    ],
  },

  // Other options...
};