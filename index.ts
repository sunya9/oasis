import * as path from 'path'
import * as fs from 'fs-extra'
import * as Koa from 'koa'
import { path as rootPath } from 'app-root-path'

import app from './lib/app'
import env from './lib/env'

async function main() {
  // create repos dir
  await fs.ensureDir(path.join(rootPath, 'repos'))

  if (!module.parent) {
    const { HOST, PORT } = env
    app.listen(+PORT, () => {
      console.log(`listening on http://${HOST}:${PORT}`) // eslint-disable-line
    })
  }
}

main()

export default app
