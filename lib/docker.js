const Dockerode = require('dockerode')
const { name } = require('../package')
const path = require('path')
const simpleGit = require('simple-git')
const fs = require('fs')
const EventEmitter = require('events')
const recursive = require('recursive-readdir')
const stripAnsi = require('strip-ansi')
const rimraf = require('rimraf')

class Docker extends EventEmitter {
  constructor(opt) {
    super()
    this.run = this.run.bind(this)
    this.createDir = this.createDir.bind(this)
    this.getFiles = this.getFiles.bind(this)
    this.prepareCreateImage = this.prepareCreateImage.bind(this)
    this.buildImage = this.buildImage.bind(this)
    this.createContainer = this.createContainer.bind(this)
    this.removeDir = this.removeDir.bind(this)
    this.getContainerStatus = this.getContainerStatus.bind(this)
    this.getPort = this.getPort.bind(this)

    const {
      commitId,
      branch,
      repo,
      owner
    } = opt
    this.commitId = commitId.substr(0, 6)
    this.branch = branch
    this.repo = repo
    this.owner = owner
    this.docker = new Dockerode({
      socketPath: '/var/run/docker.sock'
    })
    this.dir = path.join(__dirname, '../repos', this.containerName)
  }
  removeDir() {
    return new Promise(resolve => {
      // rimraf(this.dir, err => err ? reject(err) : resolve())
      rimraf(this.dir, () => resolve())
    })
  }
  prepareCreateImage() {
    return this.getFiles().then(this.buildImage)
  }
  buildImage(files) {
    return new Promise((resolve, reject) => {
      this.docker.buildImage({
        context: this.dir,
        src: files
      }, {
        t: this.imageName
      }, (err, stream) => {
        if(err) reject(err)
        this.docker.modem.followProgress(stream, err => {
          if(err) reject(err)
          resolve()
        }, event => {
          const message = event.stream || event.status
          this.emit('progress', stripAnsi(message))
        })
      })
    })
  }
  createDir() {
    return new Promise(resolve => {
      fs.mkdir(this.dir, err => resolve(!!err))
    }).then(exist => {
      if(exist) return 
      return simpleGit(this.dir).clone(
      `https://github.com/${this.owner}/${this.repo}.git`
    , '.')
    })
  }
  getFiles() {
    return new Promise((resolve, reject) => {
      recursive(this.dir, (err, files) => err ? reject(err) : resolve(files))
    }).then(files => files.map(file => file.replace(this.dir, '')))
  }
  async run() {
    return this.createDir(this.dir).then(() => {
      const git = simpleGit(this.dir)
      return git.checkout(this.commitId)
      // .then(() => git.reset(['--hard', this.commitId]))
    })
    .then(this.prepareCreateImage)
    .then(this.removeDir)
    .then(this.createContainer)
    .then(async container => {
      await container.start().catch(() => {})
      return container
    })
    .then(container => container.inspect())
  }
  getPort() {
    // TODO: implement
    return 5123
  }
  createContainer() {
    return this.docker.createContainer({
      Image: this.imageName,
      name: this.containerName,
      PublishAllPorts: true
    }).catch(err => {
      const [, id] = err.message.match(/by container (\w+)\./)
      return this.docker.getContainer(id)
    })
  }
  get container() {
    return this.docker.getContainer(this.containerName)
  }
  getContainerStatus() {
    return this.docker.getContainer(this.containerName)
      .inspect()
      .then(res => res.State.Status)
      .catch(() => false)
  }
  get containerName() {
    return `${name}_${this.owner}_${this.repo}_${this.branch}_${this.commitId}`
  }
  get imageName() {
    return `${name}_${this.owner}_${this.repo}:${this.tag}`
  }
  get tag() {
    return `${this.branch}_${this.commitId}`
  }
}

module.exports = Docker