const through = require('through')

class OutputJSON {
  constructor() {
    this.write = this.write.bind(this)
    this.end = this.end.bind(this)
    this.through = through()
  }

  write(status, body) {
    return this.through.write(
      JSON.stringify({ status, body }) + '\n'
    )
  }

  end() {
    return this.through.end()
  }
}

module.exports = OutputJSON
