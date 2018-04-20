import GitHub from './github'

import Branch from '../branch'
import Commit from '../commit'

export interface Provider {
  getBranches(): Promise<Branch[]>
  getCommits(sha: string): Promise<Commit[]>
  getRepoURL(): string
}

export default {
  GitHub
}
