const through = require('through')
const Docker = require('../docker')
const ApiDelegate = require('../apiDelegate')
const request = require('request-promise-native')

const { owner, repo } = new ApiDelegate()

exports.GET = async ctx => {
  const { subdomains: [id] } = ctx
  await ctx.render('preview', {
    owner, repo, id
  })
}

exports.POST = async ctx => {
  const { subdomains: [id] } = ctx
  const docker = new Docker(id)
  const status = await docker.getContainerStatus()
  if(!status) { // doen't exist container
    const t = through()
    ctx.body = await t

    docker.on('progress', progress => {
      t.write(progress)
    })

    docker.run()
      .then(docker.getHost)
      .then(host => {
        t.write('\nFinished. Waiting.')
        // check that server is built
        return new Promise(async (resolve) => {
          for(let i = 0; 10 > i; i++) {
            try {
              await request.get(host)
              t.write('\n')
              resolve(host)
            } catch(e) {
              t.write('.')
            }
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
          // How to occur errors intentionaly?
          resolve()
          // reject()
        })
      })
      .then(t.end)
      .catch(err => {
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
    // ctx.body = { url }
  }
}
