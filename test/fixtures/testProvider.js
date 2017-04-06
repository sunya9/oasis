const branches = require('./branches')
const commits = require('./commits')

class TestProvider {
  constructor() {
    this.getBranches = this.getBranches.bind(this)
    this.getCommits = this.getCommits.bind(this)
  }

  getCommits() {
    if(!TestProvider.internalError) {
      return commits
    } else {
      throw new Error('Occur error')
    }
  }

  getBranches() {
    if(!TestProvider.internalError) {
      return branches
    } else {
      throw new Error('Occur error')
    }
  }
}

TestProvider.internalError = false

module.exports = TestProvider
