import { AccountOnNetwork, IPlainTransactionObject, Transaction } from '@multiversx/sdk-core/out'
import { Config } from './config'
import { getEntrypoint } from './helpers'
import {
  ErrorType,
  Handlers,
  RelayableBatchRequest,
  RelayableBatchResponse,
  RelayableTxRequest,
  RelayableTxResponse,
  RelayerConfig,
} from './types'

export class RelayClient {
  constructor(public readonly config: RelayerConfig) {
    this.config = {
      chain: 'multiversx',
      env: 'mainnet',
      api: Config.Urls.Api,
      timeout: 5000,
      force: false,
      ...config,
    }
  }

  async relay(tx: Transaction, handlers?: Handlers): Promise<Transaction> {
    const entrypoint = getEntrypoint(this.config.env ?? 'mainnet')
    const account = await entrypoint.createNetworkProvider().getAccount(tx.sender)
    tx.nonce = account.nonce

    if (this.hasEnoughBalance(account) && !this.config.force) {
      return tx
    }

    try {
      const relayable = await this.makeRequest<RelayableTxRequest, RelayableTxResponse>('relay/transaction', {
        chain: this.config.chain!,
        projectId: this.config.projectId,
        tx: tx.toPlainObject(),
      })

      return Transaction.newFromPlainObject(relayable.tx as IPlainTransactionObject)
    } catch (error) {
      const errorType = this.getErrorType(error)
      handlers?.onError?.(errorType)
      console.warn('Relay failed:', error)
      return tx
    }
  }

  async relayOrFail(tx: Transaction, handlers?: Handlers): Promise<Transaction> {
    const result = await this.relay(tx, handlers)
    if (!result) throw new Error('Relay failed')
    return result
  }

  async relayBatch(txs: Transaction[], handlers?: Handlers): Promise<Transaction[]> {
    const entrypoint = getEntrypoint(this.config.env ?? 'mainnet')
    const accounts = await Promise.all(txs.map((tx) => entrypoint.createNetworkProvider().getAccount(tx.sender)))
    txs.forEach((tx, index) => (tx.nonce = accounts[index].nonce))

    if (accounts.every((account) => this.hasEnoughBalance(account)) && !this.config.force) {
      return txs
    }

    try {
      const relayable = await this.makeRequest<RelayableBatchRequest, RelayableBatchResponse>('relay/batch', {
        chain: this.config.chain!,
        projectId: this.config.projectId,
        batch: txs.map((tx) => tx.toPlainObject()),
      })

      return relayable.batch.map((tx) => Transaction.newFromPlainObject(tx as IPlainTransactionObject))
    } catch (error) {
      const errorType = this.getErrorType(error)
      handlers?.onError?.(errorType)
      console.warn('Relay batch failed:', error)
      return txs
    }
  }

  async relayBatchOrFail(txs: Transaction[], handlers?: Handlers): Promise<Transaction[]> {
    const result = await this.relayBatch(txs, handlers)
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

  private getErrorType(error: unknown): ErrorType {
    if (error instanceof Error) {
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        return 'rate-limited'
      }
      if (error.message.includes('insufficient') || error.message.includes('balance')) {
        return 'insufficient-balance'
      }
    }
    return 'unknown'
  }
}
