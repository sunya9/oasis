const linkParser = require('parse-link-header')

module.exports = router => {
  router.get('/', async ctx => {
    
    const { state: { api }} = ctx
    if(ctx.isAuthenticated() && ctx.request.type == 'application/json') {
      const page = ctx.query.page || 1
      // TODO: find
      if(ctx.query.q) {
        // ctx.body = 
      } else { // list
        const json = await api.repos.getAll({
          visibility: 'all',
          page,
          sort: 'pushed'
        })
        const res = {
          data: json.data,
          has_next: !!linkParser(json.meta.link).next
        }
        ctx.body = res
      }
    } else {
      await ctx.render('index')
    }
  })
}