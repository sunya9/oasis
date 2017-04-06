import Vue from 'vue'
import qs from 'querystring'

const debug = process.env.NODE_ENV !== 'production'

new Vue({
  el: '#preview',
  data: {
    output: '',
    outputEl: null
  },
  mounted() {
    this.outputEl = this.$el.querySelector('output')
    const body = qs.parse(location.search.substr(1))
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    fetch(location.pathname, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    }).then(res => {
      const ct = res.headers.get('content-type')
      if(ct && ct.indexOf('application/json') !== -1) {
        return this.json(res)
      } else {
        return this.octet(res)
      }
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
          const lines = text.split('\n')
          const url = lines[lines.length - 1]
          if(url.startsWith('http') && !debug) {
            setTimeout(() => location.href = url, 2000)
          } else {
            // error or development mode
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