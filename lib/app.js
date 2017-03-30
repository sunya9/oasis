// require koa and its modules
const Koa = require('koa')
const bodyparser = require('koa-bodyparser')
const ejs = require('koa-ejs')
const json = require('koa-json')
const assets = require('koa-static')

// require other modules
const path = require('path')

// require user modules
const router = require('./router')
const proxy = require('./proxy')


const app = new Koa()

const debug = app.env !== 'production'

// midleware settings
app.use(proxy)
app.use(bodyparser())
ejs(app, {
  root: path.join(__dirname, '../views'),
  layout: 'layout',
  viewExt: 'ejs',
  cache: !debug,
  debug
})
app.use(json())
router(app)


// for webpack
if(debug) {
  const webpackMiddleware = require('koa-webpack')
  const DashboardPlugin = require('webpack-dashboard/plugin')
  const webpack = require('webpack')
  const webpackConfig = require('../webpack.config')
  const compiler = webpack(webpackConfig)
  compiler.apply(new DashboardPlugin())
  app.use(webpackMiddleware({
    compiler
  }))
} else {
  app.use(assets(path.join(__dirname, '../build')))
}

module.exports = app