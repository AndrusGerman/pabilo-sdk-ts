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
```

## Quick start

```typescript
import { PabiloClient } from '@pabilo/sdk';

const pabilo = new PabiloClient({ apiKey: 'YOUR_API_KEY' });
```

The client exposes four namespaces:

| Namespace | Description |
|---|---|
| `pabilo.me` | Current user and plan info |
| `pabilo.bankAccounts` | Manage connected bank accounts |
| `pabilo.paymentLinks` | Create and manage payment links |
| `pabilo.payments` | Verify payments by bank reference |

---

## `pabilo.me`

### `me.getMe(): Promise<User>`

Returns the authenticated user's profile.

```typescript
const user = await pabilo.me.getMe();

console.log(user.id);    // string
console.log(user.email); // string | undefined
console.log(user.name);  // string | undefined
```

**Returns:** `User`

```typescript
interface User {
  id: string;
  email?: string;
  name?: string;
}
```

---

### `me.getPlan(): Promise<Plan>`

Returns the current subscription plan for the authenticated account.

```typescript
const plan = await pabilo.me.getPlan();

console.log(plan.name);     // e.g. 'basic', 'pro'
console.log(plan.planType); // string | undefined
```

**Returns:** `Plan`

```typescript
interface Plan {
  name: string;
  planType?: string;
}
```

---

## `pabilo.bankAccounts`

### `bankAccounts.list(): Promise<UserBank[]>`

Returns all bank accounts connected to the authenticated user.

```typescript
const banks = await pabilo.bankAccounts.list();

for (const bank of banks) {
  console.log(bank.id);          // MongoDB ObjectId string
  console.log(bank.provider);    // 'VE_BAN' | 'VE_BAN_EMP_V2' | 'BANK_TEST' | ...
  console.log(bank.description); // display name set during creation
  console.log(bank.bank_accounts); // BankAccountEntry[]
  console.log(bank.to_trash);    // boolean — true if soft-deleted
}
```

**Returns:** `UserBank[]`

```typescript
interface UserBank {
  id: string;
  description: string;
  provider: string;
  bank_accounts: BankAccountEntry[];
  payment_link?: boolean;
  to_trash?: boolean;
}

interface BankAccountEntry {
  account_number: string;
  account_type: string; // e.g. 'AHORRO', 'CORRIENTE'
}
```

---

### `bankAccounts.create(req): Promise<UserBank>`

Creates a new bank account connection. Each provider has its own typed request — TypeScript enforces required fields per provider via a discriminated union on `bankProvider`.

**BDV personal — `VE_BAN`**

```typescript
const bank = await pabilo.bankAccounts.create({
  bankProvider: 'VE_BAN',
  description: 'Mi cuenta BDV personal',
  userBankPhone: '04241234567',
  userBankDni: '12345678',
  username: 'usuario_portal_bdv',
  password: 'contraseña_portal_bdv',
});

console.log(bank.id); // use this id when creating payment links
```

**BDV empresa — `VE_BAN_EMP_V2`**

The `accountNumber` and `apiKey` fields are mapped to `username` and `password` in the API — the SDK exposes semantic names.

```typescript
const bank = await pabilo.bankAccounts.create({
  bankProvider: 'VE_BAN_EMP_V2',
  description: 'Cuenta empresa BDV',
  userBankPhone: '04241234567',
  userBankDni: '12345678',
  accountNumber: '01020000000000000000', // número de cuenta
  apiKey: 'bdv_api_key_here',
  metadata: [
    { key_name: 'SHOW_DATE_IN_GENERIC_MOVEMENTS', key_value: 'true' },
  ],
});
```

**Test bank — `BANK_TEST`**

A sandboxed bank for testing. Always has a payment with reference `67890` available.

```typescript
const bank = await pabilo.bankAccounts.create({ bankProvider: 'BANK_TEST' });
```

**Request types:**

```typescript
// Shared base (not needed for BANK_TEST)
interface BaseCreateUserBankRequest {
  description: string;
  userBankPhone: string;
  userBankDni: string;
  metadata?: UserBankMetadataEntry[];  // [{ key_name: string, key_value: string }]
}

