import type { IHttpClient } from '../ports/http.js';
import type { IBankAccountsPort } from '../ports/bank-accounts.js';
import type { UserBank, BankAccountEntry } from '../domain/types.js';

export class BankAccountsResource implements IBankAccountsPort {
  constructor(private readonly http: IHttpClient) {}

  async list(): Promise<UserBank[]> {
    const res = await this.http.request<Record<string, unknown>>({
      method: 'GET',
      path: '/me/usersbank',
    });

    const raw =
      Array.isArray(res['user_banks']) ? res['user_banks'] :
      Array.isArray(res['data']) ? res['data'] :
      [];

    return (raw as unknown[]).map(normalizeUserBank);
  }
}

function normalizeUserBank(raw: unknown): UserBank {
  const b = raw as Record<string, unknown>;
  const bankAccounts = Array.isArray(b['bank_accounts'])
    ? (b['bank_accounts'] as unknown[]).map(normalizeBankAccount)
    : [];

  return {
    id: String(b['id'] ?? ''),
    description: String(b['description'] ?? ''),
    provider: String(b['provider'] ?? ''),
    bank_accounts: bankAccounts,
    ...(typeof b['payment_link'] === 'boolean' ? { payment_link: b['payment_link'] } : {}),
    ...(typeof b['to_trash'] === 'boolean' ? { to_trash: b['to_trash'] } : {}),
  };
}

function normalizeBankAccount(raw: unknown): BankAccountEntry {
  const a = raw as Record<string, unknown>;
  return {
    account_number: String(a['account_number'] ?? ''),
    account_type: String(a['account_type'] ?? a['type'] ?? ''),
  };
}
