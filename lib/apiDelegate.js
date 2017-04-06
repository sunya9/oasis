const { REPO, PROVIDER, PROVIDER_TOKEN: token } = process.env
const github = require('./provider/github')

class ApiDelegate {
  constructor() {
    this.getBranches = this.getBranches.bind(this)
    this.getCommits = this.getCommits.bind(this)

    const Provider = ApiDelegate.PROVIDERS[PROVIDER.toLowerCase()]
    if(!Provider)
      throw new Error('Choose PROVIDER: github')
    this.delegate = new Provider({
      token, owner, repo
    })
  }

  getBranches() {
    return this.delegate.getBranches()
  }
  getCommits(branch) {
    return this.delegate.getCommits(branch)
  }
}

if(!REPO)
  throw new Error('Require REPO environment variable.')
if(!token)
  throw new Error('Require PROVIDER_TOKEN environment variable.')
if(!PROVIDER)
  throw new Error('Require PROVIDER environment variable.')

const [owner, repo] = REPO.split('/')
if(!repo)
  throw new Error('REPO environment variable should have split with "/".')

ApiDelegate.owner = owner
ApiDelegate.repo = repo

ApiDelegate.PROVIDERS = {
  github
}

module.exports = ApiDelegate
