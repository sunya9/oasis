const { title } = require('../util')

module.exports = router => {
  router.get('/repositories/', async ctx => {
    const { state: { api }} = ctx
    await api.repos.getAll({
      visibility: 'all'
    }).then(json => {
      return ctx.render('repositories/index', {
        title: title('Repositories'),
        repos: json.data,
        resource: 'index'
      })
    })
  })
  router.get('/repositories/:owner/:repo', async ctx => {
    const { params, state: { api } } = ctx
    const { owner, repo } = params
    const json = await api.repos.getBranches({
      owner, repo
    })
    const branches = await Promise.all(json.data.map(async branch => {
      const docker = {}
      try {
        const data = await api.repos.getContent({
          owner, repo,
          path: 'Dockerfile',
          ref: branch.commit.sha
        })
        docker.exist = !!data.data,
        docker.url = data.data.download_url
      } catch(e) {
        docker.exist = false
      }
      return Object.assign({}, branch, { docker })
    }))
    await ctx.render('repositories/show', {
      title:  title(`${owner}/${repo}`),
      owner, repo, branches,
      resource: 'show'
    })
  })
}