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
    }).then(res => {
      const ct = res.headers.get('content-type')
      return this.octet(res)
    })
  },
  methods: {
    scroll() {
      this.outputEl.scrollTop = this.outputEl.scrollHeight
    },
    json(res) {
      return res.json().then(({ url }) => {
        if(!debug)
          location.href = url
      })
    },
    octet(res) {
      this.output = ''
      const reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let text
      const processResult = result => {
        if(result.done) {
          this.scroll()
          if(!debug) {
            location.reload(true)
          } else {
            // development mode
            this.output += '\nYou are development mode! You can see built pages if reload.'
            this.$nextTick(this.scroll)
          }
          return
        }
        text = decoder.decode(result.value)
        this.output += text
        this.$nextTick(this.scroll)
        reader.read().then(processResult)
      }
      reader.read().then(processResult)
    }
  }
})
