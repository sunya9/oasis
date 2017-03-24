const { name: title } = require('../package')

exports.title = name => {
  if(name) return `${name} - ${title}`
  return title
}