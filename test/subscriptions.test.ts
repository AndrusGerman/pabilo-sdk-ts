import { describe, it, expect } from 'vitest';
import { SubscriptionsResource } from '../src/resources/subscriptions.resource.js';
import type { IHttpClient, RequestOptions } from '../src/ports/http.js';

function mockHttp(response: unknown): IHttpClient {
  return { async request() { return response as never; } };
}

describe('SubscriptionsResource', () => {
  describe('create', () => {
    it('normalizes the subscription shape', async () => {
      const http = mockHttp({ subscription: { id: 's1', name: 'Plan', currency: 'USD' } });
      const resource = new SubscriptionsResource(http);
      const result = await resource.create({
        userBankId: 'b1',
        payFirst: true,
        uniqueProduct: { productName: 'Prod', productPrice: 5 },
        uniqueClient: { clientName: 'Ana', clientPhone: '+58412...' },
      });
      expect(result.id).toBe('s1');
      expect(result.name).toBe('Plan');
      expect(result.currency).toBe('USD');
    });

    it('sends correct body fields', async () => {
      let captured: RequestOptions | null = null;
      const http: IHttpClient = {
        async request(opts) {
          captured = opts;
          return { subscription: { id: 's1' } } as never;
        },
      };
      const resource = new SubscriptionsResource(http);
      await resource.create({
        userBankId: 'bank1',
        payFirst: true,
        name: 'Mensualidad',
        description: 'Gym',
        webhookUrl: 'https://wh',
        currency: 'USDT',
        uniqueProduct: { productName: 'Prod', productPrice: 10 },
        uniqueClient: { clientName: 'Ana', clientPhone: '+58412' },
      });
      const body = (captured as unknown as RequestOptions).body as Record<string, unknown>;
      expect((captured as unknown as RequestOptions).path).toBe('/v1/subscription/make');
      expect(body['user_bank_id']).toBe('bank1');
      expect(body['pay_first']).toBe(true);
      expect(body['webhook_url']).toBe('https://wh');
      expect(body['currency']).toBe('USDT');
      expect(body['uniqueProduct']).toEqual({ productName: 'Prod', productPrice: 10 });
      expect(body['uniqueClient']).toEqual({ clientName: 'Ana', clientPhone: '+58412' });
    });

    it('defaults currency to VEF', async () => {
      let captured: RequestOptions | null = null;
      const http: IHttpClient = {
        async request(opts) {
          captured = opts;
          return { subscription: { id: 's1' } } as never;
        },
      };
      const resource = new SubscriptionsResource(http);
      await resource.create({ userBankId: 'b1', payFirst: false, branchProductId: 'p1', branchClientId: 'c1' });
      const body = (captured as unknown as RequestOptions).body as Record<string, unknown>;
      expect(body['currency']).toBe('VEF');
    });
  });

  describe('cancel', () => {
    it('normalizes the data.subscription shape', async () => {
      const http = mockHttp({ data: { subscription: { id: 's1', status: 'cancelled' } } });
      const resource = new SubscriptionsResource(http);
      const result = await resource.cancel('s1');
      expect(result.id).toBe('s1');
      expect(result.status).toBe('cancelled');
    });
  });

  describe('list', () => {
    it('maps the subscriptions array and pagination', async () => {
      const http = mockHttp({
        subscriptions: [{ id: 's1', name: 'A' }, { id: 's2', name: 'B' }],
        total: 2,
        page: 1,
        limit: 10,
      });
      const resource = new SubscriptionsResource(http);
      const page = await resource.list();
      expect(page.items).toHaveLength(2);
      expect(page.items[0]?.id).toBe('s1');
      expect(page.total).toBe(2);
    });
  });

  describe('getInfo', () => {
    it('normalizes data.subscription shape', async () => {
      const http = mockHttp({ data: { subscription: { id: 's3', currency: 'EUR' } } });
      const resource = new SubscriptionsResource(http);
      const result = await resource.getInfo('s3');
      expect(result.id).toBe('s3');
      expect(result.currency).toBe('EUR');
    });
  });
});
