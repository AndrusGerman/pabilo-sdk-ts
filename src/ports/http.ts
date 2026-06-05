export interface RequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface IHttpClient {
  request<T>(options: RequestOptions): Promise<T>;
}
