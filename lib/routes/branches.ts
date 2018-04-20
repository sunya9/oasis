import * as Koa from 'koa'
import ApiDelegate from '../apiDelegate'

export default async (ctx: Koa.Context) => {
  try {
    ctx.body = await new ApiDelegate().provider.getBranches()
  } catch (e) {
    ctx.status = 500
    ctx.body = []
  }
}
