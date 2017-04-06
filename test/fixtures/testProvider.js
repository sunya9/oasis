const branches = require('./branches')
const commits = require('./commits')

class TestProvider {
  constructor() {
    this.getBranches = this.getBranches.bind(this)
    this.getCommits = this.getCommits.bind(this)
  }

  getCommits(branch) {
    return branch ? commits : []
  }

  getBranches() {
    return branches
  }
}

module.exports = TestProvider
