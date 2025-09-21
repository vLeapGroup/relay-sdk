export type Env = 'mainnet' | 'testnet' | 'devnet'

export type RelayChain = 'multiversx'

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
