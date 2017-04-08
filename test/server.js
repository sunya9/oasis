const supertest = require('supertest')
const path = require('path')
require('should')

require('dotenv').config({
  path: path.join(__dirname, '.env')
})


// Add test provider
const ApiDelegate = require('../lib/apiDelegate')
const testProvider = require('./fixtures/testProvider')
Object.assign(ApiDelegate.PROVIDERS, { test: testProvider })

let app, request

describe('server', () => {
  before(done => {
    app = require('../').listen(process.env.PORT, done)
    request = supertest(app)
  })
  after(() => {
    app.close()
  })

  describe('/', () => {
    let req
    beforeEach(() => {
      req = request
        .get('/')
        .expect('Content-Type', /^text\/html/)
        .expect(200)
    })
    it('Show and correct title', done => {
      req.end((err, { text }) => {
        if(err) done(err)
        const { fullRepo } = new ApiDelegate()
        const regexp = new RegExp(`<title>oasis::${fullRepo}</title>`, 'i')
        regexp.test(text).should.be.ok()
        done()
      })
    })
  })

  describe('preview', () => {
    it('Show preview page when container does not exist', done => {
      request
        .get('/preview')
        .set('Host', '1234567.127.0.0.1.xip.io:5123')
        .expect('Content-Type', /^text\/html/)
        .expect(200)
        .end((err, { text }) => {
          if(err) done(err)
          const regexp = /foo\/bar:1234567/
          regexp.test(text).should.be.true()
          done()
        })
    })
  })

  describe('assets', () => {
    after(() => testProvider.internalError = false)
    it('receive main.js', done => {
      request
        .get('/js/main.js')
        .expect('Content-Type', /^application\/javascript/)
        .expect(200)
        .end(done)
    })

    it('receive preview.js', done => {
      request
        .get('/js/preview.js')
        .expect('Content-Type', /^application\/javascript/)
        .expect(200)
        .end(done)
    })

    it('receive index.js', done => {
      request
        .get('/js/index.js')
        .expect('Content-Type', /^application\/javascript/)
        .expect(200)
        .end(done)
    })

    it('receive main.css', done => {
      request
        .get('/css/main.css')
        .expect('Content-Type', /^text\/css/)
        .expect(200)
        .end(done)
    })
  })

  describe('/branches', () => {
    it('is correct json', done => {
      testProvider.internalError = false
      request
        .get('/branches')
        .expect('Content-Type', /^application\/json/)
        .expect(200)
        .end((err, { body: branches }) => {
          if(err) done(err)
          branches.length.should.equal(4)
          const haveNames = branches.every(branch => !!branch.name)
          haveNames.should.equal(true)
          done()
        })
    })
    it('is empty json if occur any errors', done => {
      testProvider.internalError = true
      request
        .get('/branches')
        .expect('Content-Type', /^application\/json/)
        .expect(500)
        .end((err, { body: branches }) => {
          if(err) done(err)
          branches.length.should.equal(0)
          done()
        })
    })
  })
  describe('/commits', () => {
    it('is correct json', done => {
      testProvider.internalError = false
      request
        .get('/commits?branch=master')
        .expect('Content-Type', /^application\/json/)
        .expect(200)
        .end((err, { body: commits }) => {
          if(err) done(err)
          commits.length.should.equal(4)
          const haveShaAndMsg = commits.every(commit => {
            return commit.sha
              && commit.commit.message
              && commit.docker
              && 'exist' in commit.docker
              && commit.docker.url
          })
          haveShaAndMsg.should.equal(true)
          done()
        })
    })
    it('is empty json if occur any errors', done => {
      testProvider.internalError = true
      request
        .get('/commits')
        .expect('Content-Type', /^application\/json/)
        .expect(500)
        .end((err, { body: commits }) => {
          if(err) done(err)
          commits.length.should.equal(0)
          done()
        })
    })
  })
})

