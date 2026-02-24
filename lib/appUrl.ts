import { NextRequest } from 'next/server';

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function firstHeaderValue(value: string | null): string {
  if (!value) return '';
  return value.split(',')[0]?.trim() || '';
}

function isLocalHost(host: string): boolean {
  return host.startsWith('localhost') || host.startsWith('127.0.0.1');
}

export function getAppBaseUrl(req: NextRequest): string {
  const configured = (process.env.NEXTAUTH_URL || '').trim();
  if (configured) {
    try {
      const parsed = new URL(configured);
      const shouldIgnoreConfiguredInProd =
        process.env.NODE_ENV === 'production' && isLocalHost(parsed.hostname);
      if (!shouldIgnoreConfiguredInProd) {
        return trimTrailingSlash(configured);
      }
    } catch {
      // Ignore invalid NEXTAUTH_URL and fall back to request headers.
    }
  }

  const forwardedHost = firstHeaderValue(req.headers.get('x-forwarded-host'));
  const host = forwardedHost || firstHeaderValue(req.headers.get('host'));
  if (host) {
    const forwardedProto = firstHeaderValue(req.headers.get('x-forwarded-proto'));
    const proto = forwardedProto || (isLocalHost(host) ? 'http' : 'https');
    return `${proto}://${host}`;
  }

  return trimTrailingSlash(req.nextUrl.origin);
}

export function buildAppUrl(req: NextRequest, pathWithQuery: string): URL {
  return new URL(pathWithQuery, `${getAppBaseUrl(req)}/`);
}
