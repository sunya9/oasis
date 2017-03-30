const github = require('github')

const { TOKEN: token, GITHUB } = process.env

const [owner, repo] = GITHUB.split('/')

const api = new github()
if(token) {
  api.authenticate({
    type: 'token', token
  })
}

exports.api = api
exports.owner = owner
exports.repo = repo

