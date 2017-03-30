import Vue from 'vue'
import moment from 'moment'

(() => {
  if(!document.getElementById('repos')) return
  new Vue({
    el: '#repos',
    data: {
      filterText: '',
      page: 1,
      end: false,
      repos: [],
      promise: null
    },
    computed: {
      filterRepos() {
        if(!this.filterText) return this.repos
        return this.repos.filter(repository => {
          return repository.full_name.indexOf(this.filterText) >= 0
        })
      }
    },
    mounted() {
      window.addEventListener('scroll', () => {
        const { body } = document
        if ((body.scrollTop + window.innerHeight) >= body.scrollHeight) {
          if(!this.promise && !this.end)
            this.get()
        }
      })
      this.get()
    },
    methods: {
      get() {
        const headers = new Headers()
        headers.append('Content-Type', 'application/json')
        return this.promise = fetch(`/?page=${this.page++}`, {
          headers,
          credentials: 'include'
        })
          .then(res => res.json())
          .then(res => {
            this.repos = this.repos.concat(res.data)
            this.end = !res.has_next
            this.promise = null
          })
      },
      relative(date) {
        return moment(date).fromNow()
      },
      absolute(date) {
        return moment(date).format('YYYY/MM/DD hh:mm:ss')
      }
    }
  })
})()