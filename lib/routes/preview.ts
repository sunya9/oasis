import * as Koa from 'koa'
import ApiDelegate from '../apiDelegate'
import * as request from 'request-promise-native'
import containerManager from '../containerManager'
import ContainerInfo from '../containerInfo'
import OutputJSON from './outputJSON'
import { Message, MessageType, BuildLog, BuildStatus } from '../build'

const { owner, repo } = new ApiDelegate()

const GET = async (ctx: Koa.Context) => {
  const {
    subdomains: [id]
  } = ctx
  await ctx.render('preview', {
    owner,
    repo,
    id
  })
}

const POST = async (ctx: Koa.Context) => {
  // This middleware is passed through if container does not exist.
  const {
    subdomains: [id]
  } = ctx
  const outputJSON: OutputJSON = new OutputJSON()
  ctx.body = await outputJSON.through

  let info = await containerManager.get(id)
  if (!info) {
    // container and cache does not exist
    info = new ContainerInfo()
    containerManager.add(id, info)
    info.createBuildProcess(id)
  }
  info.buildLog.forEach((log: BuildLog) => outputJSON.write(log))
  if (info && info.buildProcess && !info.buildProcess.connected) {
    process.nextTick(() => outputJSON.end())
  }

  info.buildProcess.on('message', (message: Message) => {
    switch (message.type) {
      case MessageType.BuildStatus: {
        outputJSON.write(message.buildLog)
      }
    }
  })

  info.buildProcess.on('error', (err: Error) => {
    console.error(err)
  })

  info.buildProcess.on('exit', async (code: Number) => {
    if (code === 0) {
      await new Promise(async (resolve, reject) => {
        outputJSON.write({
          status: BuildStatus.Waiting,
          message: '\nFinished. Waiting.'
        })
        const { host } = info
        for (let i = 0; 10 > i; i++) {
          try {
            await request.get(host)
            resolve()
          } catch (e) {
            outputJSON.write({ status: BuildStatus.Waiting, message: '.' })
          }
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        reject(new Error('Could not connect to server.'))
      })
        .then(() => {
          outputJSON.end({
            status: BuildStatus.Established,
            message: 'established!'
          })
        })
        .catch(err => {
          outputJSON.end({ status: BuildStatus.Error, message: err.message })
        })
    } else {
      outputJSON.end()
    }
  })
}

export default { GET, POST }
