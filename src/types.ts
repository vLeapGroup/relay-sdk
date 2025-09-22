export type Env = 'mainnet' | 'testnet' | 'devnet'

export type RelayChain = 'multiversx'

export type ErrorType = 'rate-limited' | 'balance-required' | 'whitelist-required' | 'unknown'

export type Handlers = {
  onError?: (type: ErrorType, message: string) => void
}

export type ProjectId = number

export type RelayerConfig = {
  project: ProjectId
  chain?: RelayChain
  env?: Env
  api?: string
  timeout?: number
  force?: boolean
}

export type RelayableTxRequest = {
  chain: RelayChain
  project: ProjectId
  tx: object
}

export type RelayableTxResponse = {
  chain: RelayChain
  project: ProjectId
  tx: object
}

export type RelayableBatchRequest = {
  chain: RelayChain
  project: ProjectId
  batch: object[]
}

export type RelayableBatchResponse = {
  chain: RelayChain
  project: ProjectId
  batch: object[]
}

export type ErrorResponse = {
  error: ErrorType
  message: string
}

export type Result<T> = {
  res: T | null
  error: ErrorType | null
  message: string | null
}
