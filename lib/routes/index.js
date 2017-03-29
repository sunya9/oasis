module.exports = router => {
  router.get('/', async ctx => {
    const local = {
      index: true
    }
    if(ctx.isAuthenticated()) {
      const api = require('../github')(ctx.state.user.token)
      const json = await api.repos.getAll({
        visibility: 'all'
      })
      local.repos = json.data
    }
    await ctx.render('index', local)
  })
}