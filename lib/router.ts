import * as Koa from 'koa'
import * as route from 'koa-route'

import index from './routes'
import commits from './routes/commits'
import branches from './routes/branches'
import rebuild from './routes/rebuild'

export default (app: Koa): void => {
  app.use(route.get('/', index))
  app.use(route.get('/commits', commits))
  app.use(route.get('/branches', branches))
  app.use(route.get('/rebuild', rebuild))
}
