module.exports = async (ctx, next) => {
  if(!ctx.isAuthenticated() && ctx.url !== '/') {
    ctx.status = 401
    ctx.body = {
      code: 401,
      message: 'You have to login'
    }
    return
  }
  if(ctx.state.user) { //XXX
    ctx.state.api = require('../github')(ctx.state.user.token)
  }
  await next()
}