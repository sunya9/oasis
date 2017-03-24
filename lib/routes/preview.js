module.exports = router => {
  router.get('/preview', async ctx => {
    const { owner, repos, branch } = ctx.query
    await ctx.render('preview', {
      owner, repos, branch
    })
  })
}