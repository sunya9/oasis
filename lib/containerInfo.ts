import * as child_process from 'child_process'
import * as path from 'path'
import * as Dockerode from 'dockerode'
import { BuildLog, MessageType, Message } from './build'
import { path as rootPath } from 'app-root-path'

class ContainerInfo {
  private _host: string
  private _container: Dockerode.Container
  private _logs: BuildLog[] = []
  private _build: child_process.ChildProcess

  get container(): Dockerode.Container {
    return this._container
  }

  get host() {
    return this._host
  }

  set host(host: string) {
    this._host = host
  }

  public setContainerFromId(id: string) {
    this._container = new Dockerode({
      socketPath: '/var/run/docker.sock'
    }).getContainer(id)
  }

  get buildProcess(): child_process.ChildProcess {
    return this._build
  }

  get buildLog(): BuildLog[] {
    return this._logs
  }

  // Create build process.
  // Build process is the only one per each commit id.
  async createBuildProcess(id: string) {
    if (!this._build) {
      this._build = child_process.fork(path.join(__dirname, 'build.js'), [id])
      this._build.on('message', this.receiveMessage.bind(this))
    }
    return this._build
  }

  private receiveMessage(payload: Message) {
    const { type, message } = payload
    switch (type) {
      case MessageType.Host: {
        this.host = <string>message
        break
      }
      case MessageType.Container: {
        this.setContainerFromId(<string>message)
        break
      }
      case MessageType.BuildStatus: {
        this._logs.push(payload.buildLog)
        break
      }
    }
  }
}

export default ContainerInfo
