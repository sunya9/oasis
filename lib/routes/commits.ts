import * as Koa from 'koa'
import ApiDelegate from '../apiDelegate'

export default async (ctx: Koa.Context) => {
  const {
    query: { branch }
  }: { query: { branch?: string } } = ctx
  try {
    if (branch) {
      ctx.body = await new ApiDelegate().provider.getCommits(branch)
    } else {
      throw new Error('Require branch query param')
    }
  } catch (e) {
    ctx.status = 500
    ctx.body = []
  }
}
