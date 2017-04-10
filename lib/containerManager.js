const LRU = require('lru-cache')
const Dockerode = require('dockerode')

// cache build process and container
class ContainerManager {
  constructor() {
    this.get = this.get.bind(this)
    this.add = this.add.bind(this)
    this.del = this.del.bind(this)
    this.start = this.start.bind(this)
    this.status = this.status.bind(this)
    this.dispose = this.dispose.bind(this)

    const options = {
      maxAge: this.maxAge,
      max: this.max,
      dispose: this.dispose
    }
    this.cache = LRU(options)
    this.docker = new Dockerode({
      socketPath: '/var/run/docker.sock'
    })
  }

  // start container
  // do nothing if container already have been started.
  // Normally, it is no happened that container get exit without removing.
  async start(id) {
    const { container, host } = await this.cache.get(id)
    try {
      await container.start()
    } catch(e) {
     // ignore error
    }
    return host
  }

  async status(id) {
    try {
      const info = this.cache.get(id)
      if(!info) return false
      const { container } = info
      const inspect = await container.inspect()
      // 'exited'
      return inspect.State.Status
    } catch(e) {
      return false
    }
  }

  get maxAge() {
    return process.env.MAX_AGE || 1000 * 60 * 60 * 24
  }
  get max() {
    return process.env.MAX_CONTAINER || 50
  }

  async dispose(id) {
    try {
      await this.docker
        .getContainer(id)
        .stop()
        .then(container => container.remove())
    } catch(e) {
      // ignore
    }
  }

  // If got null, container not exists.
  get(id) {
    return this.cache.get(id.substr(0, 7))
  }

  // id is a string that have 7 letters.
  add(id, cm) {
    return this.cache.set(id.substr(0, 7), cm)
  }

  del(id) {
    return this.cache.del(id.substr(0, 7))
  }
}

module.exports = new ContainerManager()
