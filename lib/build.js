const path = require('path')
const Dockerode = require('dockerode')
const recursive = require('recursive-readdir')
const Convert = require('ansi-to-html')
const rimraf = require('rimraf')
const simpleGit = require('simple-git/promise')
const fs = require('fs')

const { name } = require('../package')
const ApiDelegate = require('./apiDelegate')
const dotenv = require('dotenv')

dotenv.config({path: path.join(__dirname, '../.env')})

class Build {
  constructor() {
    this.cloneRepo = this.cloneRepo.bind(this)
    this.checkout = this.checkout.bind(this)
    this.existDockerfile = this.existDockerfile.bind(this)
    this.getFiles = this.getFiles.bind(this)
    this.buildImage = this.buildImage.bind(this)
    this.removeDir = this.removeDir.bind(this)
    this.createContainer = this.createContainer.bind(this)
    this.start = this.start.bind(this)
    this.sendContainerId = this.sendContainerId.bind(this)
    this.getHost = this.getHost.bind(this)
    this.onerror = this.onerror.bind(this)
    this._delegate = new ApiDelegate()
    this._convert = new Convert()
  }

  get docker() {
    return new Dockerode({
      socketPath: '/var/run/docker.sock'
    })
  }

  get owner() {
    return this._delegate.owner
  }

  get repo() {
    return this._delegate.repo
  }

  get id() {
    const id = process.argv[2]
    if(!id)
      throw new Error('You must pass commit id.')
    return id
  }

  get containerName() {
    return `${name}_${this.owner}_${this.repo}_${this.id}`
  }

  get imageName() {
    return `${name}_${this.owner}_${this.repo}:${this.id}`
  }

  get reposDir() {
    return path.join(__dirname, '../repos')
  }

  get dir() {
    return path.join(this.reposDir, this.containerName)
  }

  get dockerfilePath() {
    return path.join(this.dir, 'Dockerfile')
  }

  cloneRepo() {
    return simpleGit(this.reposDir)
      .clone(`https://github.com/${this.owner}/${this.repo}.git`, this.dir)
  }

  checkout() {
    return simpleGit(this.dir).checkout(this.id)
  }

  existDockerfile() {
    return new Promise((resolve, reject) => {
      fs.access(this.dockerfilePath, (err) => {
        if(err) {
          err = new Error('Dockerfile does not exist.')
          reject(err)
        }
        resolve()
      })
    })
  }

  getFiles() {
    return new Promise((resolve, reject) => {
      recursive(this.dir, (err, files) => {
        if(err) reject(err)
        resolve(files)
      })
    }).then(files => {
      return files.map(file => file.replace(this.dir, ''))
    })
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
          const message = this._convert.toHtml(event.stream || event.status)
          if(process.send) {
            process.send({
              type: 'progress', message
            })
          }
        })
      })
    })
  }

  removeDir() {
    return new Promise(resolve => rimraf(this.dir, resolve))
  }

  createContainer() {
    return this.docker.createContainer({
      Image: this.imageName,
      name: this.containerName,
      // PublishAllPorts: true
      Env: this.oasisConfig
    }).catch(() => {
      return this.docker.getContainer(this.containerName)
    })
  }

  start(container) {
    return container.start().catch(() => container)
  }

  sendContainerId(container) {
    if(process.send) {
      process.send({
        type: 'container',
        message: container.id
      })
    }
    return container
  }

  getHost(container) {
    return new Promise(async resolve => {
      if(process.send) {
        const inspect = await container.inspect()
        // TODO: throw error if port is undefined
        const { Ports } = inspect.NetworkSettings
        const port = Object.keys(Ports).map(p => parseInt(p))[0]
        const { IPAddress } = inspect.NetworkSettings.Networks.bridge
        const host = `http://${IPAddress}:${port}`
        process.send({
          type: 'host',
          message: host
        })
        resolve()
      }
    })
  }

  onerror(err) {
    if(process.send)
      process.send({
        type: 'error',
        message: err.message
      })
    process.exit(1)
  }
}

const build = new Build()

build.removeDir()
  .then(build.cloneRepo)
  .then(build.checkout)
  .then(build.existDockerfile)
  .then(build.getFiles)
  .then(build.buildImage)
  .then(build.createContainer)
  .then(build.start)
  .then(build.sendContainerId)
  .then(build.getHost)
  .then(build.removeDir)
  .catch(build.onerror)
