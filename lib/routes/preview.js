const ApiDelegate = require('../apiDelegate')
const request = require('request-promise-native')
const containerManager = require('../containerManager')
const ContainerInfo = require('../containerInfo')
const { owner, repo } = new ApiDelegate()
const OutputJSON = require('./outputJSON')
exports.GET = async ctx => {
  const { subdomains: [id] } = ctx
  await ctx.render('preview', {
    owner, repo, id
  })
}

exports.POST = async ctx => {
  // This middleware is passed through if container does not exist.
  const { subdomains: [id] } = ctx
  const outputJSON = new OutputJSON()
  ctx.body = await outputJSON.through

  let info = await containerManager.get(id)
  if(!info) { // container and cache does not exist
    info = new ContainerInfo()
    containerManager.add(id, info)
    info.createBuildProcess(id)
  }
  info.buildLog.forEach(({ status, message }) => {
    outputJSON.write(status, message)
  })
  if(info && info.build && !info.build.connected) {
    process.nextTick(() => outputJSON.end())
  }

  info.build.on('message', ({ message, type }) => {
    switch (type) {
    case 'error':
    case 'progress': {
      const status = type !== 'error'
      outputJSON.write(status, message)
    }
    }
  })

  info.build.on('exit', async code => {
    if(code === 0) {
      await new Promise(async (resolve, reject) => {
        outputJSON.write(true, '\nFinished. Waiting.')
        const { host } = info
        for(let i = 0; 10 > i; i++) {
          try {
            await request.get(host)
            resolve()
          } catch(e) {
            outputJSON.write(true, '.')
          }
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        reject(new Error('Could not connect to server.'))
      })
      .then(() => outputJSON.end())
      .catch(err => {
        outputJSON.write(false, err.message)
        outputJSON.end()
      })
    } else {
      outputJSON.end()
    }
  })
}
