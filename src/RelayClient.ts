import { AccountOnNetwork, IPlainTransactionObject, Transaction } from '@multiversx/sdk-core/out'
import { Config } from './config'
import { getEntrypoint } from './helpers'
import { Logger } from './Logger'
import {
  ErrorResponse,
  Handlers,
  RelayableBatchRequest,
  RelayableBatchResponse,
  RelayableTxRequest,
  RelayableTxResponse,
  RelayerConfig,
  Result,
} from './types'

export class RelayClient {
  constructor(public readonly config: RelayerConfig) {
    this.config = {
      chain: Config.Defaults.Chain,
      env: Config.Defaults.Env,
      api: Config.Urls.Api(config.env ?? Config.Defaults.Env),
      timeout: 5000,
      force: false,
      ...config,
    }
  }

  async relay(tx: Transaction, handlers?: Handlers): Promise<Transaction> {
    const entrypoint = getEntrypoint(this.config.env!)
    const account = await entrypoint.createNetworkProvider().getAccount(tx.sender)
    tx.nonce = account.nonce

    if (this.hasEnoughBalance(account) && !this.config.force) {
      return tx
    }

    const result = await this.makeRequest<RelayableTxRequest, RelayableTxResponse>('relay/transaction', {
      chain: this.config.chain!,
      project: this.config.project,
      tx: tx.toPlainObject(),
    })

    if (result.error) {
      handlers?.onError?.(result.error, result.message!)
      Logger.error('Relay failed', { error: result.error, message: result.message })
      return tx
    }

    return Transaction.newFromPlainObject(result.res!.tx as IPlainTransactionObject)
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

    const result = await this.makeRequest<RelayableBatchRequest, RelayableBatchResponse>('relay/batch', {
      chain: this.config.chain!,
      project: this.config.project,
      batch: txs.map((tx) => tx.toPlainObject()),
    })

    if (result.error) {
      handlers?.onError?.(result.error, result.message!)
      Logger.error('Relay batch failed', { error: result.error, message: result.message })
      return txs
    }

    return result.res!.batch.map((tx) => Transaction.newFromPlainObject(tx as IPlainTransactionObject))
  }

  async relayBatchOrFail(txs: Transaction[], handlers?: Handlers): Promise<Transaction[]> {
    const result = await this.relayBatch(txs, handlers)
    if (!result) throw new Error('Relay failed')
    return result
  }

  private async makeRequest<Req, Res>(path: string, data: Req): Promise<Result<Res>> {
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
      const json = await response.json()

      if (!response.ok) {
        if (json && typeof json === 'object' && 'error' in json) {
          const errorResponse = json as ErrorResponse
          Logger.error('API returned error', {
            error: errorResponse.error,
            message: errorResponse.message,
            status: response.status,
            statusText: response.statusText,
            url: `${this.config.api}/${sanitizedPath}`,
          })
          return { res: null, error: errorResponse.error, message: errorResponse.message }
        } else {
          Logger.error('HTTP request failed with no error details', {
            status: response.status,
            statusText: response.statusText,
            url: `${this.config.api}/${sanitizedPath}`,
          })
          return { res: null, error: 'unknown', message: `HTTP error! status: ${response.status}` }
        }
      }

      return { res: json as Res, error: null, message: null }
    } catch (error) {
      clearTimeout(timeoutId)
      Logger.error('Network or request failed', {
        error: error instanceof Error ? error.message : String(error),
        url: `${this.config.api}/${sanitizedPath}`,
      })
      return { res: null, error: 'unknown', message: 'Network or server error occurred' }
    }
  }

  private hasEnoughBalance(account: AccountOnNetwork): boolean {
    const balanceTreshold = BigInt(Config.Account.MaxBalance * 10 ** Config.Egld.Decimals)
    return account.balance >= balanceTreshold
  }
}
