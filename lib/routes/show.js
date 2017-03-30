const { title } = require('../util')

module.exports = router => {
  router.get('/show', async ctx => {
    const { owner, repo } = ctx.query
    await ctx.render('show', {
      title:  title(`${owner}/${repo}`),
      owner, repo
    })
  })
}