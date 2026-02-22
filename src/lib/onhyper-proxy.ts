/**
 * OnHyper proxy helpers.
 */

/**
 * Returns true when a URL points to an OnHyper-style local proxy path.
 */
export function isProxyBaseUrl(baseUrl: string): boolean {
  return baseUrl.startsWith('/proxy/');
}

/**
 * Resolve app slug for `X-App-Slug` routing.
 */
export function resolveOnHyperAppSlug(): string | undefined {
  const configuredSlug = process.env.NEXT_PUBLIC_ONHYPER_APP_SLUG;
  if (configuredSlug) {
    return configuredSlug;
  }

  if (typeof window === 'undefined') {
    return undefined;
  }

  const pathMatch = window.location.pathname.match(/\/a\/([^/]+)/);
  if (pathMatch?.[1]) {
    return pathMatch[1];
  }

  const host = window.location.hostname;
  if (host.endsWith('.onhyper.io') && host !== 'onhyper.io') {
    return host.replace(/\.onhyper\.io$/, '');
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
