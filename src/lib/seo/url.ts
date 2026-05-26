import { seoRoutes, seoSite, type SeoRouteRecord } from '../../data/seo/site';

export function normalizePath(path = '/'): string {
  if (!path.startsWith('/')) return normalizePath('/' + path);
  if (path === '/index.html') return '/';
  if (!path.includes('.') && !path.endsWith('/')) return `${path}/`;
  return path;
}

export function canonicalUrl(path = '/'): string {
  return new URL(normalizePath(path), seoSite.canonicalDomain).toString();
}

export function assetUrl(path = seoSite.defaultImage): string {
  return new URL(path, seoSite.canonicalDomain).toString();
}

export function routeForPath(path = '/'): SeoRouteRecord | undefined {
  const normalized = normalizePath(path);
  return seoRoutes.find((route) => route.path === normalized);
}

export function routeOrFallback(path = '/', fallback?: Partial<SeoRouteRecord>): SeoRouteRecord {
  const normalized = normalizePath(path);
  const found = routeForPath(normalized);
  if (found) return found;
  return {
    path: normalized,
    title: fallback?.title ?? seoSite.name,
    description: fallback?.description ?? seoSite.description,
    family: fallback?.family ?? 'service',
    language: 'en',
  };
}
