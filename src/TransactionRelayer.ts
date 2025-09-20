import { AccountOnNetwork, IPlainTransactionObject, Transaction } from '@multiversx/sdk-core/out'
import { Config } from './config'
import { getEntrypoint } from './helpers'
import { RelayableBatchRequest, RelayableBatchResponse, RelayableTxRequest, RelayableTxResponse, RelayerConfig } from './types'

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
    const account = await entrypoint.createNetworkProvider().getAccount(tx.sender)
    tx.nonce = account.nonce

    if (this.hasEnoughBalance(account)) {
      return tx
    }

    try {
      const relayable = await this.makeRequest<RelayableTxRequest, RelayableTxResponse>('relay/transaction', {
        tx: tx.toPlainObject(),
      })

      return Transaction.newFromPlainObject(relayable.tx as IPlainTransactionObject)
    } catch (error) {
      console.warn('Relay failed:', error)
      return tx
    }
  }

  async relayOrFail(tx: Transaction): Promise<Transaction> {
    const result = await this.relay(tx)
    if (!result) throw new Error('Relay failed')
    return result
  }

  async relayBatch(txs: Transaction[]): Promise<Transaction[]> {
    const entrypoint = getEntrypoint(this.config.env ?? 'mainnet')
    const accounts = await Promise.all(txs.map((tx) => entrypoint.createNetworkProvider().getAccount(tx.sender)))
    txs.forEach((tx, index) => (tx.nonce = accounts[index].nonce))

    if (accounts.every((account) => this.hasEnoughBalance(account))) {
      return txs
    }

    const relayable = await this.makeRequest<RelayableBatchRequest, RelayableBatchResponse>('relay/batch', {
      batch: txs.map((tx) => tx.toPlainObject()),
    })

    return relayable.batch.map((tx) => Transaction.newFromPlainObject(tx as IPlainTransactionObject))
  }

  async relayBatchOrFail(txs: Transaction[]): Promise<Transaction[]> {
    const result = await this.relayBatch(txs)
    if (!result) throw new Error('Relay failed')
    return result
  }

  private async makeRequest<Req, Res>(path: string, data: Req): Promise<Res> {
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

      return json as Res
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  private hasEnoughBalance(account: AccountOnNetwork): boolean {
    const balanceTreshold = BigInt(Config.Account.MaxBalance * 10 ** Config.Egld.Decimals)
    return account.balance >= balanceTreshold
  }
}
