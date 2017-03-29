const requireDir = require('require-dir')
const routes = requireDir('./routes')
const Router = require('koa-router')

const auth = require('./middlewares/auth')

module.exports = app => {
  const router = new Router()
  router.use(['/show', '/preview'], auth)
  Object.keys(routes).forEach(name => routes[name](router))
  app
    .use(router.routes())
    .use(router.allowedMethods())
}
