import * as LRU from 'lru-cache'
import * as Dockerode from 'dockerode'
import ContainerInfo from './containerInfo'
import env from './env'

const ONE_DAY = 1000 * 60 * 60 * 24

// cache build process and container
class ContainerManager {
  private cache: LRU.Cache<string, ContainerInfo>
  private docker: Dockerode

  constructor() {
    this.get = this.get.bind(this)
    this.add = this.add.bind(this)
    this.del = this.del.bind(this)
    this.start = this.start.bind(this)
    this.status = this.status.bind(this)
    this.dispose = this.dispose.bind(this)

    this.cache = new LRU({
      maxAge: this.maxAge,
      max: this.max,
      dispose: this.dispose
    })
    this.docker = new Dockerode({
      socketPath: '/var/run/docker.sock'
    })
  }

  // start container
  // do nothing if container already have been started.
  // Normally, it is no happened that container get exit without removing.
  async start(id: string) {
    const { container, host } = this.cache.get(id)
    try {
      await container.start()
    } catch (e) {
      // ignore error
    }
    return host
  }

  async status(id: string): Promise<boolean | string> {
    try {
      const info: ContainerInfo = this.cache.get(id)
      if (!info) return false
      const { container } = info
      const inspect = await container.inspect()
      // 'exited'
      return inspect.State.Status
    } catch (e) {
      return false
    }
  }

  get maxAge(): number {
    return +env.MAX_AGE || ONE_DAY
  }
  get max(): number {
    return +env.MAX_CONTAINER || 50
  }

  async dispose(id: string): Promise<void> {
    try {
      const container = this.docker.getContainer(id)
      await container.stop()
      await container.remove()
    } catch (e) {
      // ignore
    }
  }

  // If got null, container not exists.
  get(id: string): ContainerInfo {
    return this.cache.get(id.substr(0, 7))
  }

  // id is a string that have 7 letters.
  add(id: string, ci: ContainerInfo): boolean {
    return this.cache.set(id.substr(0, 7), ci)
  }

  del(id: string): void {
    this.cache.del(id.substr(0, 7))
  }
}

export default new ContainerManager()
