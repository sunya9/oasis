module.exports = router => {
  router.get('/branch', async ctx => {
    const { query: { owner, repo }, state: { api } } = ctx
    
    const json = await api.repos.getBranches({
      owner, repo
    })
    ctx.body = json.data
  })
}