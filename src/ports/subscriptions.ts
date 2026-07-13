import type {
  Subscription,
  CreateSubscriptionRequest,
  ListSubscriptionsRequest,
  SubscriptionsPage,
} from '../domain/types.js';

export interface ISubscriptionsPort {
  /** Create a subscription. Its webhookUrl is propagated to every renovation payment link. */
  create(req: CreateSubscriptionRequest): Promise<Subscription>;
  /** Cancel a subscription (owner action). Also cancels its pending renovation links. */
  cancel(id: string): Promise<Subscription>;
  /** List the authenticated user's subscriptions (paginated). */
  list(req?: ListSubscriptionsRequest): Promise<SubscriptionsPage>;
  /** Get a subscription's details by id. */
  getInfo(id: string): Promise<Subscription>;
}
