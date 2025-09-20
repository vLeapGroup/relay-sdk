import { DevnetEntrypoint, MainnetEntrypoint, TestnetEntrypoint } from '@multiversx/sdk-core/out'
import { Env } from './types'

export const getEntrypoint = (env: Env) => {
  const clientName = 'relay-sdk'
  const kind = 'api'
  if (env === 'devnet') return new DevnetEntrypoint({ kind, clientName })
  if (env === 'testnet') return new TestnetEntrypoint({ kind, clientName })
  return new MainnetEntrypoint({ kind, clientName })
}
