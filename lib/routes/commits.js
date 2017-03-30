const { api, owner, repo } = require('../github')

module.exports = async ctx => {
  const { query: { branch: sha }} = ctx
  const json = await api.repos.getCommits({
    owner, repo, sha
  })
  const commits = await Promise.all(json.data.map(async commit => {
    const docker = {}
    try {
      const data = await api.repos.getContent({
        owner, repo,
        path: 'Dockerfile',
        ref: commit.sha
      })
      docker.exist = !!data.data,
      docker.url = data.data.download_url
    } catch(e) {
      docker.exist = false
    }
    return Object.assign({}, commit, { docker })
  }))
  ctx.body = commits
}