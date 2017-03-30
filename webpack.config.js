const path = require('path')
const { EnvironmentPlugin } = require('webpack')

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
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }, {
        test: /\.(woff2?|otf|eot|svg|ttf)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'fonts/[name].[ext]'
          }
        }]
      }
    ]
  },
  plugins: [
    new EnvironmentPlugin({
      NODE_ENV: 'development'
    })
  ],
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js'
    }
  },
  devtool: 'source-map'
}

module.exports = config