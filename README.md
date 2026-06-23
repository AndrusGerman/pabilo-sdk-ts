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

console.log(user.id);          // string
console.log(user.email);       // string | undefined
console.log(user.username);    // string | undefined
console.log(user.fullName);    // string | undefined
console.log(user.companyName); // string | undefined
console.log(user.credits);     // number | undefined
console.log(user.planIsActive);// boolean | undefined
console.log(user.isDemo);      // boolean | undefined
console.log(user.userType);    // 'user' | 'admin' | 'commerce' | ... | undefined
```

**Returns:** `User`

```typescript
interface User {
  id: string;
  email?: string;
  username?: string;
  fullName?: string;
  companyName?: string;
  credits?: number;
  planIsActive?: boolean;
  isDemo?: boolean;
  userType?: UserType;
}

type UserType = 'system' | 'user' | 'admin' | 'test' | 'commerce' | string;
```

---

### `me.getPlan(): Promise<Plan>`

Returns the current subscription plan for the authenticated account.

```typescript
const plan = await pabilo.me.getPlan();

console.log(plan.name);              // e.g. 'Pro'
console.log(plan.planType);          // 'credit' | 'unlimited' | 'counter'
console.log(plan.period);            // 'month' | 'six_months' | 'year'
console.log(plan.requestLimit);      // number (-1 = unlimited)
console.log(plan.bankAccountLimit);  // number (-1 = unlimited)
console.log(plan.initialCredits);    // number
console.log(plan.price);             // number
console.log(plan.benefits);          // PlanBenefit[]
```

**Returns:** `Plan`

```typescript
interface Plan {
  id?: string;
  name: string;
  description?: string;
  planType?: PlanType;      // 'credit' | 'unlimited' | 'counter'
  period?: PlanPeriod;      // 'month' | 'six_months' | 'year'
  price?: number;
  requestLimit?: number;
  bankAccountLimit?: number;
  initialCredits?: number;
  maxAcumulatedCredits?: number;
  benefits?: PlanBenefit[];
  salient?: boolean;
  hidden?: boolean;
}

interface PlanBenefit {
  description: string;
  contain: boolean;
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
  provider: BankProvider;
  bank_accounts: BankAccountEntry[];
  payment_link?: boolean;
  to_trash?: boolean;
}

interface BankAccountEntry {
  account_number: string;
  account_type: string; // e.g. 'AHORRO', 'CORRIENTE'
}

