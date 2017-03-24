const path = require('path')
const { EnvironmentPlugin } = require('webpack')

const config = {
  entry: path.join(__dirname, 'src', 'js', 'main'),
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: '/',
    chunkFilename: '[id].js',
    filename: 'js/main.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }, {
        test: /\.css$/,
        use: ['style-loader', {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            // modules: true
          }
        }, 'postcss-loader']
      }, {
        test: /\.(woff2?|otf|eot|svg|ttf)$/,
        use: ['file-loader']
      }
    ]
  },
  plugins: [
    new EnvironmentPlugin({
      NODE_ENV: process.env.NODE_ENV
    })
  ],
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js'
    }
  }
}
module.exports = config