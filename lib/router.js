const route = require('koa-route')

const index = require('./routes/index')
const preview = require('./routes/preview')
const commits = require('./routes/commits')
const branches = require('./routes/branches')

module.exports = app => {
  app.use(route.get('/', index))
  app.use(route.get('/preview', preview.get))
  app.use(route.post('/preview', preview.post))
  app.use(route.get('/commits', commits))
  app.use(route.get('/branches', branches))
}
