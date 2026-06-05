export type BankProvider =
  | 'BANESCO'
  | 'MERCANTIL'
  | 'BDV'
  | 'PROVINCIAL'
  | (string & Record<never, never>);

export type AccountType = 'SAVINGS' | 'CHECKING' | (string & Record<never, never>);

export type PaymentLinkStatus =
  | 'pending'
  | 'paid'
  | 'active'
  | 'expired'
  | 'cancelled'
  | (string & Record<never, never>);

export type PaymentLinkType =
  | 'default'
  | 'fixed'
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
  type?: PaymentLinkType;
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
  status: string;
  credit_cost: number;
  payment_params: PaymentParams;
  confirmed_status: boolean;
  details: unknown;
}

export interface PaymentData {
  is_new: boolean;
  credit_cost: number;
  user_bank_payment?: UserBankPayment;
  user_credits_total?: number;
  user_credits_total_in_usd?: number;
  [key: string]: unknown;
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
  movementType?: string;
}

export type VerifyPaymentResult =
  | { found: false; reason: 'BANK_NOT_AVAILABLE' | 'PAYMENT_NOT_FOUND' }
  | { found: true; isNew: boolean; data: PaymentData };
