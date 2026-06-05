import { describe, it, expect } from 'vitest';
import { BankAccountsResource } from '../src/resources/bank-accounts.resource.js';
import type { IHttpClient } from '../src/ports/http.js';

function mockHttp(response: unknown): IHttpClient {
  return { async request() { return response as never; } };
}

describe('BankAccountsResource', () => {
  it('returns user_banks from response', async () => {
    const http = mockHttp({
      user_banks: [
        { id: 'b1', description: 'Main', provider: 'BANESCO', bank_accounts: [{ account_number: '01340001', account_type: 'SAVINGS' }] },
      ],
    });
    const resource = new BankAccountsResource(http);
    const result = await resource.list();
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('b1');
    expect(result[0]?.bank_accounts[0]?.account_type).toBe('SAVINGS');
  });

  it('falls back to data array shape', async () => {
    const http = mockHttp({ data: [{ id: 'b2', description: 'Alt', provider: 'BDV', bank_accounts: [] }] });
    const resource = new BankAccountsResource(http);
    const result = await resource.list();
    expect(result[0]?.id).toBe('b2');
  });

  it('returns empty array when no banks key', async () => {
    const http = mockHttp({});
    const resource = new BankAccountsResource(http);
    const result = await resource.list();
    expect(result).toEqual([]);
  });
});
