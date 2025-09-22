export type Env = 'mainnet' | 'testnet' | 'devnet'

export type RelayChain = 'multiversx'

export type ErrorType = 'rate-limited' | 'balance-required' | 'whitelist-required' | 'unknown'

export type Handlers = {
  onError?: (type: ErrorType) => void
}

export type ProjectId = number

export type RelayerConfig = {
  projectId: ProjectId
  chain?: RelayChain
  env?: Env
  api?: string
  timeout?: number
  force?: boolean
}

export type RelayableTxRequest = {
  chain: RelayChain
  projectId: ProjectId
  tx: object
}

export type RelayableTxResponse = {
  chain: RelayChain
  projectId: ProjectId
  tx: object
}

export type RelayableBatchRequest = {
  chain: RelayChain
  projectId: ProjectId
  batch: object[]
}

export type RelayableBatchResponse = {
  chain: RelayChain
  projectId: ProjectId
  batch: object[]
}

export type ErrorResponse = {
  error: ErrorType
}

export type Result<T> = {
  res: T | null
  error: ErrorType | null
}
