import * as httpProxy from 'http-proxy'
import { Context } from 'koa'

import preview from '../routes/preview'
import containerManager from '../containerManager'
import ContainerInfo from '../containerInfo'

const proxy: httpProxy = httpProxy.createProxyServer()

export default async (ctx: Context, next: () => Promise<any>) => {
  const {
    method,
    req,
    res,
    subdomains: [id]
  } = ctx
  if (id) {
    const info: ContainerInfo = containerManager.get(id)
    if (info && info.host) {
      // there is already created container
      const { host: target }: { host: string } = info
      req.headers.host = target
      try {
        await new Promise((resolve, reject) => {
          proxy.web(req, res, { target }, e => (e ? reject(e) : resolve()))
        })
      } catch (e) {
        await ctx.render('error', {
          messages: [
            e.message,
            "Your project's server might not have listened a port."
          ],
          id
        })
      }
    } else {
      // show preview page
      if (method === 'GET') {
        await preview.GET(ctx)
      } else if (method === 'POST') {
        await preview.POST(ctx)
      }
    }
  } else {
    await next()
  }
}
