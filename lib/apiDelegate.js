const github = require('./provider/github')

class ApiDelegate {
  constructor() {
    this.getBranches = this.getBranches.bind(this)
    this.getCommits = this.getCommits.bind(this)

    this.delegate = new this.Provider({
      owner: this.owner,
      repo: this.repo,
      token: this.token
    })
  }

  get providerName() {
    const { PROVIDER } = process.env
    if(!PROVIDER)
      throw new Error('Require PROVIDER environment variable.')
    return PROVIDER.toLowerCase()
  }

  get Provider() {
    const Provider = ApiDelegate.PROVIDERS[this.providerName]
    if(!Provider)
      throw new Error(`Choose PROVIDER: ${Object.keys(ApiDelegate.PROVIDERS)}`)
    return Provider
  }

  get fullRepo() {
    const { REPO } = process.env
    if(!REPO)
      throw new Error('Require REPO environment variable.')
    if(REPO.indexOf('/') <= 0)
      throw new Error('REPO environment variable should have split with "/"(e.g. owner/repo).')
    return REPO
  }

  get owner() {
    return this.fullRepo.split('/')[0]
  }

  get repo() {
    return this.fullRepo.split('/')[1]
  }

  get token() {
    const token = process.env.PROVIDER_TOKEN
    if(!token)
      throw new Error('Require PROVIDER_TOKEN environment variable.')
    return token
  }

  getBranches() {
    return this.delegate.getBranches()
  }
  getCommits(branch) {
    return this.delegate.getCommits(branch)
  }
}

ApiDelegate.PROVIDERS = {
  github
}

module.exports = ApiDelegate
