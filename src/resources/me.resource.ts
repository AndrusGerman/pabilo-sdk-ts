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
      ...(typeof u['email'] === 'string'        ? { email: u['email'] }               : {}),
      ...(typeof u['username'] === 'string'     ? { username: u['username'] }         : {}),
      ...(typeof u['full_name'] === 'string'    ? { fullName: u['full_name'] }        : {}),
      ...(typeof u['company_name'] === 'string' ? { companyName: u['company_name'] }  : {}),
      ...(typeof u['credits'] === 'number'      ? { credits: u['credits'] }           : {}),
      ...(typeof u['plan_is_active'] === 'boolean' ? { planIsActive: u['plan_is_active'] } : {}),
      ...(typeof u['is_demo'] === 'boolean'     ? { isDemo: u['is_demo'] }            : {}),
      ...(typeof u['user_type'] === 'string'    ? { userType: u['user_type'] }        : {}),
    };
  }

  async getPlan(): Promise<Plan> {
    const raw = await this.http.request<Record<string, unknown>>({
      method: 'GET',
      path: '/me/plan',
    });
    // Response: { message, plan: { ... } }
    const res = (raw['plan'] as Record<string, unknown> | undefined) ?? raw;
    return {
      name: String(res['name'] ?? ''),
      ...(typeof res['id'] === 'string'                      ? { id: res['id'] }                                  : {}),
      ...(typeof res['description'] === 'string'             ? { description: res['description'] }               : {}),
      ...(typeof res['planType'] === 'string'                ? { planType: res['planType'] }                     : {}),
      ...(typeof res['period'] === 'string'                  ? { period: res['period'] }                         : {}),
      ...(typeof res['price'] === 'number'                   ? { price: res['price'] }                           : {}),
      ...(typeof res['requestLimit'] === 'number'            ? { requestLimit: res['requestLimit'] }             : {}),
      ...(typeof res['bankAccountLimit'] === 'number'        ? { bankAccountLimit: res['bankAccountLimit'] }     : {}),
      ...(typeof res['initialCredits'] === 'number'          ? { initialCredits: res['initialCredits'] }         : {}),
      ...(typeof res['maxAcumulatedCredits'] === 'number'    ? { maxAcumulatedCredits: res['maxAcumulatedCredits'] } : {}),
      ...(Array.isArray(res['benefits'])                     ? { benefits: res['benefits'] as NonNullable<Plan['benefits']> } : {}),
      ...(typeof res['salient'] === 'boolean'                ? { salient: res['salient'] }                       : {}),
      ...(typeof res['hidden'] === 'boolean'                 ? { hidden: res['hidden'] }                         : {}),
    };
  }
}