interface CreateVeBanRequest extends BaseCreateUserBankRequest {
  bankProvider: 'VE_BAN';
  username: string;
  password: string;
}

interface CreateVeBanEmpV2Request extends BaseCreateUserBankRequest {
  bankProvider: 'VE_BAN_EMP_V2';
  accountNumber: string;
  apiKey: string;
}

interface CreateBankTestRequest {
  bankProvider: 'BANK_TEST';
}

type CreateUserBankRequest =
  | CreateVeBanRequest
  | CreateVeBanEmpV2Request
  | CreateBankTestRequest;
```

**Returns:** `UserBank` (same shape as `list()` entries)

---

### `bankAccounts.delete(id): Promise<void>`

Soft-deletes a bank account (moves it to trash). The bank no longer appears in `list()` results.

```typescript
await pabilo.bankAccounts.delete(bank.id);
```

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | The `UserBank.id` to delete |

---

## `pabilo.paymentLinks`

### `paymentLinks.create(req): Promise<PaymentLink>`

Creates a new payment link that customers can use to pay via Pago Móvil.

```typescript
const link = await pabilo.paymentLinks.create({
  amount: 4000,
  description: 'Orden #1234',
  userBankId: bank.id,
  // optional
  name: 'Servicio mensual',
  redirectUrl: 'https://myapp.com/gracias',
  webhookUrl: 'https://myapp.com/webhook/pabilo',
  notificationByWhatsapp: true,
  isUsd: false,
  currency: 'VES',
});

