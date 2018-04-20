import * as Github from '@octokit/rest'

import { Provider } from './index'
import Commit from '../commit'
import Branch from '../branch'

export default class GithubProvider implements Provider {
  private repo: string
  private owner: string
  private api: Github
  constructor({
    owner,
    repo,
    token
  }: {
    owner: string
    repo: string
    token: string
  }) {
    this.owner = owner
    this.repo = repo
    this.api = new Github()
    this.api.authenticate({
      type: 'token',
      token
    })
  }

  async getBranches(): Promise<Branch[]> {
    const { data }: { data: any[] } = await this.api.repos.getBranches({
      owner: this.owner,
      repo: this.repo
    })
    return data.map(branch => new Branch(branch.name))
  }
  async getCommits(sha: string): Promise<Commit[]> {
    const { data }: { data: any[] } = await this.api.repos.getCommits({
      owner: this.owner,
      repo: this.repo,
      sha
    })
    return data.map(
      (commit: any) =>
        new Commit({
          message: commit.commit.message,
          sha: commit.sha
        })
    )
  }
  getRepoURL(): string {
    return `https://github.com/${this.owner}/${this.repo}.git`
  }
}
