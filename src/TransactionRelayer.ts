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
    try {
      const relayable = await this.makeRequest<Relayable>({
        tx: tx.toPlainObject(),
      })

      tx.relayer = Address.newFromBech32(relayable.relayerAddress)
      tx.relayerSignature = Uint8Array.from(Buffer.from(relayable.relayerSignature, 'hex'))

      return tx
    } catch (error) {
      throw new Error(`Relay failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async makeRequest<T>(data: any): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

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
      console.log('Response relayable:', json)

      return json as T
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }
}
