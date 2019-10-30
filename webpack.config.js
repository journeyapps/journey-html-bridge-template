const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const yaml = require('yaml');
const fs = require('fs');

const args = process.argv.slice(2);

const isDev = args.some(a => a === '--dev');

const config = yaml.parse(fs.readFileSync('config.yml', 'utf8'));

const {outputFileName, htmlTitle} = config;

module.exports = {
  entry: './src/main.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin({
      title: htmlTitle,
      template: './src/template.html.ejs',
      templateParameters: {
        // inject parameters into template
        title: htmlTitle,
        exampleParameter: 'EXAMPLE_PARAMETER'
      },
      filename: outputFileName,
      inlineSource: '.(js|css|ts)$'
    }),
    new HtmlWebpackInlineSourcePlugin()
  ],
  optimization: {
    minimize: !isDev // only minimise when not running in dev-mode
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' },
      {
        test: /\.scss$/,
        use: [
            "style-loader", // creates style nodes from JS strings
            "css-loader", // translates CSS into CommonJS
            "sass-loader" // compiles Sass to CSS, using Node Sass by default
        ]
      }
    ]
  }
};
