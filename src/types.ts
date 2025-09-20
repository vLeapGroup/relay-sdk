export type Env = 'mainnet' | 'testnet' | 'devnet'

export type RelayerConfig = {
  env?: Env
  api?: string
  timeout?: number
}

export type RelayableTxRequest = {
  tx: object
}

export type RelayableTxResponse = {
  tx: object
}

export type RelayableBatchRequest = {
  batch: object[]
}

export type RelayableBatchResponse = {
  batch: object[]
}
