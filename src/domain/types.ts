export type BankProvider =
  | 'VE_BAN'
  | 'VE_BAN_EMP'
  | 'VE_BAN_EMP_V2'
  | 'VE_PROV'
  | 'VE_PROV_EMP'
  | 'BANK_TEST'
  | 'MERCANTIL_EMP_TEST_V1'
  | 'MERCANTIL_EMP_V1'
  | 'VE_BANK_PLAZA_V1'
  | 'VE_BANK_PLAZA_QA_V1'
  | (string & Record<never, never>);

export type AccountType = 'SAVINGS' | 'CHECKING' | (string & Record<never, never>);

export type PaymentLinkStatus =
  | 'pending'
  | 'active'
  | 'paid'
  | 'failed'
  | 'canceled'
  | 'expired'
  | 'stopped'
  | (string & Record<never, never>);

export type PaymentLinkType =
  | 'default'
  | 'fixed'
  | 'subscription'
  | 'donation'
  | (string & Record<never, never>);

export type PaymentLinkOrigin = 'pabilo' | 'api' | (string & Record<never, never>);

export type MovementType =
  | 'GENERIC'
  | 'MOVIL_PAY'
  | 'TRANSFER'
  | 'C2P'
  | (string & Record<never, never>);

export type UserBankPaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | (string & Record<never, never>);

export type UserType =
  | 'system'
  | 'user'
  | 'admin'
  | 'test'
  | 'commerce'
  | (string & Record<never, never>);

export type PlanType =
  | 'credit'
  | 'unlimited'
  | 'counter'
  | (string & Record<never, never>);

export type PlanPeriod =
  | 'month'
  | 'six_months'
  | 'year'
  | (string & Record<never, never>);

export type PabiloErrorCode =
  | 'BANK_NOT_AVAILABLE'
  | 'PAYMENT_NOT_FOUND'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INTERNAL_SERVER_ERROR'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'
  | 'REQUEST_FAILED'
  | 'MISSING_CONFIG'
  | 'REQUEST_LIMIT_REACHED'
  | 'BANK_ACCOUNT_LIMIT_REACHED'
  | 'USER_BANK_ALREADY_EXISTS'
  | 'USER_BANCK_NOT_FOUND'
  | 'USER_BANCK_BAD_PASSWORD'
  | 'USER_BANCK_PASSWORD_EXPIRED'
  | 'INVALID_MOVEMENT_TYPE'
  | 'INVALID_PHONE'
  | 'MOVEMENT_TYPE_REQUIRED'
  | 'INVALID_BANK_PROVIDER'
  | 'PLAN_IS_NOT_ACTIVE'
  | 'USER_IS_NOT_ACTIVE'
  | 'NOT_ENOUGH_CREDITS'
  | 'THIS_EMAIL_ALREADY_EXISTS'
  | 'THIS_USERNAME_ALREADY_EXISTS'
  | 'PLAN_IS_ALREADY_ACTIVE'
  | 'RENOVATION_IS_ALREADY_PAID'
  | 'GET_DOLAR_PRICE_FAILED'
  | 'PAYMENT_AMOUNT_NOT_VALID'
  | 'PAYMENT_ALREADY_EXISTS'
  | 'IS_NOT_POSITIVE_PAYMENT'
  | 'IS_NOT_POSITIVE_AMOUNT'
  | 'PAGE_NOT_FOUND'
  | 'SESSION_ALREADY_ACTIVE'
  | 'PROXY_ERROR'
  | 'NOT_IMPLEMENTED'
  | 'METHOD_NOT_SUPPORT'
  | 'COORDINATE_KEY_EXTRACTION_FAILED'
  | 'COORDINATE_KEY_NOT_VALID'
  | 'BANK_TEMPORARILY_INACTIVE'
  | 'BANK_TOO_MANY_REQUESTS'
  | (string & Record<never, never>);

export interface BankAccountEntry {
  account_number: string;
  account_type: AccountType;
}

export interface UserBank {
  id: string;
  description: string;
  provider: BankProvider;
  bank_accounts: BankAccountEntry[];
  payment_link?: boolean;
  to_trash?: boolean;
}

