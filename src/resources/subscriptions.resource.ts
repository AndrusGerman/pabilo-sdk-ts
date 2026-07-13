import type { IHttpClient } from '../ports/http.js';
import type { ISubscriptionsPort } from '../ports/subscriptions.js';
import type {
  Subscription,
  SubscriptionUniqueProduct,
  SubscriptionUniqueClient,
  CreateSubscriptionRequest,
  ListSubscriptionsRequest,
  SubscriptionsPage,
} from '../domain/types.js';

export class SubscriptionsResource implements ISubscriptionsPort {
  constructor(private readonly http: IHttpClient) {}

  async create(req: CreateSubscriptionRequest): Promise<Subscription> {
    const body: Record<string, unknown> = {
      user_bank_id: req.userBankId,
      pay_first: req.payFirst,
      currency: req.currency ?? 'VEF',
    };
    if (req.name !== undefined) body['name'] = req.name;
    if (req.description !== undefined) body['description'] = req.description;
    if (req.webhookUrl !== undefined) body['webhook_url'] = req.webhookUrl;
    if (req.uniqueProduct !== undefined) body['uniqueProduct'] = req.uniqueProduct;
    if (req.branchProductId !== undefined) body['branchProductId'] = req.branchProductId;
    if (req.uniqueClient !== undefined) body['uniqueClient'] = req.uniqueClient;
    if (req.branchClientId !== undefined) body['branchClientId'] = req.branchClientId;

    const res = await this.http.request<Record<string, unknown>>({
      method: 'POST',
      path: '/v1/subscription/make',
      body,
    });

    return normalizeSubscription(res);
  }

  async cancel(id: string): Promise<Subscription> {
    const res = await this.http.request<Record<string, unknown>>({
      method: 'POST',
      path: `/v1/subscriptions/${id}/cancelbyowner`,
      body: {},
    });
    return normalizeSubscription(res);
  }

  async list(req?: ListSubscriptionsRequest): Promise<SubscriptionsPage> {
    // The backend registers this route with a custom QUERY method (served as POST).
    // Parameters are sent as a JSON body, not query string.
    const body: Record<string, unknown> = {
      page: req?.page ?? 1,
      limit: req?.limit ?? 10,
    };
    if (req?.status !== undefined) body['status'] = req.status;
    if (req?.search !== undefined) body['search'] = req.search;

    const res = await this.http.request<Record<string, unknown>>({
      method: 'POST',
      path: '/me/subscriptions',
      body,
    });

    const raw = Array.isArray(res['subscriptions']) ? res['subscriptions'] : [];
    return {
      items: (raw as unknown[]).map(item => normalizeSubscription(item as Record<string, unknown>)),
      total: typeof res['total'] === 'number' ? res['total'] : 0,
      page: typeof res['page'] === 'number' ? res['page'] : 1,
      limit: typeof res['limit'] === 'number' ? res['limit'] : raw.length,
    };
  }

  async getInfo(id: string): Promise<Subscription> {
    const res = await this.http.request<Record<string, unknown>>({
      method: 'GET',
      path: `/subscriptions/${id}/details`,
    });
    return normalizeSubscription(res);
  }
}

function normalizeSubscription(raw: Record<string, unknown>): Subscription {
  // Shapes: { subscription: {...} } | { data: { subscription: {...} } } | { data: {...} } | root
  const dataWrap = raw['data'] as Record<string, unknown> | undefined;
  const src =
    (raw['subscription'] as Record<string, unknown> | undefined) ??
    (dataWrap?.['subscription'] as Record<string, unknown> | undefined) ??
    dataWrap ??
    raw;

  const uniqueProduct = normalizeUniqueProduct(src['uniqueProduct']);
  const uniqueClient = normalizeUniqueClient(src['uniqueClient']);
  const webhookUrl =
    typeof src['webhook'] === 'string' ? src['webhook'] :
    typeof src['webhook_url'] === 'string' ? src['webhook_url'] : undefined;

  return {
    id: String(src['id'] ?? ''),
    ...(typeof src['name'] === 'string'                   ? { name: src['name'] }                                     : {}),
    ...(typeof src['description'] === 'string'            ? { description: src['description'] }                       : {}),
    ...(typeof src['status'] === 'string'                 ? { status: src['status'] }                                 : {}),
    ...(typeof src['subscriptionPeriodType'] === 'string' ? { subscriptionPeriodType: src['subscriptionPeriodType'] } : {}),
    ...(typeof src['currency'] === 'string'               ? { currency: src['currency'] }                             : {}),
    ...(typeof src['renovationDate'] === 'string'         ? { renovationDate: src['renovationDate'] }                 : {}),
    ...(typeof src['renovationIsPaid'] === 'boolean'      ? { renovationIsPaid: src['renovationIsPaid'] }             : {}),
    ...(typeof src['renovationCount'] === 'number'        ? { renovationCount: src['renovationCount'] }               : {}),
    ...(typeof src['renovationLimitType'] === 'string'    ? { renovationLimitType: src['renovationLimitType'] }       : {}),
    ...(typeof src['clientType'] === 'string'             ? { clientType: src['clientType'] }                         : {}),
    ...(uniqueClient !== undefined                        ? { uniqueClient }                                          : {}),
    ...(typeof src['productType'] === 'string'            ? { productType: src['productType'] }                       : {}),
    ...(uniqueProduct !== undefined                       ? { uniqueProduct }                                         : {}),
    ...(typeof src['branchClientId'] === 'string'         ? { branchClientId: src['branchClientId'] }                 : {}),
    ...(typeof src['branchProductId'] === 'string'        ? { branchProductId: src['branchProductId'] }               : {}),
    ...(typeof src['payFirst'] === 'boolean'              ? { payFirst: src['payFirst'] }                             : {}),
    ...(typeof src['userBankId'] === 'string'             ? { userBankId: src['userBankId'] }                         : {}),
    ...(typeof src['userId'] === 'string'                 ? { userId: src['userId'] }                                 : {}),
    ...(webhookUrl !== undefined                          ? { webhookUrl }                                            : {}),
    ...(typeof src['created_at'] === 'string'             ? { createdAt: src['created_at'] }                          : {}),
    ...(typeof src['updated_at'] === 'string'             ? { updatedAt: src['updated_at'] }                          : {}),
  };
}

function normalizeUniqueProduct(value: unknown): SubscriptionUniqueProduct | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const p = value as Record<string, unknown>;
  if (typeof p['productName'] !== 'string') return undefined;
  return {
    productName: p['productName'],
    productPrice: typeof p['productPrice'] === 'number' ? p['productPrice'] : 0,
    ...(typeof p['productCode'] === 'string' ? { productCode: p['productCode'] } : {}),
  };
}

function normalizeUniqueClient(value: unknown): SubscriptionUniqueClient | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const c = value as Record<string, unknown>;
  if (typeof c['clientName'] !== 'string') return undefined;
  return {
    clientName: c['clientName'],
    clientPhone: typeof c['clientPhone'] === 'string' ? c['clientPhone'] : '',
    ...(typeof c['clientCode'] === 'string' ? { clientCode: c['clientCode'] } : {}),
  };
}
