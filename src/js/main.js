import 'whatwg-fetch'
import 'promise-polyfill'
import 'font-awesome/css/font-awesome.css'
import '../css/main.css'

let path = location.pathname
if(path === '/') path = '/index'
import(`.${path}`)
  .catch(err => console.error.bind(console))
