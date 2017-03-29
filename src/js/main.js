import 'whatwg-fetch'
import 'promise-polyfill'
import '../css/main.css'
import 'font-awesome/css/font-awesome.css'

let path = location.pathname
if(path === '/') path = '/index'
import(`.${path}`)
  .catch(err => console.error.bind(console))
