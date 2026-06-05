import type { IHttpClient, RequestOptions } from '../ports/http.js';
import { FetchHttpClient } from './fetch-http-client.js';

export interface PabiloHttpClientOptions {
  apiKey: string;
  baseUrl?: string;
  httpClient?: IHttpClient;
}

const DEFAULT_BASE_URL = 'https://api.pabilo.app';

export class PabiloHttpClient implements IHttpClient {
  private readonly inner: IHttpClient;
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(options: PabiloHttpClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
    this.inner = options.httpClient ?? new FetchHttpClient();
  }

  request<T>(options: RequestOptions): Promise<T> {
    const url = `${this.baseUrl}${options.path}`;
    return this.inner.request<T>({
      ...options,
      path: url,
      headers: {
        ...options.headers,
        appKey: this.apiKey,
      },
    });
  }
}
