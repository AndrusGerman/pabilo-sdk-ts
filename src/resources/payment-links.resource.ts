import type { IHttpClient } from '../ports/http.js';
import type { IPaymentLinksPort } from '../ports/payment-links.js';
import type {
  PaymentLink,
  CreatePaymentLinkRequest,
  UpdatePaymentLinkRequest,
} from '../domain/types.js';

export class PaymentLinksResource implements IPaymentLinksPort {
  constructor(private readonly http: IHttpClient) {}

  async create(req: CreatePaymentLinkRequest): Promise<PaymentLink> {
    const body: Record<string, unknown> = {
      amount: req.amount,
      description: req.description,
      user_bank_id: req.userBankId,
      currency: req.currency ?? 'VES',
    };
    if (req.redirectUrl !== undefined) body['redirect_url'] = req.redirectUrl;
    if (req.webhookUrl !== undefined) body['webhook_url'] = req.webhookUrl;
    if (req.notificationByWhatsapp !== undefined) body['notification_by_whastapp'] = req.notificationByWhatsapp;
    if (req.name !== undefined) body['name'] = req.name;
    if (req.isUsd !== undefined) body['is_usd'] = req.isUsd;
    if (req.metadata !== undefined) body['metadata'] = req.metadata;

    const res = await this.http.request<Record<string, unknown>>({
      method: 'POST',
      path: '/v1/paymentlink',
      body,
    });

    return normalizePaymentLink(res);
  }

  async update(id: string, req: UpdatePaymentLinkRequest): Promise<PaymentLink> {
    const body: Record<string, unknown> = {};
    if (req.amount !== undefined) body['amount'] = req.amount;
    if (req.description !== undefined) body['description'] = req.description;
    if (req.redirectUrl !== undefined) body['redirect_url'] = req.redirectUrl;
    if (req.currency !== undefined) body['currency'] = req.currency;

    const res = await this.http.request<Record<string, unknown>>({
      method: 'PATCH',
      path: `/paymentlink/${id}/patch`,
      body,
    });

    return normalizePaymentLink(res);
  }

  async isPaid(id: string): Promise<boolean> {
    const info = await this.getInfo(id);
    return info.status === 'paid';
  }

  async getInfo(id: string): Promise<PaymentLink> {
    const res = await this.http.request<Record<string, unknown>>({
      method: 'GET',
      path: `/paymentlink/${id}/info`,
    });
    return normalizePaymentLink(res);
  }
}

function normalizePaymentLink(raw: Record<string, unknown>): PaymentLink {
  // Shapes: { paymentlink: {...} } | { data: { payment_link: {...} } } | { data: {...} } | root
  const dataWrap = raw['data'] as Record<string, unknown> | undefined;
  const src =
    (raw['paymentlink'] as Record<string, unknown> | undefined) ??
    (dataWrap?.['payment_link'] as Record<string, unknown> | undefined) ??
    dataWrap ??
    raw;

  const userId = typeof src['user_id'] === 'string' ? src['user_id'] :
                 typeof src['userId'] === 'string' ? src['userId'] : undefined;

  return {
    id: String(src['id'] ?? ''),
    url: String(src['url'] ?? ''),
    ...(typeof src['amount'] === 'number'                 ? { amount: src['amount'] }                             : {}),
    ...(typeof src['status'] === 'string'                 ? { status: src['status'] }                             : {}),
    ...(typeof src['type'] === 'string'                   ? { type: src['type'] }                                 : {}),
    ...(userId !== undefined                              ? { userId }                                             : {}),
    ...(typeof src['name'] === 'string'                   ? { name: src['name'] }                                 : {}),
    ...(typeof src['description'] === 'string'            ? { description: src['description'] }                   : {}),
    ...(typeof src['is_usd'] === 'boolean'                ? { isUsd: src['is_usd'] }                              : {}),
    ...(typeof src['redirect_url'] === 'string'           ? { redirectUrl: src['redirect_url'] }                  : {}),
    ...(typeof src['webhook_url'] === 'string'            ? { webhookUrl: src['webhook_url'] }                    : {}),
    ...(typeof src['notification_by_whastapp'] === 'boolean' ? { notificationByWhatsapp: src['notification_by_whastapp'] } : {}),
    ...(typeof src['expiration_time'] === 'number'        ? { expirationTime: src['expiration_time'] }            : {}),
    ...(typeof src['payment_link_origin'] === 'string'    ? { paymentLinkOrigin: src['payment_link_origin'] }    : {}),
    ...(typeof src['created_at'] === 'string'             ? { createdAt: src['created_at'] }                     : {}),
    ...(typeof src['updated_at'] === 'string'             ? { updatedAt: src['updated_at'] }                     : {}),
  };
}
