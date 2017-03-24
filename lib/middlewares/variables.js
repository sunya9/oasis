const { name } = require('../..//package')

module.exports = async (ctx, next) => {
  ctx.state.appname = name
  await next()
}