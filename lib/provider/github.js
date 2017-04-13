const github = require('github')

module.exports = class Github {
  constructor({ owner, repo, token }) {
    this.getBranches = this.getBranches.bind(this)
    this.getCommits = this.getCommits.bind(this)

    this._owner = owner
    this._repo = repo
    this._api = new github()
    this._api.authenticate({
      type: 'token', token
    })
  }

  getBranches() {
    return this._api.repos.getBranches({
      owner: this._owner,
      repo: this._repo
    }).then(json => json.data)
  }
  getCommits(sha) {
    return this._api.repos.getCommits({
      owner: this._owner,
      repo: this._repo,
      sha
    }).then(({ data }) => data)
  }
}

