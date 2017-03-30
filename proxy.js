const httpProxy = require('http-proxy')
const Koa = require('koa')
const Docker = require('./lib/docker')
require('dotenv').config()

const table = {

}

const debug = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 5121

const app = new Koa()
const server = require('./')
const proxy = httpProxy.createProxyServer()

app.use(async (ctx, next) => {
  const { headers: { host }, req, res } = ctx
  const xipio = /\.xip\.io$/.test(host)
  const vhost = host.replace(/\.?127\.0\.0\.1\.xip\.io$/, '')
  if(xipio && debug && vhost) {
    const [owner, repo, branch, commitId] = vhost.split('.')
    const docker = new Docker({
      owner, repo, branch, commitId
    })
    const exist = await docker.existContainer()
    if(!exist) {
      // redirect to preview url
      // ctx.redirect('')
    } else {
      if(!table[vhost]) {
        const inspect = await docker.container.inspect()
        const { NetworkSettings: { Ports }} = inspect
        const port = Object.keys(Ports).map(port => {
          // const [number] = port.split('/')
          return Ports[port][0].HostPort
        })[0]
        table[vhost] = port
      }
      const port = table[vhost]
      const target = `http://localhost:${port}`
      req.headers.host = target
      await new Promise((resolve, reject) => {
        proxy.web(req, res, {
          target
        }, e => {
          if(e) reject(e)
          resolve()
        })
      })
    }
  } else {
    await next()
  }
})

server(app)

app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`) // eslint-disable-line
})