console.log(link.url);    // https://pabilo.app/pay/...  share this with the customer
console.log(link.id);     // use for getInfo / isPaid / update
console.log(link.status); // 'pending' | 'active' | 'paid' | 'expired' | 'cancelled'
```

**Request fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `amount` | `number` | yes | Amount in the payment currency |
| `description` | `string` | yes | Internal description |
| `userBankId` | `string` | yes | ID of the bank account to receive payment |
| `name` | `string` | no | Customer-facing name shown on the payment page |
| `currency` | `string` | no | Defaults to `'VES'` |
| `isUsd` | `boolean` | no | Whether the amount is in USD |
| `redirectUrl` | `string` | no | URL to redirect after payment |
| `webhookUrl` | `string` | no | URL to receive payment event webhooks |
| `notificationByWhatsapp` | `boolean` | no | Send WhatsApp notification on payment |
| `metadata` | `Record<string, unknown>` | no | Arbitrary key/value data |

**Returns:** `PaymentLink`

```typescript
interface PaymentLink {
  id: string;
  url: string;
  amount?: number;
  status?: 'pending' | 'paid' | 'active' | 'expired' | 'cancelled';
  type?: 'default' | 'fixed';
  userId?: string;
  name?: string;
  description?: string;
  isUsd?: boolean;
  redirectUrl?: string;
  webhookUrl?: string;
  notificationByWhatsapp?: boolean;
  expirationTime?: number;
  paymentLinkOrigin?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

---

### `paymentLinks.getInfo(id): Promise<PaymentLink>`

Fetches current state of a payment link (status, amount, etc.).

```typescript
const link = await pabilo.paymentLinks.getInfo('69d0083b691af50b78e07921');

console.log(link.status);    // 'paid'
console.log(link.amount);    // 4000
console.log(link.createdAt); // ISO date string
```

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | The `PaymentLink.id` |

---

### `paymentLinks.isPaid(id): Promise<boolean>`

Convenience method — returns `true` if the payment link's status is `'paid'`.

```typescript
const paid = await pabilo.paymentLinks.isPaid('69d0083b691af50b78e07921');

if (paid) {
  // fulfill the order
}
```

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | The `PaymentLink.id` |

> Internally calls `getInfo()` and checks `status === 'paid'`.

---

### `paymentLinks.update(id, req): Promise<PaymentLink>`

Updates a payment link's amount, description, redirect URL, or currency.

```typescript
const updated = await pabilo.paymentLinks.update('69d0083b691af50b78e07921', {
  amount: 5000,
  description: 'Orden actualizada',
  redirectUrl: 'https://myapp.com/nueva-ruta',
  currency: 'VES',
});

console.log(updated.amount); // 5000
```

**Request fields (all optional):**

| Field | Type | Description |
|---|---|---|
| `amount` | `number` | New amount |
| `description` | `string` | New description |
| `redirectUrl` | `string` | New redirect URL |
| `currency` | `string` | New currency code |

---

## `pabilo.payments`

### `payments.verify(userBankId, req): Promise<VerifyPaymentResult>`

Checks whether a specific bank transfer exists in a connected bank account. Used to confirm that a customer's Pago Móvil transfer matches an expected payment.

```typescript
const result = await pabilo.payments.verify(bank.id, {
  amount: 4000,
  bankReference: '12345678',
  movementType: 'GENERIC', // optional, defaults to 'GENERIC'
});

if (result.found) {
  console.log(result.isNew); // true if first time this reference was seen
  console.log(result.data.credit_cost);
  console.log(result.data.is_new);

  const payment = result.data.user_bank_payment;
  if (payment) {
    console.log(payment.id);
    console.log(payment.amount);
    console.log(payment.status);           // 'paid'
    console.log(payment.bank_reference_id);
    console.log(payment.payment_params.fecha_pago);
    console.log(payment.payment_params.banco_origen);
    console.log(payment.payment_params.telefono_pagador);
  }
} else {
  // result.reason → 'BANK_NOT_AVAILABLE' | 'PAYMENT_NOT_FOUND'
  if (result.reason === 'BANK_NOT_AVAILABLE') {
    // bank is offline or credentials expired
  }
  if (result.reason === 'PAYMENT_NOT_FOUND') {
    // transfer does not exist or does not match
  }
}
```

**Request fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `userBankId` (first arg) | `string` | yes | ID of the bank account to search |
| `amount` | `number` | yes | Expected transfer amount |
| `bankReference` | `string` | yes | Bank transfer reference number |
| `movementType` | `string` | no | Defaults to `'GENERIC'` |

**Returns:** `VerifyPaymentResult` — a discriminated union on `found`:

```typescript
type VerifyPaymentResult =
  | { found: false; reason: 'BANK_NOT_AVAILABLE' | 'PAYMENT_NOT_FOUND' }
  | { found: true; isNew: boolean; data: PaymentData };

interface PaymentData {
  is_new: boolean;
  credit_cost: number;
  user_bank_payment?: UserBankPayment;
  user_credits_total?: number;
  user_credits_total_in_usd?: number;
}

interface UserBankPayment {
  id: string;
  amount: number;
  status: string;
  user_id: string;
  user_bank_id: string;
  bank_reference_id: string;
  confirmed_status: boolean;
  credit_cost: number;
  created_at: string;
  updated_at: string;
  payment_params: {
    amount: number;
    cedula_pagador: string | null;
    telefono_pagador: string;
    fecha_pago: string;
    banco_origen: string;
    cuenta_pagador: string;
    invoice_number: string;
    movement_type: string;
  };
}
```

> The API returns HTTP 200 for `BANK_NOT_AVAILABLE` and `PAYMENT_NOT_FOUND`. The SDK handles this transparently — these cases are never thrown as errors.

---

## Error handling

All methods throw `PabiloError` on API errors (non-2xx HTTP responses) or network failures.

```typescript
import { PabiloClient, PabiloError } from '@pabilo/sdk';

try {
  const link = await pabilo.paymentLinks.create({ ... });
} catch (err) {
  if (err instanceof PabiloError) {
    console.error(err.code);    // PabiloErrorCode string
    console.error(err.message); // human-readable message from the API
    console.error(err.raw);     // raw API response body
    console.error(err.status);  // HTTP status code (if available)
  }
}
```

**Common error codes:**

| Code | Description |
|---|---|
| `BAD_REQUEST` | Invalid request body or parameters |
| `UNAUTHORIZED` | API key is missing or invalid |
| `NOT_FOUND` | Resource not found |
| `USER_BANK_ALREADY_EXISTS` | Bank account is already connected |
| `INTERNAL_SERVER_ERROR` | API server error |
| `NETWORK_ERROR` | Request could not reach the API |
| `REQUEST_FAILED` | HTTP error with no specific code |

---

## Testing with BANK_TEST

Use `BANK_TEST` to test the full payment flow without connecting a real bank. It has a pre-configured payment with reference `67890`.

```typescript
// 1. Create test bank
const bank = await pabilo.bankAccounts.create({ bankProvider: 'BANK_TEST' });

// 2. Create a payment link using the test bank
const link = await pabilo.paymentLinks.create({
  amount: 100,
  description: 'Test payment',
  userBankId: bank.id,
});

// 3. Verify the test payment reference
const result = await pabilo.payments.verify(bank.id, {
  amount: 0,
  bankReference: '67890',
});
// result.found === true

// 4. Clean up
await pabilo.bankAccounts.delete(bank.id);
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
import { PabiloError } from '@pabilo/sdk';

export async function POST(req: Request) {
  const { bankId, amount } = await req.json();

  try {
    const link = await pabilo.paymentLinks.create({
      amount,
      description: 'Checkout',
      userBankId: bankId,
      redirectUrl: `${process.env.NEXT_PUBLIC_URL}/gracias`,
      webhookUrl: `${process.env.NEXT_PUBLIC_URL}/api/webhook/pabilo`,
    });

    return Response.json({ url: link.url, id: link.id });
  } catch (err) {
    if (err instanceof PabiloError) {
      return Response.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
```

```typescript
// app/api/webhook/pabilo/route.ts — poll-based alternative to webhooks
import { pabilo } from '@/lib/pabilo';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const linkId = searchParams.get('linkId')!;

  const paid = await pabilo.paymentLinks.isPaid(linkId);
  return Response.json({ paid });
}
```

---

## Advanced: custom HTTP client

The SDK accepts an `IHttpClient` implementation for logging, retries, or proxying requests.

```typescript
import { PabiloClient, FetchHttpClient, type IHttpClient, type RequestOptions } from '@pabilo/sdk';

class LoggingHttpClient extends FetchHttpClient {
  async request<T>(opts: RequestOptions): Promise<T> {
    console.log('[pabilo]', opts.method, opts.path);
    return super.request<T>(opts);
  }
}

const pabilo = new PabiloClient({
  apiKey: 'YOUR_API_KEY',
  httpClient: new LoggingHttpClient({ baseUrl: 'https://api.pabilo.app', apiKey: 'YOUR_API_KEY' }),
});
```

Custom base URL (e.g. staging):

```typescript
const pabilo = new PabiloClient({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://staging.api.pabilo.app',
});
```

---

## Types reference

```typescript
import type {
  // Client
  PabiloClientOptions,

  // Resources
  User,
  Plan,
  UserBank,
  BankAccountEntry,
  PaymentLink,
  PaymentData,
  UserBankPayment,
  PaymentParams,

  // Requests
  CreateUserBankRequest,
  CreateVeBanRequest,
  CreateVeBanEmpV2Request,
  CreateBankTestRequest,
  UserBankMetadataEntry,
  CreatePaymentLinkRequest,
  UpdatePaymentLinkRequest,
  VerifyPaymentRequest,

  // Results
  VerifyPaymentResult,

  // Enums / literals
  PaymentLinkStatus,    // 'pending' | 'paid' | 'active' | 'expired' | 'cancelled'
  PaymentLinkType,      // 'default' | 'fixed'
  BankProvider,
  AccountType,
  PabiloErrorCode,

  // Ports (for DI / testing)
  IHttpClient,
  RequestOptions,
  IBankAccountsPort,
  IPaymentLinksPort,
  IPaymentsPort,
  IMePort,
} from '@pabilo/sdk';
```

---

## License

MIT
