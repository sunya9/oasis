const httpProxy = require('http-proxy')
const preview = require('../routes/preview')
const containerManager = require('../containerManager')
const proxy = httpProxy.createProxyServer()

module.exports = async (ctx, next) => {
  const { method, req, res, subdomains: [id] } = ctx
  if(id) {
    const info = containerManager.get(id)
    if(info && info.host) {
      // there is already created container
      const { host: target } = info
      req.headers.host = target
      try {
        await new Promise((resolve, reject) => {
          proxy.web(req, res, { target }, e => e ? reject(e) : resolve())
        })
      } catch(e) {
        await ctx.render('error', {
          messages: [
            e.message,
            'Your project\'s server might not have listened a port.'
          ]
        })
      }
    } else {
      // show preview page
      await preview[method](ctx)
    }
  } else {
    await next()
  }
}
