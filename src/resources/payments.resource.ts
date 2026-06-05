import type { IHttpClient } from '../ports/http.js';
import type { IPaymentsPort } from '../ports/payments.js';
import type { VerifyPaymentRequest, VerifyPaymentResult, PaymentData } from '../domain/types.js';

export class PaymentsResource implements IPaymentsPort {
  constructor(private readonly http: IHttpClient) {}

  async verify(userBankId: string, req: VerifyPaymentRequest): Promise<VerifyPaymentResult> {
    // This endpoint returns HTTP 200 even for domain errors (BANK_NOT_AVAILABLE, PAYMENT_NOT_FOUND).
    // We read the raw response and interpret it ourselves instead of letting the HTTP client throw.
    const res = await this.http.request<Record<string, unknown>>({
      method: 'POST',
      path: `/userbankpayment/${userBankId}/betaserio`,
      body: {
        amount: req.amount,
        bank_reference: req.bankReference,
        movement_type: req.movementType ?? 'GENERIC',
      },
    });

    if (res['error'] === 'BANK_NOT_AVAILABLE') {
      return { found: false, reason: 'BANK_NOT_AVAILABLE' };
    }

    if (res['error'] === 'PAYMENT_NOT_FOUND') {
      return { found: false, reason: 'PAYMENT_NOT_FOUND' };
    }

    const data = res['data'] as Record<string, unknown> | undefined;
    if (data !== undefined) {
      return {
        found: true,
        isNew: data['is_new'] === true,
        data: data as PaymentData,
      };
    }

    return { found: false, reason: 'PAYMENT_NOT_FOUND' };
  }
}
