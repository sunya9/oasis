import Vue from 'vue'

new Vue({
  el: '#branches',
  data: {
    branches: window.__branches__,
    displayAll: false,
    owner: window.__owner__,
    repo: window.__repo__
  },
  computed: {
    showBranches() {
      return this.displayAll
        ? this.branches
        : this.branches.filter(branch => branch.docker.exist)
    }
  },
  methods: {
    previewURL(name, id) {
      return `/preview?repo=${this.repo}&owner=${this.owner}&branch=${name}&commit_id=${id.substr(0, 6)}`
    }
  }
})