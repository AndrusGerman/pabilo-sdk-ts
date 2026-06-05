import { describe, it, expect } from 'vitest';
import { MeResource } from '../src/resources/me.resource.js';
import type { IHttpClient } from '../src/ports/http.js';

function mockHttp(response: unknown): IHttpClient {
  return { async request() { return response as never; } };
}

describe('MeResource', () => {
  describe('getMe', () => {
    it('normalizes user-wrapped shape', async () => {
      const http = mockHttp({ user: { id: 'u1', email: 'test@pabilo.app', name: 'Test' } });
      const resource = new MeResource(http);
      const result = await resource.getMe();
      expect(result.id).toBe('u1');
      expect(result.email).toBe('test@pabilo.app');
    });

    it('normalizes flat shape', async () => {
      const http = mockHttp({ id: 'u2', email: 'flat@pabilo.app' });
      const resource = new MeResource(http);
      const result = await resource.getMe();
      expect(result.id).toBe('u2');
    });
  });

  describe('getPlan', () => {
    it('returns plan name and type', async () => {
      const http = mockHttp({ name: 'Pro', planType: 'MONTHLY' });
      const resource = new MeResource(http);
      const result = await resource.getPlan();
      expect(result.name).toBe('Pro');
      expect(result.planType).toBe('MONTHLY');
    });
  });
});
