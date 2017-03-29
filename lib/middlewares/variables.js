const { name } = require('../../package')

module.exports = async (ctx, next) => {
  const defaults = {
    user: null,
    appname: name,
    title: name,
    url: ctx.url,
  }
  ctx.state = Object.assign({}, defaults, ctx.state)
  await next()
}