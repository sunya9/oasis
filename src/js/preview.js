import Vue from 'vue'

const debug = process.env.NODE_ENV !== 'production'

new Vue({
  el: '#preview',
  data: {
    output: '',
    outputEl: null
  },
  mounted() {
    this.outputEl = this.$el.querySelector('output')
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    fetch('/', {
      method: 'POST',
      headers
    }).then(this.octet)
  },
  methods: {
    scroll() {
      this.outputEl.scrollTop = this.outputEl.scrollHeight
    },
    json(res) {
      return res.json().then(({ url }) => {
        if (!debug) location.href = url
      })
    },
    octet(res) {
      this.output = ''
      const reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8')
      const processResult = result => {
        if (result.done) {
          this.scroll()
          if (!debug) {
            location.reload(true)
          } else {
            // development mode
            this.output +=
              '\n<a href="">You are development mode! You can see built pages if reload.</a>'
            this.$nextTick(this.scroll)
          }
          return
        }
        const jsons = decoder
          .decode(result.value)
          .trim()
          .split('\n')

        let lastRes
        jsons.map(json => {
          try {
            lastRes = JSON.parse(json)
            this.output += lastRes.message
          } catch (e) {}
        })
        this.$nextTick(this.scroll)
        if (lastRes && !lastRes.complete) {
          reader.read().then(processResult)
        }
      }
      reader.read().then(processResult)
    }
  }
})
