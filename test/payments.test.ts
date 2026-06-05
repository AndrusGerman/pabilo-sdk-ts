import { describe, it, expect } from 'vitest';
import { PaymentsResource } from '../src/resources/payments.resource.js';
import type { IHttpClient } from '../src/ports/http.js';

function mockHttp(response: unknown): IHttpClient {
  return { async request() { return response as never; } };
}

describe('PaymentsResource', () => {
  it('returns found=false for BANK_NOT_AVAILABLE', async () => {
    const http = mockHttp({ error: 'BANK_NOT_AVAILABLE' });
    const resource = new PaymentsResource(http);
    const result = await resource.verify('bank1', { amount: 1200, bankReference: '37166' });
    expect(result.found).toBe(false);
    if (!result.found) expect(result.reason).toBe('BANK_NOT_AVAILABLE');
  });

  it('returns found=false for PAYMENT_NOT_FOUND', async () => {
    const http = mockHttp({ error: 'PAYMENT_NOT_FOUND' });
    const resource = new PaymentsResource(http);
    const result = await resource.verify('bank1', { amount: 0, bankReference: '37166' });
    expect(result.found).toBe(false);
    if (!result.found) expect(result.reason).toBe('PAYMENT_NOT_FOUND');
  });

  it('returns found=true with isNew=true when new payment', async () => {
    const http = mockHttp({ data: { is_new: true, id: 'pay1' } });
    const resource = new PaymentsResource(http);
    const result = await resource.verify('bank1', { amount: 1200, bankReference: '37166' });
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.isNew).toBe(true);
      expect(result.data.id).toBe('pay1');
    }
  });

  it('returns found=true with isNew=false for duplicate payment', async () => {
    const http = mockHttp({ data: { is_new: false } });
    const resource = new PaymentsResource(http);
    const result = await resource.verify('bank1', { amount: 1200, bankReference: '37166' });
    expect(result.found).toBe(true);
    if (result.found) expect(result.isNew).toBe(false);
  });

  it('uses GENERIC as default movement_type', async () => {
    let capturedBody: unknown;
    const http: IHttpClient = {
      async request(opts) {
        capturedBody = opts.body;
        return { data: { is_new: true } } as never;
      },
    };
    const resource = new PaymentsResource(http);
    await resource.verify('bank1', { amount: 100, bankReference: 'ref1' });
    expect((capturedBody as Record<string, unknown>)['movement_type']).toBe('GENERIC');
  });
});
