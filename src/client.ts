import { PabiloHttpClient } from './infrastructure/pabilo-http-client.js';
import { BankAccountsResource } from './resources/bank-accounts.resource.js';
import { PaymentLinksResource } from './resources/payment-links.resource.js';
import { PaymentsResource } from './resources/payments.resource.js';
import { SubscriptionsResource } from './resources/subscriptions.resource.js';
import { MeResource } from './resources/me.resource.js';
import type { IHttpClient } from './ports/http.js';
import type { IBankAccountsPort } from './ports/bank-accounts.js';
import type { IPaymentLinksPort } from './ports/payment-links.js';
import type { IPaymentsPort } from './ports/payments.js';
import type { ISubscriptionsPort } from './ports/subscriptions.js';
import type { IMePort } from './ports/me.js';

export interface PabiloClientOptions {
  apiKey: string;
  baseUrl?: string;
  httpClient?: IHttpClient;
}

export class PabiloClient {
  readonly me: IMePort;
  readonly bankAccounts: IBankAccountsPort;
  readonly paymentLinks: IPaymentLinksPort;
  readonly payments: IPaymentsPort;
  readonly subscriptions: ISubscriptionsPort;

  constructor(options: PabiloClientOptions) {
    const http: IHttpClient = options.httpClient ?? new PabiloHttpClient({
      apiKey: options.apiKey,
      ...(options.baseUrl !== undefined ? { baseUrl: options.baseUrl } : {}),
    });

    this.me = new MeResource(http);
    this.bankAccounts = new BankAccountsResource(http);
    this.paymentLinks = new PaymentLinksResource(http);
    this.payments = new PaymentsResource(http);
    this.subscriptions = new SubscriptionsResource(http);
  }
}
