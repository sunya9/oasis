import * as path from 'path'
import * as dotenv from 'dotenv'
import { path as rootPath } from 'app-root-path'

dotenv.config({ path: path.join(rootPath, '.env') })

const envDefaults: { [key: string]: string } = {
  HOST: 'localhost',
  PORT: '5123'
}

Object.keys(envDefaults).forEach(key => {
  if (process.env[key]) return
  process.env[key] = envDefaults[key]
})

export default { ...process.env }
