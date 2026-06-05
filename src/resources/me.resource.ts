import type { IHttpClient } from '../ports/http.js';
import type { IMePort } from '../ports/me.js';
import type { User, Plan } from '../domain/types.js';

export class MeResource implements IMePort {
  constructor(private readonly http: IHttpClient) {}

  async getMe(): Promise<User> {
    const res = await this.http.request<Record<string, unknown>>({
      method: 'GET',
      path: '/me',
    });
    const u = (res['user'] ?? res) as Record<string, unknown>;
    return {
      id: String(u['id'] ?? ''),
      email: typeof u['email'] === 'string' ? u['email'] : undefined,
      name: typeof u['name'] === 'string' ? u['name'] : undefined,
    };
  }

  async getPlan(): Promise<Plan> {
    const res = await this.http.request<Record<string, unknown>>({
      method: 'GET',
      path: '/me/plan',
    });
    return {
      name: String(res['name'] ?? ''),
      planType: typeof res['planType'] === 'string' ? res['planType'] : undefined,
    };
  }
}
