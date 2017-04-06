const ApiDelegate = require('../apiDelegate')

module.exports = async ctx => {
  const { query: { branch }} = ctx
  try {
    ctx.body = await new ApiDelegate().getCommits(branch)
  } catch(e) {
    ctx.body = []
  }
}
