import * as Koa from 'koa'
import env from '../env'
import apiDelegate from '../apiDelegate'

const delegate: apiDelegate = new apiDelegate()

const { owner, repo } = delegate
const { HOST, PORT } = env

export default async (
  ctx: Koa.Context,
  next: () => Promise<any>
): Promise<any> => {
  ctx.state = {
    ...ctx.state,
    host: `//${HOST}:${PORT}`,
    owner,
    repo
  }
  return await next()
}
