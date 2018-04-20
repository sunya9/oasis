// require koa and its modules
import * as Koa from 'koa'
import * as bodyparser from 'koa-bodyparser'
import * as ejs from 'koa-ejs'
import * as json from 'koa-json'
import * as assets from 'koa-static'
import * as webpackMiddleware from 'koa-webpack'

// require other modules
import * as path from 'path'
import { path as rootPath } from 'app-root-path'
import * as webpack from 'webpack'

// require user modules
import router from './router'
import proxy from './middlewares/proxy'
import vars from './middlewares/vars'
import env from './env'

const app: Koa = new Koa()

const debug = app.env !== 'production'

app.subdomainOffset = env.HOST.split('.').length

// midleware settings
app.use(bodyparser())
app.use(vars)
app.use(proxy)

ejs(app, {
  root: path.join(rootPath, 'views'),
  layout: 'layout',
  viewExt: 'ejs',
  cache: !debug,
  debug
})

app.use(json())
router(app)
app.use(assets(path.join(rootPath, 'assets')))

// for webpack
if (debug) {
  const webpackConfigPath: string = path.join(rootPath, 'webpack.config.js')
  const webpackConfig: any = require(webpackConfigPath)
  const compiler: webpack.Compiler = webpack(webpackConfig)
  app.use(
    webpackMiddleware({
      compiler
    })
  )
} else {
  app.use(assets(path.join(rootPath, 'build', 'client')))
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('unhandledRejection: %s', reason, promise) // eslint-disable-line
})

export default app
