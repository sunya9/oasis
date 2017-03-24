// import 'font-awesome-webpack!../../font-awesome.config.js'
// import 'font-awesome-webpack'
import '../css/main.css'
import 'font-awesome/css/font-awesome.css'

const { pathname } = location
let path = pathname
if(path === '/') path = '/index'
if(path[path.length -1] === '/')
  path = path.substr(0, path.length -1)

const whitelist = [
  '/repositories'
]
const { __resource__ : resource } = window

let idx = -1
// FIXME
for(let i = 0; whitelist.length > i; i++) {
  idx = path.indexOf(whitelist[i])
}
if(idx >= 0) {
  path = whitelist[idx]
  import(`.${path}/${resource}`).catch(err => console.error.bind(console))
}
