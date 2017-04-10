const child_process = require('child_process')
const path = require('path')
const Dockerode = require('dockerode')

class ContainerInfo {
  constructor({ host, container, build } = {}) {
    this.isBuilding = this.isBuilding.bind(this)
    this.createBuildProcess = this.createBuildProcess.bind(this)
    this.receiveMessage = this.receiveMessage.bind(this)

    this._host = host
    this._container = container
    this._build = build
    this._logs = []
  }

  get host() {
    return this._host
  }
  set host(host) {
    this._host = host
  }

  get container() {
    return this._container
  }
  set container(id) {
    this._container = new Dockerode({
      socketPath: '/var/run/docker.sock'
    }).getContainer(id)
  }

  get build() {
    return this._build
  }

  get isBuilt() {
    return this._build === null && !!this.container
  }

  get buildLog() {
    return this._logs
  }

  isBuilding() {
    return !!this._build
  }

  // Create build process.
  // Build process is the only one per each commit id.
  createBuildProcess(id) {
    if(!this._build) {
      this._build = child_process.fork(path.join(__dirname, './build.js'), [id])
      this._build.on('message', this.receiveMessage)
    }
    return this._build
  }

  receiveMessage(payload) {
    const { type, message } = payload
    switch(type) {
    case 'host': {
      this.host = message
      break
    }
    case 'container': {
      this.container = message
      break
    }
    }
  }

}

module.exports = ContainerInfo
