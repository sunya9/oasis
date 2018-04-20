export default class Commit {
  message?: string
  sha: string
  constructor({ message, sha }: { message?: string; sha: string }) {
    this.message = message
    this.sha = sha
  }

  get shortSha(): string {
    return this.sha.substr(0, 7)
  }
}