type BankProvider =
  | 'VE_BAN'                // BDV personal
  | 'VE_BAN_EMP'            // BDV empresa v1
  | 'VE_BAN_EMP_V2'         // BDV empresa v2
  | 'VE_PROV'               // Provincial personal
  | 'VE_PROV_EMP'           // Provincial empresa
  | 'MERCANTIL_EMP_V1'      // Mercantil empresa
  | 'MERCANTIL_EMP_TEST_V1' // Mercantil test
  | 'VE_BANK_PLAZA_V1'      // Banco Plaza producción
  | 'VE_BANK_PLAZA_QA_V1'   // Banco Plaza QA
  | 'BINANCE_APP'           // Binance Pay
  | 'NOTIFICATION_ACCOUNT'  // Cuenta de notificación (sin verificación bancaria)
  | 'BANK_TEST'             // Sandbox
  | string;
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
```

**BDV empresa — `VE_BAN_EMP_V2`**

```typescript
const bank = await pabilo.bankAccounts.create({
  bankProvider: 'VE_BAN_EMP_V2',
  description: 'Cuenta empresa BDV',
  userBankPhone: '04241234567',
  userBankDni: '12345678',
  accountNumber: '01020000000000000000',
  apiKey: 'bdv_api_key_here',
  metadata: [
    { key_name: 'SHOW_DATE_IN_GENERIC_MOVEMENTS', key_value: 'true' },
  ],
});
```

**Banco Plaza producción — `VE_BANK_PLAZA_V1`**

```typescript
const bank = await pabilo.bankAccounts.create({
  bankProvider: 'VE_BANK_PLAZA_V1',
  description: 'Banco Plaza empresa',
  userBankPhone: '04241234567',
  userBankDni: '12345678',
  clientId: 'tu-client-id',         // Client ID
  clientSecret: 'tu-client-secret', // Client Secret
  accountNumber: '01380000000000000000', // Número de Cuenta
});
```

**Banco Plaza QA — `VE_BANK_PLAZA_QA_V1`**

Mismos campos que `VE_BANK_PLAZA_V1`, apunta al entorno QA del banco.

```typescript
const bank = await pabilo.bankAccounts.create({
  bankProvider: 'VE_BANK_PLAZA_QA_V1',
  description: 'Banco Plaza QA',
  userBankPhone: '04241234567',
  userBankDni: '12345678',
  clientId: 'qa-client-id',
  clientSecret: 'qa-client-secret',
  accountNumber: '01380000000000000000',
});
```

**Binance Pay — `BINANCE_APP`**

```typescript
const bank = await pabilo.bankAccounts.create({
  bankProvider: 'BINANCE_APP',
  description: 'Binance Pay',
  userBankPhone: '04241234567',
  userBankDni: '12345678',
  apiKey: 'tu-clave-api',
  secretKey: 'tu-clave-secreta',
  // validationType: 'GLOBAL', // opcional — ver tabla abajo
});
```

El campo `validationType` controla cómo se valida `bankReference` en cada verificación de pago:

| Valor | Descripción | Default |
|---|---|---|
| `'GLOBAL'` | Acepta cualquiera de los cuatro tipos de referencia | ✓ |
| `'BY_USER'` | Solo el primer nombre del pagador en Binance | |
| `'BY_DATE'` | Solo la hora UTC plana de la transacción (`HHMMSS`) | |
| `'BY_NOTE'` | Solo la nota que el pagador incluyó en el pago | |
| `'BY_ORDER'` | Solo el order ID de la transacción | |

> Para verificar pagos en Binance usa `movementType: 'GENERIC'`. Ver [verificación Binance](#verificación-binance).

**Cuenta de notificación — `NOTIFICATION_ACCOUNT`**

Cuenta sin verificación bancaria, usada solo para recibir notificaciones. Solo requiere teléfono y cédula.

```typescript
const bank = await pabilo.bankAccounts.create({
  bankProvider: 'NOTIFICATION_ACCOUNT',
  description: 'Notificaciones',
  userBankPhone: '04241234567',
  userBankDni: '12345678',
});
```

**Test bank — `BANK_TEST`**

A sandboxed bank for testing. Always has a payment with reference `67890` available.

```typescript
const bank = await pabilo.bankAccounts.create({ bankProvider: 'BANK_TEST' });
```

---

### `bankAccounts.delete(id): Promise<void>`

Soft-deletes a bank account. The bank no longer appears in `list()` results.

```typescript
await pabilo.bankAccounts.delete(bank.id);
```

---

## `pabilo.paymentLinks`

### `paymentLinks.list(req?): Promise<PaymentLinksPage>`

Returns a paginated list of the authenticated user's payment links.

```typescript
const page = await pabilo.paymentLinks.list({
  limit: 10,
  page: 1,
  status: 'pending',   // filter by status
  type: 'default',     // filter by type
  search: 'orden',     // search by name/description
});

