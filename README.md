# Relay SDK

**Enable gasless transactions on MultiversX with just one line of code change.**

```bash
npm install @vleap/relay
```

**Before:**

```typescript
const result = await wallet.sendTransaction(transaction)
```

**After:**

```typescript
const relayableTx = await new RelayClient({ project: 'your-project-id' }).relay(transaction)
const result = await wallet.sendTransaction(relayableTx)
```

That's it! Your users now pay zero gas fees when they have a fresh wallet or low balance.

## Examples

```typescript
import { RelayClient } from '@vleap/relay'

// Single transaction
const relayedTx = await new RelayClient({ project: 'your-project-id' }).relay(transaction)

// Batch transactions
const relayedTxs = await new RelayClient({ project: 'your-project-id' }).relayBatch(transactions)
```

## Support

- **GitHub**: [vLeap Group](https://github.com/vLeapGroup)
- **Telegram**: [https://telegram.vleap.ai](https://telegram.vleap.ai)
