const requireDir = require('require-dir')
const routes = requireDir('./routes')
// const Router = require('koa-router')
const Router = require('koa-trie-router')
const auth = require('./middlewares/auth')

module.exports = app => {
  const router = new Router()
  router
    .get(['/', '/show', '/preview', '/branch', '/commit'], auth)
  Object.keys(routes).forEach(name => routes[name](router))
  app.use(router.middleware())
}
