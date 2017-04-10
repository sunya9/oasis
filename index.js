const fs = require('fs')
const path = require('path')
require('dotenv').config()

if(!process.env.PORT)
  process.env.PORT = 5121

if(!process.env.HOST)
  process.env.HOST = 'localhost'

const app = require('./lib/app')

// create repos dir
fs.mkdir(path.join(__dirname, 'repos'), () => null)

const { HOST, PORT } = process.env

if(!module.parent) {
  app.listen(PORT, () => {
    console.log(`listening on http://${HOST}:${PORT}`) // eslint-disable-line
  })
} else {
  module.exports = app
}
