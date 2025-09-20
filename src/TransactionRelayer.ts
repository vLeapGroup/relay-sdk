import { IPlainTransactionObject, Transaction } from '@multiversx/sdk-core/out'
import { Config } from './config'
import { getEntrypoint } from './helpers'
import { Relayable, RelayerConfig } from './types'

export class TransactionRelayer {
  constructor(public readonly config: RelayerConfig = {}) {
    this.config = {
      env: 'mainnet',
      api: Config.Urls.Api,
      timeout: 5000,
      ...config,
    }
  }

  async relay(tx: Transaction): Promise<Transaction> {
    const entrypoint = getEntrypoint(this.config.env ?? 'mainnet')

    if (tx.nonce === 0n) {
      tx.nonce = await entrypoint.recallAccountNonce(tx.sender)
    }

    try {
      const relayable = await this.makeRequest<Relayable>('relay/transaction', {
        tx: tx.toPlainObject(),
      })

      return Transaction.newFromPlainObject(relayable.tx as IPlainTransactionObject)
    } catch (error) {
      throw new Error(`Relay failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async relayOrFail(tx: Transaction): Promise<Transaction> {
    const result = await this.relay(tx)
    if (!result) throw new Error('Relay failed')
    return result
  }

  private async makeRequest<T>(path: string, data: any): Promise<T> {
    if (!this.config.api) throw new Error('Endpoint is not set')
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)
    const sanitizedPath = path.replace(/^\/+/, '')

    try {
      const response = await fetch(`${this.config.api}/${sanitizedPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const json = await response.json()

      return json as T
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }
}
