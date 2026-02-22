/**
 * OnHyper proxy helpers.
 */

/**
 * Returns true when a URL points to an OnHyper-style local proxy path.
 */
export function isProxyBaseUrl(baseUrl: string): boolean {
  if (baseUrl.startsWith('/proxy/')) {
    return true;
  }

  try {
    const parsed = new URL(baseUrl);
    return parsed.pathname.startsWith('/proxy/');
  } catch {
    return false;
  }
}

/**
 * Resolve proxy base URL for hosted OnHyper subdomains.
 *
 * On subdomain hosts (`*.onhyper.io`), requests to `/proxy/*` can be
 * intercepted by app routing. Route proxy calls through `onhyper.io` root.
 */
export function resolveOnHyperProxyBaseUrl(baseUrl: string): string {
  if (!baseUrl.startsWith('/proxy/')) {
    return baseUrl;
  }

  if (typeof window === 'undefined') {
    return baseUrl;
  }

  const host = window.location.hostname;
  const isOnHyperSubdomain = host.endsWith('.onhyper.io') && host !== 'onhyper.io';

  if (!isOnHyperSubdomain) {
    return baseUrl;
  }

  return `https://onhyper.io${baseUrl}`;
}

/**
 * Resolve app slug for `X-App-Slug` routing.
 */
export function resolveOnHyperAppSlug(): string | undefined {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_ONHYPER_APP_SLUG;
  }

  const pathMatch = window.location.pathname.match(/\/a\/([^/]+)/);
  if (pathMatch?.[1]) {
    return pathMatch[1];
  }

  const host = window.location.hostname;
  if (host.endsWith('.onhyper.io') && host !== 'onhyper.io') {
    return host.replace(/\.onhyper\.io$/, '');
  }

  const configuredSlug = process.env.NEXT_PUBLIC_ONHYPER_APP_SLUG;
  if (configuredSlug) {
    return configuredSlug;
  }

  return undefined;
}

/**
 * Adds proxy headers expected by OnHyper.
 */
export function withOnHyperHeaders(
  headers: Record<string, string>,
  baseUrl: string
): Record<string, string> {
  if (!isProxyBaseUrl(baseUrl)) {
    return headers;
  }

  const slug = resolveOnHyperAppSlug();
  if (!slug) {
    return headers;
  }

  return {
    ...headers,
    'X-App-Slug': slug,
  };
}
