const route = require('koa-route')

const index = require('./routes/index')
const commits = require('./routes/commits')
const branches = require('./routes/branches')
const rebuild = require('./routes/rebuild')

module.exports = app => {
  app.use(route.get('/', index))
  app.use(route.get('/commits', commits))
  app.use(route.get('/branches', branches))
  app.use(route.get('/rebuild', rebuild))
}
