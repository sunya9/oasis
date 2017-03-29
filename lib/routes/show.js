const { title } = require('../util')

module.exports = router => {
  router.get('/show', async ctx => {
    const { query } = ctx
    const { owner, repo } = query
    const api = require('../github')(ctx.state.user.token)
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
    await ctx.render('show', {
      title:  title(`${owner}/${repo}`),
      owner, repo, branches,
      resource: 'show'
    })
  })
}