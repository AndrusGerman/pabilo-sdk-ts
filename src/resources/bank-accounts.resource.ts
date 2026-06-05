import type { IHttpClient } from '../ports/http.js';
import type { IBankAccountsPort } from '../ports/bank-accounts.js';
import type { UserBank, BankAccountEntry, CreateUserBankRequest } from '../domain/types.js';

export class BankAccountsResource implements IBankAccountsPort {
  constructor(private readonly http: IHttpClient) {}

  async create(req: CreateUserBankRequest): Promise<UserBank> {
    // API requires user_id in the body — fetch it transparently from /me
    const meRes = await this.http.request<Record<string, unknown>>({ method: 'GET', path: '/me' });
    const userId = String(
      (meRes['user'] as Record<string, unknown> | undefined)?.['id'] ?? meRes['id'] ?? ''
    );

    const body = buildCreateBody(req, userId);
    const res = await this.http.request<Record<string, unknown>>({
      method: 'POST',
      path: '/usersbank',
      body,
    });

    // Response: { message, userbank: {...} } | { user_bank: {...} } | { data: {...} } | root
    const raw = (res['userbank'] ?? res['user_bank'] ?? res['data'] ?? res) as Record<string, unknown>;
    return normalizeUserBank(raw);
  }

  async delete(id: string): Promise<void> {
    await this.http.request({ method: 'DELETE', path: `/usersbank/${id}/to-trash` });
  }

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

function buildCreateBody(req: CreateUserBankRequest, userId: string): Record<string, unknown> {
  if (req.bankProvider === 'BANK_TEST') {
    return { bank_provider: req.bankProvider, user_id: userId };
  }

  const body: Record<string, unknown> = {
    bank_provider: req.bankProvider,
    description: req.description,
    user_bank_phone: req.userBankPhone,
    user_bank_dni: req.userBankDni,
    user_id: userId,
    metadata: req.metadata ?? [],
  };

  switch (req.bankProvider) {
    case 'VE_BAN':
      body['username'] = req.username;
      body['password'] = req.password;
      break;
    case 'VE_BAN_EMP_V2':
      body['username'] = req.accountNumber;
      body['password'] = req.apiKey;
      break;
  }

  return body;
}
