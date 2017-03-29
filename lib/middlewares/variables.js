const { name } = require('../../package')

module.exports = async (ctx, next) => {
  const defaults = {
    user: null,
    appname: name,
    title: name,
    url: ctx.url,
    index: false,
  }
  ctx.state = Object.assign({}, ctx.state, defaults)
  await next()
}