const { HOST, PORT } = process.env
const { owner, repo } = new (require('../apiDelegate'))

module.exports = async (ctx, next) => {
  Object.assign(ctx.state, {
    host: `//${HOST}:${PORT}`,
    owner, repo
  })
  await next()
}
