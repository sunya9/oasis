import containerManager from '../containerManager'
import { Context } from 'koa'

export default async (ctx: Context) => {
  const {
    query: { id },
    host,
    protocol
  } = ctx
  if (!id) return ctx.redirect('/')
  const status = await containerManager.status(id)
  if (status) {
    // exist container
    try {
      const { container } = await containerManager.get(id)
      if (status !== 'exited') await container.stop()
      await container.remove()
      containerManager.del(id)
    } catch (e) {
      await ctx.render('error', {
        messages: [e.message]
      })
    }
  }
  await ctx.redirect(`${protocol}://${id}.${host}`)
}
