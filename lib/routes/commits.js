const ApiDelegate = require('../apiDelegate')

module.exports = async ctx => {
  const { query: { branch }} = ctx
  try {
    if(branch) {
      ctx.body = await new ApiDelegate().getCommits(branch)
    } else {
      throw new Error('Require branch query param')
    }
  } catch(e) {
    ctx.status = 500
    ctx.body = []
  }
}
