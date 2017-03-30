// require koa and its modules
const session = require('koa-session')
const bodyparser = require('koa-bodyparser')
const ejs = require('koa-ejs')
const json = require('koa-json')

// require other modules
const path = require('path')
const fs = require('fs')

// require user modules
const passport = require('./lib/passport')
const router = require('./lib/router')
const variables = require('./lib/middlewares/variables')

const debug = process.env.NODE_ENV !== 'production'

module.exports = app => {
  app.use(bodyparser({
    detectJSON: ctx => /\.json$/i.test(ctx.path)
  }))
  app.keys = [debug ? 'oasis' : process.env.KEY]
  app.use(session(app))

  ejs(app, {
    root: path.join(__dirname, 'views'),
    layout: 'layout',
    viewExt: 'ejs',
    cache: !debug,
    debug
  })
  app.use(json())
  app.use(variables)
  passport(app)
  router(app)

  if(debug) {
    const webpackMiddleware = require('koa-webpack')
    const DashboardPlugin = require('webpack-dashboard/plugin')
    const webpack = require('webpack')
    const webpackConfig = require('./webpack.config')
    const compiler = webpack(webpackConfig)
    compiler.apply(new DashboardPlugin())
    app.use(webpackMiddleware({
      compiler
    }))
  }

  // create repos dir
  fs.mkdir(path.join(__dirname, 'repos'), () => null)



}