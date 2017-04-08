const { HOST, PORT } = process.env

module.exports = async (ctx, next) => {
  Object.assign(ctx.state, {
    host: `//${HOST}:${PORT}`
  })
  await next()
}
