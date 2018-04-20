import Branch from './branch'
import Commit from './commit'
import github from './providers/github'
import { Provider } from './providers/index'
import env from './env'

export default class ApiDelegate {
  private delegate: Provider
  private static PROVIDERS: any = {
    github
  }
  constructor() {
    this.delegate = new this.Provider({
      owner: this.owner,
      repo: this.repo,
      token: this.token
    })
  }

  get provider(): Provider {
    return this.delegate
  }

  get providerName(): string {
    const { PROVIDER } = env
    if (!PROVIDER) throw new Error('Require PROVIDER environment variable.')
    return PROVIDER.toLowerCase()
  }

  get Provider(): any & Provider {
    const Provider: Provider = ApiDelegate.PROVIDERS[this.providerName]
    if (!Provider)
      throw new Error(`Choose PROVIDER: ${Object.keys(ApiDelegate.PROVIDERS)}`)
    return Provider
  }

  get fullRepo(): string {
    const { REPO } = env
    if (!REPO) throw new Error('Require REPO environment variable.')
    if (REPO.indexOf('/') <= 0)
      throw new Error(
        'REPO environment variable should have split with "/"(e.g. owner/repo).'
      )
    return REPO
  }

  get owner(): string {
    return this.fullRepo.split('/')[0]
  }

  get repo(): string {
    return this.fullRepo.split('/')[1]
  }

  get token(): string {
    const { PROVIDER_TOKEN } = env
    // if(!token)
    //   throw new Error('Require PROVIDER_TOKEN environment variable.')
    return PROVIDER_TOKEN
  }
}
