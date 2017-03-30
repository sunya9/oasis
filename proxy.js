const httpProxy = require('http-proxy')
const Koa = require('koa')
const Docker = require('./lib/docker')

const table = {

}

const proxy = httpProxy.createProxyServer()

require('./')

const debug = process.env.NODE_ENV !== 'production'

const app = new Koa()

app.use(async ctx => {
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
    await new Promise((resolve, reject) => {
      proxy.web(req, res, {
        target: 'http://localhost:5121/'
      }, e => e ? reject(e) : resolve())
    })
  }
})

app.listen(80)
