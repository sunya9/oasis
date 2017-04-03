const supertest = require('supertest')
// const should = require('should')
require('dotenv').config('../.env')

process.env.PORT = 5121

let app, request

describe('server', () => {
  before(() => {
    app = require('../')
    request = supertest(app)
  })
  after(() => {
    app.close()
  })
  
  describe('/', () => {
    it('Show', done => {
      request
        .get('/')
        .expect('Content-Type', /^text\/html/)
        .expect(200)
        .end(() => done())
    })
  })

  describe('/preview', () => {
    it('Show', done => {
      request
        .get('/preview')
        .expect('Content-Type', /^text\/html/)
        .expect(200)
        .end(() => done())
    })
  })

  describe('proxy middleware', () => {
    it('Redirect preview page when container does not exist', done => {
      request
        .get('/')
        .set('Host', 'john-doe.repo.master.123456.127.0.0.1.xip.io:5121')
        .end((err, res) => {
          if(err) {
            done(err)
          } else {
            const { headers: { location }} = res
            if(location !== 'http://localhost:5121/preview?branch=master&commit_id=123456') {
              done(new Error('Mismatch redirect URL'))
            } else {
              done()
            }
          }
        })
    })
  })

})

