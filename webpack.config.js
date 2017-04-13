const path = require('path')
const { EnvironmentPlugin } = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const config = {
  context: path.join(__dirname, 'src'),
  entry: {
    main: './js/main',
    index: './js/index',
    preview: './js/preview'
  },
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: '/',
    filename: 'js/[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }, {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader', 'postcss-loader']
        })
      }
    ]
  },
  plugins: [
    new EnvironmentPlugin({
      NODE_ENV: 'development'
    }),
    new ExtractTextPlugin('css/main.css')
  ],
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js'
    }
  }
}

if(process.env.NODE_ENV !== 'production') {
  config.devtool = 'source-map'
}

module.exports = config
