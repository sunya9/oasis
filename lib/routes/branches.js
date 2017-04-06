const ApiDelegate = require('../apiDelegate')

module.exports = async ctx => {
  ctx.body = await new ApiDelegate().getBranches()
}
