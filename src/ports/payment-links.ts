import type {
  PaymentLink,
  CreatePaymentLinkRequest,
  UpdatePaymentLinkRequest,
} from '../domain/types.js';

export interface IPaymentLinksPort {
  create(req: CreatePaymentLinkRequest): Promise<PaymentLink>;
  update(id: string, req: UpdatePaymentLinkRequest): Promise<PaymentLink>;
  getInfo(id: string): Promise<PaymentLink>;
  isPaid(id: string): Promise<boolean>;
}