console.log(page.total);   // total count
console.log(page.page);    // current page
console.log(page.limit);   // page size
console.log(page.items);   // PaymentLink[]
```

**Request fields (all optional):**

| Field | Type | Default | Description |
|---|---|---|---|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `10` | Items per page |
| `status` | `PaymentLinkStatus` | — | Filter by status |
| `type` | `PaymentLinkType` | — | Filter by type |
| `search` | `string` | — | Text search |

**Returns:** `PaymentLinksPage`

```typescript
interface PaymentLinksPage {
  items: PaymentLink[];
  total: number;
  page: number;
  limit: number;
}
```

---

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

console.log(link.url);    // https://pabilo.app/pay/...
console.log(link.id);
console.log(link.status); // 'pending' | 'active' | 'paid' | 'failed' | 'canceled' | 'expired' | 'stopped'
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
| `expirationTime` | `number` | no | Expiration in minutes. Default: `1440` (24 h). `-1` = never expires |
| `metadata` | `Record<string, unknown>` | no | Arbitrary key/value data |

**Returns:** `PaymentLink`

```typescript
interface PaymentLink {
  id: string;
  url: string;
  amount?: number;
  status?: PaymentLinkStatus;
  statusDetail?: string;
  type?: PaymentLinkType;
  userId?: string;
  userBankId?: string;
  withSubscriptionId?: string;
  name?: string;
  description?: string;
  isUsd?: boolean;
  redirectUrl?: string;
  webhookUrl?: string;
  webhookMethod?: string;
  notificationByWhatsapp?: boolean;
  expirationTime?: number;
  paymentLinkOrigin?: PaymentLinkOrigin;
  createdAt?: string;
  updatedAt?: string;
}

type PaymentLinkStatus = 'pending' | 'active' | 'paid' | 'failed' | 'canceled' | 'expired' | 'stopped' | string;
type PaymentLinkType   = 'default' | 'fixed' | 'subscription' | 'donation' | string;
type PaymentLinkOrigin = 'pabilo' | 'api' | string;
```

---

### `paymentLinks.getInfo(id): Promise<PaymentLink>`

Fetches current state of a payment link.

```typescript
const link = await pabilo.paymentLinks.getInfo('69d0083b691af50b78e07921');

console.log(link.status);       // 'paid'
console.log(link.statusDetail); // string — reason for current status
console.log(link.amount);
console.log(link.createdAt);
```

---

### `paymentLinks.isPaid(id): Promise<boolean>`

Returns `true` if the payment link's status is `'paid'`.

```typescript
const paid = await pabilo.paymentLinks.isPaid(link.id);

if (paid) {
  // fulfill the order
}
```

---

### `paymentLinks.update(id, req): Promise<PaymentLink>`

Updates a payment link's amount or description.

```typescript
const updated = await pabilo.paymentLinks.update(link.id, {
  amount: 5000,
  description: 'Orden actualizada',
});
```

---

## `pabilo.payments`

### `payments.verify(userBankId, req): Promise<VerifyPaymentResult>`

Checks whether a specific bank transfer exists in a connected bank account.

```typescript
const result = await pabilo.payments.verify(bank.id, {
  amount: 4000,
  bankReference: '12345678',
  movementType: 'GENERIC', // 'GENERIC' | 'MOVIL_PAY' | 'TRANSFER' | 'C2P'
});

