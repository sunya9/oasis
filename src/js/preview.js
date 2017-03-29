import Vue from 'vue'
import qs from 'querystring'

const debug = process.env.NODE_ENV !== 'production'

new Vue({
  el: '#preview',
  data: {
    output: 'Building images...',
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
      body: JSON.stringify(body),
      credentials: 'include'
    }).then(res => {
      this.output = ''
      const reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8')
      const processResult = result => {
        if(result.done) {
          this.scroll()
          setTimeout(() => {
            location.href = debug
              ? `http://${body.owner}.${body.repo}.${body.branch}.${body.commit_id}.127.0.0.1.xip.io`
              : ''
          }, 3000)
          return 
        }
        const text = decoder.decode(result.value)
        this.output += text
        this.$nextTick(this.scroll)
        reader.read().then(processResult)
      }
      reader.read().then(processResult)
    })
  },
  methods: {
    scroll() {
      this.outputEl.scrollTop = this.outputEl.scrollHeight
    }
  }
})