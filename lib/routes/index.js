const ApiDelegate = require('../apiDelegate')

module.exports = async ctx => {
  const { owner, repo } = new ApiDelegate()
  await ctx.render('index', {
    owner, repo
  })
}
