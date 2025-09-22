import { Env } from './types'

export class Logger {
  private static readonly prefix = '[vLeap Relay]'

  static error(message: string, data?: any): void {
    console.error(`${this.prefix} ${message}`, data || '')
  }

  static debug(message: string, data?: any, env?: Env): void {
    if (env === 'devnet') {
      console.log(`${this.prefix} [DEBUG] ${message}`, data || '')
    }
  }
}
