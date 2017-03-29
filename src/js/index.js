import Vue from 'vue'

new Vue({
  el: '#repos',
  data: {
    repos: window.__repos__,
    filterText: ''
  },
  computed: {
    filterRepos() {
      if(!this.filterText) return this.repos
      return this.repos.filter(repository => {
        return repository.full_name.indexOf(this.filterText) >= 0
      })
    }
  }
})