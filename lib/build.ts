import * as path from 'path'
import * as Dockerode from 'dockerode'
import * as recursive from 'recursive-readdir'
import { default as AnsiUp } from 'ansi_up'
import * as simpleGit from 'simple-git/promise'
import * as fs from 'fs-extra'
import * as dotenv from 'dotenv'
import { path as rootPath } from 'app-root-path'

import ApiDelegate from './apiDelegate'

const pkgPath: string = path.join(rootPath, 'package.json')
const envPath: string = path.join(rootPath, '.env')

const { name } = require(pkgPath)
dotenv.config({ path: envPath })

export enum BuildStatus {
  Progress,
  Complete,
  Error,
  Waiting,
  Established
}

export interface BuildLog {
  status: BuildStatus
  message?: string
}

export enum MessageType {
  Host,
  Container,
  BuildStatus
}

export interface Message {
  type: MessageType
  message?: string
  buildLog?: BuildLog
}

class Build {
  private delegate: ApiDelegate
  private ansiUp: AnsiUp
  private _dockerInst: Dockerode

  constructor() {
    this.delegate = new ApiDelegate()
    this.ansiUp = new AnsiUp()
  }

  async run(): Promise<void> {
    try {
      await this.removeDir()
      await this.cloneRepo()
      await this.checkout()
      await this.existDockerfile()
      await this.buildImage()
      const container = await this.createContainer()
      await container.start()
      await this.sendContainerId(container.id)
      await this.sendHostInfo(container)
      await this.removeDir()
    } catch (e) {
      this.onerror(e)
    }
  }

  get docker(): Dockerode {
    if (!this._dockerInst) {
      this._dockerInst = new Dockerode({
        socketPath: '/var/run/docker.sock'
      })
    }
    return this._dockerInst
  }

  get owner(): string {
    return this.delegate.owner
  }

  get repo(): string {
    return this.delegate.repo
  }

  get id(): string {
    const id = process.argv[2]
    if (!id) throw new Error('You must pass commit id.')
    return id
  }

  get containerName(): string {
    return `${name}_${this.owner}_${this.repo}_${this.id}`
  }

  get imageName(): string {
    return `${name}_${this.owner}_${this.repo}:${this.id}`
  }

  get reposDir(): string {
    return path.join(rootPath, 'repos')
  }

  get dir(): string {
    return path.join(this.reposDir, this.containerName)
  }

  get dockerfilePath(): string {
    return path.join(this.dir, 'Dockerfile')
  }

  private cloneRepo(): Promise<any> {
    const repoURL: string = this.delegate.provider.getRepoURL()
    return simpleGit(this.reposDir).clone(repoURL, this.dir)
  }

  private checkout() {
    return simpleGit(this.dir).checkout(this.id)
  }

  private existDockerfile(): Promise<void> {
    return fs.access(this.dockerfilePath)
  }

  // you must not use async/await because that is cannot receive stream.
  private async buildImage() {
    const absPathFiles: string[] = await recursive(this.dir)
    const files: string[] = absPathFiles.map((file: string) =>
      file.replace(this.dir, '')
    )
    return new Promise((resolve, reject) => {
      this.docker.buildImage(
        {
          context: this.dir,
          src: files
        },
        {
          t: this.imageName
        },
        (err, stream) => {
          if (err) reject(err)
          this.docker.modem.followProgress(
            stream,
            (err: Error) => {
              if (err) reject(err)
              resolve()
            },
            (event: any) => {
              const message = this.ansiUp.ansi_to_html(
                event.stream || event.status || ''
              )
              const buildLog: BuildLog = {
                status: BuildStatus.Progress,
                message
              }
              this.sendMessage({
                type: MessageType.BuildStatus,
                buildLog
              })
            }
          )
        }
      )
    })
  }

  private removeDir() {
    return fs.remove(this.dir)
  }

  private createContainer(): Promise<Dockerode.Container> {
    try {
      return this.docker.createContainer({
        Image: this.imageName,
        name: this.containerName
        // PublishAllPorts: true
        // Env: this.oasisConfig
      })
    } catch (e) {
      return Promise.resolve(this.docker.getContainer(this.containerName))
    }
  }

  private sendContainerId(containerId: string): void {
    this.sendMessage({
      type: MessageType.Container,
      message: containerId
    })
  }

  private async sendHostInfo(container: Dockerode.Container): Promise<void> {
    const inspect = await container.inspect()
    // TODO: throw error if port is undefined
    const { Ports } = inspect.NetworkSettings
    const port = Object.keys(Ports).map(p => parseInt(p))[0]
    const { IPAddress } = inspect.NetworkSettings.Networks.bridge
    const host = `http://${IPAddress}:${port}`
    this.sendMessage({
      type: MessageType.Host,
      message: host
    })
    this.sendMessage({
      type: MessageType.BuildStatus,
      buildLog: { status: BuildStatus.Complete, message: 'complete' }
    })
  }

  private sendMessage(message: Message): void {
    if (!process.send) return
    process.send(message)
  }

  private onerror(err: Error): void {
    this.sendMessage({
      type: MessageType.BuildStatus,
      buildLog: {
        status: BuildStatus.Error,
        message: err.message
      }
    })
    console.error(err)
    process.exit(1)
  }
}

async function main() {
  try {
    const build = new Build()
    await build.run()
  } catch (e) {
    console.error(e)
  }
}

if (!module.parent) {
  main()
}
