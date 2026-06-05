import type { IHttpClient, RequestOptions } from '../ports/http.js';
import { PabiloError, parsePabiloError } from '../domain/errors.js';

type FetchFn = typeof globalThis.fetch;

export class FetchHttpClient implements IHttpClient {
  private readonly fetchFn: FetchFn;

  constructor(fetchImpl?: FetchFn) {
    this.fetchFn = fetchImpl ?? globalThis.fetch.bind(globalThis);
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const { method, path, body, headers = {} } = options;

    const init: RequestInit = { method, headers: { ...headers } };

    if (body !== undefined) {
      (init.headers as Record<string, string>)['content-type'] = 'application/json';
      init.body = JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await this.fetchFn(path, init);
    } catch (cause) {
      throw new PabiloError({
        message: cause instanceof Error ? cause.message : 'Network request failed',
        code: 'NETWORK_ERROR',
        raw: cause,
      });
    }

    let responseBody: unknown;
    try {
      responseBody = await response.json();
    } catch {
      responseBody = null;
    }

    if (!response.ok) {
      throw parsePabiloError(responseBody, response.status);
    }

    return responseBody as T;
  }
}
