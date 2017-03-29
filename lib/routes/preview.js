const through = require('through')
const Docker = require('../docker')

module.exports = router => {
  router.get('/preview', async ctx => {
    const { owner, repo, branch, commit_id: commitId } = ctx.query
    await ctx.render('preview', {
      owner, repo, branch, commitId
    })
  })

  router.post('/preview', async ctx => {
    const { owner, repo, branch, commit_id: commitId } = ctx.request.body
    const t = through()
    ctx.body = await t
    
    const docker = new Docker({
      owner, repo, branch, commitId
    })
    docker.on('createImage', name => {
      t.write(`create image: ${name}\n\n`)
    })
    docker.on('createImage:progress', progress => {
      t.write(`${progress}`)
    })
    docker.run().then(url => {
      t.write('\nFinished. Redirect...\n')
      t.write(url)
      t.end()
    }).catch(err => {
      t.write('error: ' + err)
      t.end()
    })
  })
}