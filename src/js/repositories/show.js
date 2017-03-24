import Vue from 'vue'

new Vue({
  el: '#branches',
  data: {
    branches: window.__branches__,
    displayAll: false
  },
  computed: {
    showBranches() {
      return this.displayAll
        ? this.branches
        : this.branches.filter(branch => branch.docker.exist)
    }
  }
})