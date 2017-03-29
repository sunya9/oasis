const Dockerode = require('dockerode')
const { name } = require('../package')
const root = require('app-root-path').toString()
const path = require('path')
const simpleGit = require('simple-git')
const fs = require('fs')
const EventEmitter = require('events')
const recursive = require('recursive-readdir')
const stripAnsi = require('strip-ansi')
const rimraf = require('rimraf')

const debug = process.env.NODE_ENV !== 'production'

class Docker extends EventEmitter {
  constructor(opt) {
    super()
    this.run = this.run.bind(this)
    this.createDir = this.createDir.bind(this)
    this.getFiles = this.getFiles.bind(this)
    this.prepareCreateImage = this.prepareCreateImage.bind(this)
    this.buildImage = this.buildImage.bind(this)
    this.createContainer = this.createContainer.bind(this)
    this.redirect = this.redirect.bind(this)
    this.removeDir = this.removeDir.bind(this)
    this.existContainer = this.existContainer.bind(this)

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
    this.dir = path.join(root, 'repos', this.containerName)
  }
  removeDir() {
    return new Promise((resolve, reject) => {
      rimraf(this.dir, err => err ? reject(err) : resolve())
    })
  }
  prepareCreateImage() {
    this.emit('createImage', this.containerName)
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
          this.emit('createImage:complete')
          resolve()
        }, event => {
          const message = event.stream || event.status
          this.emit('createImage:progress', stripAnsi(message))
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
      return git.checkout(this.branch).then(() => 
      git.reset(['hard', this.commitId]))
    })
    .then(this.prepareCreateImage)
    .then(this.removeDir)
    .then(this.createContainer)
    .then(async container => {
      await container.start().catch(() => {})
      return container
    })
    .then(container => container.inspect())
    .then(this.redirect)
  }
  redirect() {
    return debug
      ? this.debugURL
      : this.debugURL
  }

  get debugURL() {
    return `http://${this.owner}.${this.repo}.${this.branch}.${this.commitId}.127.0.0.1.xip.io`
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
  existContainer() {
    return this.docker.getContainer(this.containerName)
      .inspect()
      .then(() => true)
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