import { Transaction } from '@multiversx/sdk-core/out'
import { Config } from './config'

export type RelayerConfig = {
  endpoint?: string
  timeout?: number
  retries?: number
}

export class TransactionRelayer {
  private config: RelayerConfig

  constructor(config: RelayerConfig = {}) {
    this.config = {
      endpoint: Config.Urls.Api,
      timeout: 5000,
      retries: 3,
      ...config,
    }
  }

  async relay(tx: Transaction): Promise<Transaction> {
    try {
      throw new Error('Not implemented')
    } catch (error) {
      throw new Error(`Relay failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async makeRequest(data: any): Promise<any> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(this.config.endpoint!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  getConfig(): RelayerConfig {
    return { ...this.config }
  }
}
