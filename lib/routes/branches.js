const ApiDelegate = require('../apiDelegate')

module.exports = async ctx => {
  try {
    ctx.body = await new ApiDelegate().getBranches()
  } catch(e) {
    ctx.status = 500
    ctx.body = []
  }
}
