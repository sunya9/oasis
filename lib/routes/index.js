const { owner, repo } = require('../apiDelegate')

module.exports = async ctx => {
  await ctx.render('index', {
    owner, repo
  })
}
