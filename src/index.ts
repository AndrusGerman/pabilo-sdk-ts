export { PabiloClient } from './client.js';
export type { PabiloClientOptions } from './client.js';

export type {
  UserBank,
  BankAccountEntry,
  User,
  Plan,
  PaymentLink,
  PaymentData,
  PaymentParams,
  UserBankPayment,
  CreateUserBankRequest,
  CreateVeBanRequest,
  CreateVeBanEmpV2Request,
  UserBankMetadataEntry,
  CreatePaymentLinkRequest,
  UpdatePaymentLinkRequest,
  VerifyPaymentRequest,
  VerifyPaymentResult,
  BankProvider,
  AccountType,
  PaymentLinkStatus,
  PaymentLinkType,
  PabiloErrorCode,
} from './domain/types.js';

export { PabiloError } from './domain/errors.js';

export type { IHttpClient, RequestOptions } from './ports/http.js';
export type { IBankAccountsPort } from './ports/bank-accounts.js';
export type { IPaymentLinksPort } from './ports/payment-links.js';
export type { IPaymentsPort } from './ports/payments.js';
export type { IMePort } from './ports/me.js';

export { FetchHttpClient } from './infrastructure/fetch-http-client.js';
export { PabiloHttpClient } from './infrastructure/pabilo-http-client.js';
export type { PabiloHttpClientOptions } from './infrastructure/pabilo-http-client.js';
