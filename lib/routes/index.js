const { owner, repo } = require('../github')

module.exports = async ctx => {
  await ctx.render('index', {
    owner, repo
  })
}