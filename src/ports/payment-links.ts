import type {
  PaymentLink,
  CreatePaymentLinkRequest,
  UpdatePaymentLinkRequest,
  ListPaymentLinksRequest,
  PaymentLinksPage,
} from '../domain/types.js';

export interface IPaymentLinksPort {
  list(req?: ListPaymentLinksRequest): Promise<PaymentLinksPage>;
  create(req: CreatePaymentLinkRequest): Promise<PaymentLink>;
  update(id: string, req: UpdatePaymentLinkRequest): Promise<PaymentLink>;
  getInfo(id: string): Promise<PaymentLink>;
  isPaid(id: string): Promise<boolean>;
}
