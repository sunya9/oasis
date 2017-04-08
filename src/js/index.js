import Vue from 'vue'
import qs from 'querystring'

new Vue({
  el: '#index',
  data: {
    branches: [],
    commits: [],
    displayAll: true,
    branch: '',
    promise: null
  },
  computed: {
    showCommits() {
      return this.displayAll
        ? this.commits
        : this.commits.filter(commit => commit.docker.exist)
    }
  },
  watch: {
    branch() {
      this.getCommits()
    }
  },
  mounted() {
    fetch('/branches')
      .then(res => res.json())
      .then(res => {
        this.branches = res
        if(res.length > 0) {
          this.branch = res[0].name
        }
      })
  },
  methods: {
    previewURL(id) {
      return `${location.protocol}//${id.substr(0, 7)}.${location.host}`
    },
    getCommits() {
      this.commits = []
      const query = qs.parse(location.search.substr(1))
      query.branch = this.branch
      this.promise = fetch(`/commits?branch=${this.branch}`)
        .then(res => res.json())
        .then(res => {
          this.commits = res
          this.promise = null
        })
    }
  }
})
