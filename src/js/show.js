import Vue from 'vue'
import qs from 'querystring'

new Vue({
  el: '#branches',
  data: {
    branches: [],
    commits: [],
    displayAll: true,
    owner: null,
    repo: null,
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
    const { owner, repo } = qs.parse(location.search.substr(1))
    this.owner = owner
    this.repo = repo
    fetch(`/branch${location.search}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(res => {
        this.branches = res
        if(res.length > 0) {
          this.branch = res[0].name
        }
      })
  },
  methods: {
    previewURL(name, id) {
      return `/preview?repo=${this.repo}&owner=${this.owner}&branch=${name}&commit_id=${id.substr(0, 6)}`
    },
    getCommits() {
      this.commits = []
      const query = qs.parse(location.search.substr(1))
      query.branch = this.branch
      this.promise = fetch(`/commit?${qs.stringify(query)}`, {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(res => {
          this.commits = res
          this.promise = null
        })
    }
  }
})