if (result.found) {
  console.log(result.isNew);
  console.log(result.data.credit_cost);

  const payment = result.data.user_bank_payment;
  if (payment) {
    console.log(payment.id);
    console.log(payment.amount);
    console.log(payment.status); // 'pending' | 'paid' | 'failed'
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
}
```

**`movementType` values:**

| Value | Description |
|---|---|
| `'GENERIC'` | Default — any movement type (default) |
| `'MOVIL_PAY'` | Pago Móvil |
| `'TRANSFER'` | Bank transfer |
| `'C2P'` | Cuenta a Persona (C2P) |

**Returns:** `VerifyPaymentResult` — a discriminated union on `found`:

```typescript
type VerifyPaymentResult =
  | { found: false; reason: 'BANK_NOT_AVAILABLE' | 'PAYMENT_NOT_FOUND' }
  | { found: true; isNew: boolean; data: PaymentData };
```

> The API returns HTTP 200 for `BANK_NOT_AVAILABLE` and `PAYMENT_NOT_FOUND`. The SDK handles this transparently — these cases are never thrown as errors.

---

## Verificación Binance

Para cuentas `BINANCE_APP` la verificación usa `movementType: 'GENERIC'`. El valor de `bankReference` depende del `validationType` configurado en la cuenta:

| `validationType` | `bankReference` esperado | Ejemplo |
|---|---|---|
| `'GLOBAL'` (default) | Cualquiera de los cuatro tipos | primer nombre, hora UTC, nota u order ID |
| `'BY_USER'` | Primer nombre del pagador en Binance | `"Juan"` |
| `'BY_DATE'` | Hora UTC de la transacción sin separadores (`HHMMSS`) | `"012044"` para 01:20:44 UTC |
| `'BY_NOTE'` | Nota que el pagador incluyó en el pago | `"pago factura 123"` |
| `'BY_ORDER'` | Order ID de la transacción Binance | `"123456789"` |

```typescript
// Con GLOBAL (default) — usa cualquier referencia disponible
const result = await pabilo.payments.verify(binanceBank.id, {
  amount: 4000,
  bankReference: 'Juan',         // primer nombre, o '012044', o la nota
  movementType: 'GENERIC',
});

// Con BY_DATE — solo hora UTC plana
const result = await pabilo.payments.verify(binanceBank.id, {
  amount: 4000,
  bankReference: '012044',       // 01:20:44 UTC sin separadores
  movementType: 'GENERIC',
});

// Con BY_NOTE — solo nota del pago
const result = await pabilo.payments.verify(binanceBank.id, {
  amount: 4000,
  bankReference: 'pago factura', // nota que el pagador incluyó
  movementType: 'GENERIC',
});
```

---

## Webhooks

When a payment link is paid, the API sends a `POST` to the `webhookUrl` with the following payload. Import `PaymentLinkWebhookPayload` to type your webhook handler:

```typescript
import type { PaymentLinkWebhookPayload } from '@pabilo/sdk';

// Next.js App Router
export async function POST(req: Request) {
  const payload: PaymentLinkWebhookPayload = await req.json();

  console.log(payload.payment_link_id);
  console.log(payload.status);           // 'paid'
  console.log(payload.credit_balance);

  const payment = payload.user_bank_payment;
  if (payment) {
    console.log(payment.amount);
    console.log(payment.bank_reference_id);
    console.log(payment.payment_params.fecha_pago);
  }

  return Response.json({ ok: true });
}
```

**`PaymentLinkWebhookPayload` shape:**

```typescript
interface PaymentLinkWebhookPayload {
  id: string;
  created_at: string;
  updated_at: string;
  payment_link_id: string;
  status: PaymentLinkStatus;
  payment_link?: PaymentLink;
  user_bank_payment?: UserBankPayment;
  credit_balance: number;
  metadata: Array<{ key: string; value: string }>;
}
```

---

## Error handling

All methods throw `PabiloError` on API errors or network failures.

```typescript
import { PabiloClient, PabiloError } from '@pabilo/sdk';

try {
  const link = await pabilo.paymentLinks.create({ ... });
} catch (err) {
  if (err instanceof PabiloError) {
    console.error(err.code);       // PabiloErrorCode string
    console.error(err.message);    // human-readable message from the API
    console.error(err.statusCode); // HTTP status code
    console.error(err.raw);        // raw API response body
  }
}
```

**Common error codes:**

| Code | Description |
|---|---|
| `BAD_REQUEST` | Invalid request body or parameters |
| `UNAUTHORIZED` | API key is missing or invalid |
| `FORBIDDEN` | Action not permitted |
| `NOT_FOUND` | Resource not found |
| `USER_BANK_ALREADY_EXISTS` | Bank account is already connected |
| `USER_BANCK_BAD_PASSWORD` | Wrong bank portal credentials |
| `USER_BANCK_PASSWORD_EXPIRED` | Bank portal password expired |
| `NOT_ENOUGH_CREDITS` | Insufficient credits in the account |
| `PLAN_IS_NOT_ACTIVE` | Account plan is inactive |
| `REQUEST_LIMIT_REACHED` | Plan request limit exceeded |
| `BANK_ACCOUNT_LIMIT_REACHED` | Plan bank account limit exceeded |
| `BANK_NOT_AVAILABLE` | Bank is temporarily offline |
| `BANK_TEMPORARILY_INACTIVE` | Bank is temporarily disabled |
| `BANK_TOO_MANY_REQUESTS` | Rate limit from the bank |
| `PAYMENT_NOT_FOUND` | Transfer reference not found |
| `PAYMENT_ALREADY_EXISTS` | Transfer already verified |
| `INTERNAL_ERROR` | API server error |
| `NETWORK_ERROR` | Request could not reach the API |

---

## Testing with BANK_TEST

Use `BANK_TEST` to test the full payment flow without connecting a real bank. Reference `67890` always returns a found payment.

```typescript
// 1. Create test bank
const bank = await pabilo.bankAccounts.create({ bankProvider: 'BANK_TEST' });

// 2. Create a payment link
const link = await pabilo.paymentLinks.create({
  amount: 100,
  description: 'Test payment',
  userBankId: bank.id,
  webhookUrl: 'https://myapp.com/webhook',
});

// 3. Verify the test payment
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
// app/api/webhook/pabilo/route.ts
import type { PaymentLinkWebhookPayload } from '@pabilo/sdk';
import { pabilo } from '@/lib/pabilo';

export async function POST(req: Request) {
  const payload: PaymentLinkWebhookPayload = await req.json();

  if (payload.status === 'paid') {
    // fulfill the order linked to payload.payment_link_id
  }

  return Response.json({ ok: true });
}
```

---

## Advanced: custom HTTP client

```typescript
import { PabiloClient, FetchHttpClient, type RequestOptions } from '@pabilo/sdk';

class LoggingHttpClient extends FetchHttpClient {
  async request<T>(opts: RequestOptions): Promise<T> {
    console.log('[pabilo]', opts.method, opts.path);
    return super.request<T>(opts);
  }
}

const pabilo = new PabiloClient({
  apiKey: 'YOUR_API_KEY',
  httpClient: new LoggingHttpClient(),
});
```

Custom base URL:

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
  PlanBenefit,
  UserBank,
  BankAccountEntry,
  PaymentLink,
  PaymentLinksPage,
  PaymentData,
  UserBankPayment,
  PaymentParams,

  // Requests
  CreateUserBankRequest,
  CreateVeBanRequest,
  CreateVeBanEmpV2Request,
  CreateBankTestRequest,
  CreateBankPlazaV1Request,
  CreateBankPlazaQaV1Request,
  CreateBinanceAppRequest,
  CreateNotificationAccountRequest,
  UserBankMetadataEntry,
  CreatePaymentLinkRequest,
  UpdatePaymentLinkRequest,
  ListPaymentLinksRequest,
  VerifyPaymentRequest,

  // Results & Webhooks
  VerifyPaymentResult,
  PaymentLinkWebhookPayload,

  // Literals / enums
  PaymentLinkStatus,    // 'pending' | 'active' | 'paid' | 'failed' | 'canceled' | 'expired' | 'stopped'
  PaymentLinkType,      // 'default' | 'fixed' | 'subscription' | 'donation'
  PaymentLinkOrigin,    // 'pabilo' | 'api'
  BankProvider,         // 'VE_BAN' | 'VE_BAN_EMP_V2' | ...
  MovementType,         // 'GENERIC' | 'MOVIL_PAY' | 'TRANSFER' | 'C2P'
  BinanceValidationType,// 'GLOBAL' | 'BY_USER' | 'BY_DATE' | 'BY_NOTE'
  UserBankPaymentStatus,// 'pending' | 'paid' | 'failed'
  UserType,             // 'user' | 'admin' | 'commerce' | ...
  PlanType,             // 'credit' | 'unlimited' | 'counter'
  PlanPeriod,           // 'month' | 'six_months' | 'year'
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
