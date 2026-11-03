import { HEALTH_TIMEOUT_MS, REQUEST_TIMEOUT_MS } from '@/constants/config';

export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'parse';

export class ApiError extends Error {
  constructor(
    public kind: ApiErrorKind,
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestOptions {
  timeoutMs?: number;
}

export interface ApiClient {
  baseUrl(): string;
  get<T>(path: string, options?: RequestOptions): Promise<T>;
  postJson<T>(path: string, body: unknown, options?: RequestOptions): Promise<T>;
  postForm<T>(path: string, form: FormData, options?: RequestOptions): Promise<T>;
}

export function normalizeBaseUrl(raw: string): string {
  let url = raw.trim();
  if (url && !/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) url = `http://${url}`;
  return url.replace(/^([a-z][a-z0-9+.-]*:\/\/.+?)\/+$/i, '$1');
}

export function isValidBaseUrl(raw: string): boolean {
  try {
    const u = new URL(normalizeBaseUrl(raw));
    return (u.protocol === 'http:' || u.protocol === 'https:') && u.hostname.length > 0;
  } catch {
    return false;
  }
}

export function createApiClient(getBaseUrl: () => string): ApiClient {
  async function request<T>(
    method: 'GET' | 'POST',
    path: string,
    init: { body?: BodyInit; headers?: Record<string, string> },
    options?: RequestOptions,
  ): Promise<T> {
    const base = normalizeBaseUrl(getBaseUrl());
    if (!isValidBaseUrl(base)) {
      throw new ApiError('network', 'The backend URL is not valid. Update it in Settings.');
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options?.timeoutMs ?? REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(`${base}${path}`, {
        method,
        headers: { Accept: 'application/json', ...init.headers },
        body: init.body,
        signal: controller.signal,
      });
      if (!res.ok) {
        let detail = '';
        try {
          const data = await res.json();
          detail = typeof data?.detail === 'string' ? data.detail : '';
        } catch {
          /* ignore body parse errors */
        }
        throw new ApiError(
          'http',
          detail || `The server responded with an error (${res.status}).`,
          res.status,
        );
      }
      try {
        return (await res.json()) as T;
      } catch {
        throw new ApiError('parse', 'The server sent a response the app could not read.');
      }
    } catch (e) {
      if (e instanceof ApiError) throw e;
      if (e instanceof Error && e.name === 'AbortError') {
        throw new ApiError('timeout', 'The server took too long to respond. Please try again.');
      }
      throw new ApiError(
        'network',
        `Can't reach the CircuitAI server at ${base}. Make sure it is running and your phone is on the same Wi-Fi network.`,
      );
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    baseUrl: () => normalizeBaseUrl(getBaseUrl()),
    get: (path, options) => request('GET', path, {}, options),
    postJson: (path, body, options) =>
      request('POST', path, { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }, options),
    // Do not set Content-Type for multipart: fetch adds the boundary itself.
    postForm: (path, form, options) => request('POST', path, { body: form }, options),
  };
}

export const HEALTH_OPTIONS: RequestOptions = { timeoutMs: HEALTH_TIMEOUT_MS };
