const httpProxy = require('http-proxy')

const Docker = require('./docker')
const preview = require('./routes/preview')

const proxy = httpProxy.createProxyServer()

const table = {
  // cache table
  // key: commit id
  // value: target host
}

module.exports = async (ctx, next) => {
  const { method, req, res, subdomains: [id] } = ctx
  if(id) {
    const docker = new Docker(id)
    const status = await docker.getContainerStatus()
    if(status) {
      // there is already created container
      if(status === 'exited') {
        await docker.container.start()
      }
      if(!table[id]) {
        // no cache
        const inspect = await docker.container.inspect()
        let host = docker.getHost(inspect)
        table[id] = host
      }
      const target = table[id]
      req.headers.host = target
      await new Promise((resolve, reject) => {
        proxy.web(req, res, { target }, e => e ? reject(e) :resolve())
      })
    } else {
      await preview[method](ctx)
    }
  } else {
    await next()
  }
}
