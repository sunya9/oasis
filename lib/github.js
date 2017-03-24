const GithubApi = require('github')
const {
  CLIENT_ID: key,
  CLIENT_SECRET: secret,
} = process.env

module.exports = token => {
  const github = new GithubApi()
  github.authenticate({
    type: 'oauth',
    token, key, secret
  })
  return github
}