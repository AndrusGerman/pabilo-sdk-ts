export type BankProvider =
  | 'BANESCO'
  | 'MERCANTIL'
  | 'BDV'
  | 'PROVINCIAL'
  | (string & Record<never, never>);

export type AccountType = 'SAVINGS' | 'CHECKING' | (string & Record<never, never>);

export type PaymentLinkStatus =
  | 'PENDING'
  | 'PAID'
  | 'EXPIRED'
  | 'CANCELLED'
  | (string & Record<never, never>);

export type PabiloErrorCode =
  | 'BANK_NOT_AVAILABLE'
  | 'PAYMENT_NOT_FOUND'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'INTERNAL_SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'REQUEST_FAILED'
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
  name?: string;
}

export interface Plan {
  name: string;
  planType?: string;
}

export interface PaymentLink {
  id: string;
  url: string;
  amount?: number;
  status?: PaymentLinkStatus;
  userId?: string;
}

export interface PaymentData {
  is_new: boolean;
  [key: string]: unknown;
}

export interface CreatePaymentLinkRequest {
  amount: number;
  description: string;
  userBankId: string;
  currency?: string;
  redirectUrl?: string;
  webhookUrl?: string;
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
  movementType?: string;
}

export type VerifyPaymentResult =
  | { found: false; reason: 'BANK_NOT_AVAILABLE' | 'PAYMENT_NOT_FOUND' }
  | { found: true; isNew: boolean; data: PaymentData };
