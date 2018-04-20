import * as Koa from 'koa'
import * as route from 'koa-route'

export default async (ctx: Koa.Context) =>  {
  await ctx.render('index')
}
