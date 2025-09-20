export type Env = 'mainnet' | 'testnet' | 'devnet'

export type RelayerConfig = {
  env?: Env
  api?: string
  timeout?: number
}

export type Relayable = {
  relayerAddress: string
  relayerSignature: string
}
