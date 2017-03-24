// require koa and its modules
const Koa = require('koa')
const session = require('koa-session')
const bodyparser = require('koa-bodyparser')
const hbs = require('koa-hbs')
const json = require('koa-json')

// require other modules
const path = require('path')
require('dotenv').config()

// require user modules
const passport = require('./lib/passport')
const router = require('./lib/router')
const variables = require('./lib/middlewares/variables')

const debug = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 5121

const app = new Koa()

app.use(bodyparser())
app.keys = [debug ? 'oasis' : process.env.KEY]
app.use(session(app))

hbs.registerHelper('json', JSON.stringify)
app.use(hbs.middleware({
  viewPath: path.join(__dirname, 'views'),
  defaultLayout: 'layout',
  disableCache: debug
}))
app.use(json())
app.use(variables)
passport(app)
router(app)

if(debug) {
  const webpackMiddleware = require('koa-webpack')
  app.use(webpackMiddleware())
}

app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`)
})