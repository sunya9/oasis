const { api, owner, repo } = require('../github')

module.exports = async ctx => {
  const json = await api.repos.getBranches({
    owner, repo
  })
  ctx.body = json.data
}