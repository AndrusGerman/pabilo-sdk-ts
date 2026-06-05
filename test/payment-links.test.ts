import { describe, it, expect } from 'vitest';
import { PaymentLinksResource } from '../src/resources/payment-links.resource.js';
import type { IHttpClient, RequestOptions } from '../src/ports/http.js';

function mockHttp(response: unknown): IHttpClient {
  return { async request() { return response as never; } };
}

describe('PaymentLinksResource', () => {
  describe('create', () => {
    it('normalizes paymentlink shape', async () => {
      const http = mockHttp({ paymentlink: { id: 'pl1', url: 'https://pabilo.app/pay/pl1' } });
      const resource = new PaymentLinksResource(http);
      const result = await resource.create({ amount: 1200, description: 'Test', userBankId: 'b1' });
      expect(result.id).toBe('pl1');
      expect(result.url).toBe('https://pabilo.app/pay/pl1');
    });

    it('normalizes data shape', async () => {
      const http = mockHttp({ data: { id: 'pl2', url: 'https://pabilo.app/pay/pl2', amount: 500 } });
      const resource = new PaymentLinksResource(http);
      const result = await resource.create({ amount: 500, description: 'Test', userBankId: 'b1' });
      expect(result.id).toBe('pl2');
      expect(result.amount).toBe(500);
    });

    it('sends correct body fields', async () => {
      let captured: RequestOptions | null = null;
      const http: IHttpClient = {
        async request(opts) {
          captured = opts;
          return { id: 'x', url: 'u' } as never;
        },
      };
      const resource = new PaymentLinksResource(http);
      await resource.create({ amount: 100, description: 'Pay', userBankId: 'bank1', redirectUrl: 'https://ok', webhookUrl: 'https://wh' });
      expect(captured).not.toBeNull();
      const body = (captured as RequestOptions).body as Record<string, unknown>;
      expect(body['redirect_url']).toBe('https://ok');
      expect(body['webhook_url']).toBe('https://wh');
      expect(body['currency']).toBe('VES');
    });
  });

  describe('getInfo', () => {
    it('normalizes data.payment_link shape', async () => {
      const http = mockHttp({ data: { payment_link: { id: 'pl3', url: 'u', status: 'PAID', user_id: 'usr1' } } });
      const resource = new PaymentLinksResource(http);
      const result = await resource.getInfo('pl3');
      expect(result.status).toBe('PAID');
      expect(result.userId).toBe('usr1');
    });
  });
});
