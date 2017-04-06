const through = require('through')
const Docker = require('../docker')
const { owner, repo } = require('../apiDelegate')


exports.get = async ctx => {
  const { branch, commit_id: commitId } = ctx.query
  await ctx.render('preview', {
    owner, repo, branch, commitId
  })
}

exports.post = async ctx => {
  const { branch, commit_id: commitId } = ctx.request.body

  const docker = new Docker({
    owner, repo, branch, commitId
  })
  const status = await docker.getContainerStatus()
  const getURL = port => ctx.env !== 'production'
    ? `http://${owner}.${repo}.${branch}.${commitId}.127.0.0.1.xip.io`
    : `http://localhost:${port}`
  if(!status) { // doen't exist container
    const t = through()
    ctx.body = await t

    docker.on('progress', progress => {
      t.write(progress)
    })

    docker.run()
      .then(docker.getPort)
      .then(getURL)
      .then(url => {
        t.write('\nFinished. Redirect...\n')
        t.write(url)
        t.end()
      }).catch(err => {
        if(err) {
          if(typeof err === 'string') {
            t.write(err)
          } else {
            t.write(err.message)
          }
        }
        t.end()
      })
  } else { //exist container
    if(status === 'exited')
      await docker.container.start()
    const url = await Promise.resolve(docker.getPort).then(getURL)
    ctx.body = { url }
  }
}
