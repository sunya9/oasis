const httpProxy = require('http-proxy')
const Docker = require('./docker')

const proxy = httpProxy.createProxyServer()

const table = {}

const { HOST, PORT } = process.env

module.exports = async (ctx, next) => {
  const { headers: { host }, req, res } = ctx
  const vhost = host.split('.').slice(0, 4)
  if(vhost.length === 4) {
    const [owner, repo, branch, commitId] = vhost  
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
        const { IPAddress } = inspect.NetworkSettings.Networks.bridge
        const { NetworkSettings: { Ports }} = inspect
        // TODO: ensure requiring port
        const port = Object.keys(Ports).map(p => parseInt(p))[0]
        table[vhost] = `http://${IPAddress}:${port}`
      }
      const target = table[vhost]
      req.headers.host = target
      try {
        await new Promise((resolve, reject) => {
          proxy.web(req, res, { target }, e => e ? reject(e) :resolve())
        })
      } catch(e) {
        ctx.body = await docker.container.logs()
      }
    } else {
      // redirect to preview url
      const redirectHost = HOST || 'localhost'
      ctx.redirect(`${ctx.protocol}://${redirectHost}:${PORT}`)
    }
  } else {
    await next()
  }
}