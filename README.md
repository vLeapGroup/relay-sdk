# Relay SDK

A simple TypeScript SDK with a Relayer class for making HTTP requests.

## Installation

```bash
npm install
```

## Usage

```typescript
import { Relayer } from 'relay-sdk'

// Create a new relayer instance
const relayer = new Relayer({
  endpoint: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
})

// Relay data
try {
  const result = await relayer.relay({ message: 'Hello World' })
  console.log(result)
} catch (error) {
  console.error('Relay failed:', error)
}

// Update configuration
relayer.updateConfig({ timeout: 10000 })

// Get current configuration
const config = relayer.getConfig()
```

## API

### Relayer

The main class for relaying data to an endpoint.

#### Constructor

```typescript
new Relayer(config?: RelayerConfig)
```

#### Methods

- `relay(data: any): Promise<any>` - Relays data to the configured endpoint
- `getConfig(): RelayerConfig` - Returns the current configuration
- `updateConfig(newConfig: Partial<RelayerConfig>): void` - Updates the configuration

#### Configuration

```typescript
interface RelayerConfig {
  endpoint?: string // Default: 'https://api.relay.com'
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
