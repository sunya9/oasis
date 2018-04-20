import * as through from 'through'
import { MessageType, Message, BuildLog, BuildStatus } from '../build'

export default class OutputJSON {
  private _through: through.ThroughStream = through()
  write({ status, message }: BuildLog) {
    return this.through.write(
      JSON.stringify({ complete: false, message }) + '\n'
    )
  }

  get through(): through.ThroughStream {
    return this._through
  }

  end(buildLog?: BuildLog) {
    const chunk = buildLog
      ? JSON.stringify({ complete: true, message: buildLog.message })
      : null
    return this.through.end(chunk)
  }
}
