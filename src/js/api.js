import 'whatwg-fetch'

export default {
  getRepositories() {
    return fetch('/repositories/', {
      credentials: 'include'
    }).then(res => res.json())
  }
}