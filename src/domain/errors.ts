export class PabiloError extends Error {
  readonly code: string;
  readonly statusCode: number | undefined;
  readonly raw: unknown;

  constructor(opts: {
    message: string;
    code: string;
    statusCode?: number;
    raw?: unknown;
  }) {
    super(opts.message);
    this.name = 'PabiloError';
    this.code = opts.code;
    this.statusCode = opts.statusCode;
    this.raw = opts.raw;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function parsePabiloError(body: unknown, statusCode: number): PabiloError {
  if (statusCode === 401) {
    return new PabiloError({ message: 'Unauthorized', code: 'UNAUTHORIZED', statusCode, raw: body });
  }
  if (statusCode === 404) {
    return new PabiloError({ message: 'Not found', code: 'NOT_FOUND', statusCode, raw: body });
  }

  if (body !== null && typeof body === 'object') {
    const b = body as Record<string, unknown>;
    const code = typeof b['error'] === 'string' ? b['error'] : resolveCodeFromStatus(statusCode);
    const message = typeof b['message'] === 'string' ? b['message'] : code;
    return new PabiloError({ message, code, statusCode, raw: body });
  }

  const code = resolveCodeFromStatus(statusCode);
  return new PabiloError({ message: code, code, statusCode, raw: body });
}

function resolveCodeFromStatus(statusCode: number): string {
  if (statusCode >= 500) return 'INTERNAL_SERVER_ERROR';
  if (statusCode === 400) return 'BAD_REQUEST';
  return 'REQUEST_FAILED';
}
