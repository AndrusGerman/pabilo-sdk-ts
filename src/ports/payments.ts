import type { VerifyPaymentRequest, VerifyPaymentResult } from '../domain/types.js';

export interface IPaymentsPort {
  verify(userBankId: string, req: VerifyPaymentRequest): Promise<VerifyPaymentResult>;
}
