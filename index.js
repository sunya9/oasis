const fs = require('fs')
const path = require('path')
require('dotenv').config()

const app = require('./lib/app')

// create repos dir
fs.mkdir(path.join(__dirname, 'repos'), () => null)

const port = process.env.PORT || 5121

app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`) // eslint-disable-line
})