export interface User {
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

export interface PlanBenefit {
  description: string;
  contain: boolean;
}

export interface Plan {
  id?: string;
  name: string;
  description?: string;
  planType?: PlanType;
  period?: PlanPeriod;
  price?: number;
  requestLimit?: number;
  bankAccountLimit?: number;
  initialCredits?: number;
  maxAcumulatedCredits?: number;
  benefits?: PlanBenefit[];
  salient?: boolean;
  hidden?: boolean;
}

export interface PaymentLink {
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

export interface PaymentParams {
  amount: number;
  cedula_pagador: string | null;
  telefono_pagador: string;
  fecha_pago: string;
  banco_origen: string;
  cuenta_pagador: string;
  invoice_number: string;
  movement_type: string;
}

export interface UserBankPayment {
  id: string;
  created_at: string;
  updated_at: string;
  bank_reference_id: string;
  user_id: string;
  amount: number;
  user_bank_id: string;
  status: UserBankPaymentStatus;
  credit_cost: number;
  payment_params: PaymentParams;
  confirmed_status: boolean;
  details?: unknown[];
}

export interface PaymentData {
  is_new: boolean;
  credit_cost: number;
  user_bank_payment?: UserBankPayment;
  user_credits_total?: number;
  user_credits_total_in_usd?: number;
  [key: string]: unknown;
}

export interface PaymentLinkWebhookPayload {
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

export interface ListPaymentLinksRequest {
  page?: number;
  limit?: number;
  type?: PaymentLinkType;
  status?: PaymentLinkStatus;
  search?: string;
}

export interface PaymentLinksPage {
  items: PaymentLink[];
  total: number;
  page: number;
  limit: number;
}

export interface CreatePaymentLinkRequest {
  amount: number;
  description: string;
  userBankId: string;
  currency?: string;
  redirectUrl?: string;
  webhookUrl?: string;
  notificationByWhatsapp?: boolean;
  name?: string;
  isUsd?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdatePaymentLinkRequest {
  amount?: number;
  description?: string;
  redirectUrl?: string;
  currency?: string;
}

export interface VerifyPaymentRequest {
  amount: number;
  bankReference: string;
  movementType?: MovementType;
}

export type VerifyPaymentResult =
  | { found: false; reason: 'BANK_NOT_AVAILABLE' | 'PAYMENT_NOT_FOUND' }
  | { found: true; isNew: boolean; data: PaymentData };

// ── UserBank creation ────────────────────────────────────────────────────────

export interface UserBankMetadataEntry {
  key_name: string;
  key_value: string;
}

interface BaseCreateUserBankRequest {
  description: string;
  userBankPhone: string;
  userBankDni: string;
  metadata?: UserBankMetadataEntry[];
}

export interface CreateVeBanRequest extends BaseCreateUserBankRequest {
  bankProvider: 'VE_BAN';
  username: string;
  password: string;
}

export interface CreateVeBanEmpV2Request extends BaseCreateUserBankRequest {
  bankProvider: 'VE_BAN_EMP_V2';
  accountNumber: string;
  apiKey: string;
}

export interface CreateBankTestRequest {
  bankProvider: 'BANK_TEST';
}

interface BaseBankPlazaRequest extends BaseCreateUserBankRequest {
  clientId: string;      // Client ID     → API: username
  clientSecret: string;  // Client Secret → API: password
  accountNumber: string; // Número de Cuenta → API: metadata ACCOUNT_NUMBER
}

export interface CreateBankPlazaV1Request extends BaseBankPlazaRequest {
  bankProvider: 'VE_BANK_PLAZA_V1';
}

export interface CreateBankPlazaQaV1Request extends BaseBankPlazaRequest {
  bankProvider: 'VE_BANK_PLAZA_QA_V1';
}

// Add new providers to this union
export type CreateUserBankRequest =
  | CreateVeBanRequest
  | CreateVeBanEmpV2Request
  | CreateBankTestRequest
  | CreateBankPlazaV1Request
  | CreateBankPlazaQaV1Request;
