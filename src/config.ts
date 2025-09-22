import { Env, RelayChain } from './types'

export const Config = {
  Defaults: {
    Chain: 'multiversx' as RelayChain,
    Env: 'mainnet' as Env,
  },

  Urls: {
    Api: (env: Env) => {
      if (env === 'devnet') return 'https://devnet-relay.vleap.ai'
      if (env === 'testnet') throw new Error('Testnet is not supported yet')
      return 'https://relay.vleap.ai'
    },
  },

  Account: {
    MaxBalance: 0.025,
  },

  Egld: {
    Decimals: 18,
  },
}
