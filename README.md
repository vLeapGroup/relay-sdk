# Relay SDK

A TypeScript SDK for relaying MultiversX transactions via the vLeap Relay service.

## Installation

```bash
npm install @vleap/relay
```

Or with yarn:

```bash
yarn add @vleap/relay
```

Or with pnpm:

```bash
pnpm add @vleap/relay
```

## Usage

```typescript
import { TransactionRelayer } from '@vleap/relay'
import { Transaction } from '@multiversx/sdk-core'

// Create a new transaction relayer instance
const relayer = new TransactionRelayer({
  endpoint: 'https://relay.vleap.ai', // Optional: defaults to vLeap relay endpoint
  timeout: 5000, // Optional: request timeout in ms
  retries: 3, // Optional: number of retry attempts
})

// Relay a MultiversX transaction
try {
  const transaction = new Transaction() // Your MultiversX transaction
  const result = await relayer.relay(transaction)
  console.log('Transaction relayed successfully:', result)
} catch (error) {
  console.error('Relay failed:', error)
}

// Get current configuration
const config = relayer.getConfig()
console.log('Current config:', config)
```

## API

### TransactionRelayer

The main class for relaying MultiversX transactions via the vLeap Relay.

#### Constructor

```typescript
new TransactionRelayer(config?: RelayerConfig)
```

#### Methods

- `relay(tx: Transaction): Promise<Transaction>` - Relays a MultiversX transaction to the configured endpoint
- `getConfig(): RelayerConfig` - Returns the current configuration

#### Configuration

```typescript
interface RelayerConfig {
  endpoint?: string // Default: 'https://relay.vleap.ai'
  timeout?: number // Default: 5000ms
  retries?: number // Default: 3
}
```

## Development

```bash
# Install dependencies
npm install

# Build the SDK
npm run build

# Watch mode for development
npm run dev

# Clean build artifacts
npm run clean
```
