const through = require('through')
const ApiDelegate = require('../apiDelegate')
const request = require('request-promise-native')
const containerManager = require('../containerManager')
const ContainerInfo = require('../containerInfo')
const { owner, repo } = new ApiDelegate()

exports.GET = async ctx => {
  const { subdomains: [id] } = ctx
  await ctx.render('preview', {
    owner, repo, id
  })
}

exports.POST = async ctx => {
  // This request always not exist container
  const { subdomains: [id] } = ctx
  const t = through()
  ctx.body = await t

  let info = await containerManager.get(id)
  if(!info) {
    info = new ContainerInfo()
    containerManager.add(id, info)
    info.createBuildProcess(id)
  }
  info.buildLog.forEach(line => t.write(line))
  info.build.on('message', payload => {
    if(payload.type === 'progress')
      t.write(payload.message)
  })

  info.build.on('exit', async () => {
    await new Promise(async resolve => {
      t.write('\nFinished. Waiting.')
      const { host } = info
      for(let i = 0; 10 > i; i++) {
        try {
          await request.get(host)
          resolve()
        } catch(e) {
          t.write('.')
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      // TODO: How to occur errors intentionaly?
      resolve()
      // reject()
    })
    .then(() => t.end())
    .catch(err => {
      // console.error(err)
      if(err) {
        if(typeof err === 'string') {
          t.write(err)
        } else {
          t.write(err.message)
        }
      }
      t.end()
    })
  })
}
