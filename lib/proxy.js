const httpProxy = require('http-proxy')
const Docker = require('./docker')

const proxy = httpProxy.createProxyServer()

const table = {}

module.exports = async (ctx, next) => {
  const { headers: { host }, req, res, app: { env } } = ctx
  const debug = env !== 'production'
  const xipio = /\.xip\.io$/.test(host)
  const vhost = host.replace(/\.?127\.0\.0\.1\.xip\.io$/, '')
  if(xipio && debug && vhost) {
    const [owner, repo, branch, commitId] = vhost.split('.')
    const docker = new Docker({
      owner, repo, branch, commitId
    })
    const status = await docker.getContainerStatus()
    if(status) {
      if(status === 'exited') {
        await docker.container.start()
      }
      if(!table[vhost]) {
        const inspect = await docker.container.inspect()
        const { NetworkSettings: { Ports }} = inspect
        // TODO: ensure requiring port
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
    } else {
      // redirect to preview url
      // ctx.redirect('')
    }
  } else {
    await next()
  }
}