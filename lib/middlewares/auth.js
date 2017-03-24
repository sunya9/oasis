module.exports = async (ctx, next) => {
  if(!ctx.isAuthenticated()) {
    ctx.status = 401
    ctx.body = {
      code: 401,
      message: 'You have to login'
    }
  } else {
    ctx.state.api = require('../github')(ctx.state.user.token)
    await next()
  }
}