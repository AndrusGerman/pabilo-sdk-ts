# @pabilo/sdk

TypeScript/JavaScript SDK for [pabilo.app](https://pabilo.app) — the Venezuelan payment platform.

- Dual ESM / CommonJS output
- Full TypeScript types with discriminated unions
- Zero runtime dependencies
- Works with Next.js, Node.js, and any modern JS runtime

## Installation

```bash
npm install @pabilo/sdk
# or
pnpm add @pabilo/sdk
# or
yarn add @pabilo/sdk
```

## Quick start

```typescript
import { PabiloClient } from '@pabilo/sdk';

const pabilo = new PabiloClient({ apiKey: 'YOUR_API_KEY' });
```

---

## Bank accounts

### List bank accounts

```typescript
const banks = await pabilo.bankAccounts.list();

for (const bank of banks) {
  console.log(bank.id, bank.provider, bank.description);
  // bank.bank_accounts → BankAccountEntry[]
}
```

### Create a bank account

Each provider has its own typed request shape — TypeScript will enforce the required fields.

**BDV personal (`VE_BAN`)**

```typescript
const bank = await pabilo.bankAccounts.create({
  bankProvider: 'VE_BAN',
  description: 'Mi cuenta BDV',
  userBankPhone: '04241234567',
  userBankDni: '12345678',
  username: 'usuario_portal_bdv',
  password: 'contraseña_portal_bdv',
});

console.log(bank.id); // use this id when creating payment links
```

**BDV empresa (`VE_BAN_EMP_V2`)**

```typescript
const bank = await pabilo.bankAccounts.create({
  bankProvider: 'VE_BAN_EMP_V2',
  description: 'Cuenta empresa BDV',
  userBankPhone: '04241234567',
  userBankDni: '12345678',
  accountNumber: '0102000000000000000',  // account number
  apiKey: 'bdv_api_key_here',
  metadata: [
    { key_name: 'SHOW_DATE_IN_GENERIC_MOVEMENTS', key_value: 'true' },
  ],
});
```

**Test bank (`BANK_TEST`)**

```typescript
const bank = await pabilo.bankAccounts.create({ bankProvider: 'BANK_TEST' });
```

### Delete a bank account

```typescript
await pabilo.bankAccounts.delete(bank.id);
```

---

## Payment links

### Create a payment link

```typescript
const link = await pabilo.paymentLinks.create({
  amount: 4000,
  description: 'Orden #1234',
  userBankId: bank.id,
  // optional
  redirectUrl: 'https://myapp.com/gracias',
  webhookUrl: 'https://myapp.com/webhook/pabilo',
  notificationByWhatsapp: true,
  name: 'Pago por servicio',
  isUsd: false,
});

console.log(link.url);    // https://pabilo.app/pay/...
console.log(link.id);
console.log(link.status); // 'pending' | 'paid' | 'active' | 'expired' | 'cancelled'
```

### Get payment link info

```typescript
const link = await pabilo.paymentLinks.getInfo(linkId);
console.log(link.status, link.amount);
```

### Check if a payment link was paid

```typescript
const paid = await pabilo.paymentLinks.isPaid(linkId);
if (paid) {
  // fulfill the order
}
```

### Update a payment link

```typescript
const updated = await pabilo.paymentLinks.update(linkId, {
  amount: 5000,
  description: 'Orden actualizada',
});
```

---

## Verify a payment by bank reference

Used to confirm that a specific bank transfer exists and matches the expected amount.

```typescript
const result = await pabilo.payments.verify(userBankId, {
  amount: 4000,
  bankReference: '12345678',
  movementType: 'GENERIC', // optional
});

if (result.found) {
  console.log('Payment found!');
  console.log(result.isNew);         // true if first time seen
  console.log(result.data.credit_cost);
  console.log(result.data.user_bank_payment); // full payment object
} else {
  // result.reason → 'BANK_NOT_AVAILABLE' | 'PAYMENT_NOT_FOUND'
  console.log('Not found:', result.reason);
}
```

The result is a **discriminated union** on `found`:

```typescript
type VerifyPaymentResult =
  | { found: false; reason: 'BANK_NOT_AVAILABLE' | 'PAYMENT_NOT_FOUND' }
  | { found: true; isNew: boolean; data: PaymentData };
```

---

## Error handling

SDK methods throw `PabiloError` on API or network failures.

```typescript
import { PabiloClient, PabiloError } from '@pabilo/sdk';

try {
  await pabilo.paymentLinks.create({ ... });
} catch (err) {
  if (err instanceof PabiloError) {
    console.error(err.code);    // 'BAD_REQUEST' | 'UNAUTHORIZED' | 'NOT_FOUND' | ...
    console.error(err.message); // human-readable message from the API
    console.error(err.raw);     // raw API response body
  }
}
```

Common error codes: `BAD_REQUEST`, `UNAUTHORIZED`, `NOT_FOUND`, `USER_BANK_ALREADY_EXISTS`, `INTERNAL_SERVER_ERROR`, `NETWORK_ERROR`.

---

## Custom HTTP client

The SDK accepts an `IHttpClient` implementation for custom fetch behavior (retries, logging, etc.).

```typescript
import { PabiloClient, FetchHttpClient, PabiloHttpClient } from '@pabilo/sdk';

// Default — uses globalThis.fetch
const pabilo = new PabiloClient({ apiKey: 'YOUR_API_KEY' });

// Custom base URL (e.g. for a proxy or staging environment)
const pabilo = new PabiloClient({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://staging.api.pabilo.app',
});

// Bring your own HTTP client
class MyHttpClient extends FetchHttpClient { /* override request() */ }
const pabilo = new PabiloClient({ apiKey: 'YOUR_API_KEY', httpClient: new MyHttpClient() });
```

---

## Next.js usage

```typescript
// lib/pabilo.ts
import { PabiloClient } from '@pabilo/sdk';

export const pabilo = new PabiloClient({
  apiKey: process.env.PABILO_API_KEY!,
});
```

```typescript
// app/api/checkout/route.ts
import { pabilo } from '@/lib/pabilo';

export async function POST(req: Request) {
  const { bankId, amount } = await req.json();

  const link = await pabilo.paymentLinks.create({
    amount,
    description: 'Checkout',
    userBankId: bankId,
    redirectUrl: `${process.env.NEXT_PUBLIC_URL}/gracias`,
    webhookUrl: `${process.env.NEXT_PUBLIC_URL}/api/webhook/pabilo`,
  });

  return Response.json({ url: link.url, id: link.id });
}
```

---

## Types reference

```typescript
import type {
  UserBank,
  BankAccountEntry,
  PaymentLink,
  PaymentLinkStatus,   // 'pending' | 'paid' | 'active' | 'expired' | 'cancelled'
  PaymentLinkType,     // 'default' | 'fixed'
  VerifyPaymentResult,
  PaymentData,
  UserBankPayment,
  CreateUserBankRequest,
  CreateVeBanRequest,
  CreateVeBanEmpV2Request,
  CreateBankTestRequest,
  PabiloErrorCode,
} from '@pabilo/sdk';
```

---

## License

MIT
