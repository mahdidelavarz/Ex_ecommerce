export const LOGIN_PATH = '/login';

const PROTECTED_ROUTE_PREFIXES = [
  '/admin',
  '/checkout',
  '/orders',
  '/profile',
  '/returns',
  '/wishlist',
] as const;

function normalizePathname(pathname: string): string {
  const [pathOnly] = pathname.split('?');
  const normalized = pathOnly.replace(/\/+$/, '');
  return normalized || '/';
}

function matchesRoutePrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isProtectedRoute(pathname: string): boolean {
  const normalized = normalizePathname(pathname);

  return PROTECTED_ROUTE_PREFIXES.some((prefix) =>
    matchesRoutePrefix(normalized, prefix)
  );
}

export function isPublicRoute(pathname: string): boolean {
  return !isProtectedRoute(pathname);
}

export function getLoginRedirectPath(currentPath: string): string {
  return `${LOGIN_PATH}?redirect=${encodeURIComponent(currentPath)}`;
}

export function getSafeRedirectPath(redirectPath: string | null): string {
  if (
    !redirectPath ||
    !redirectPath.startsWith('/') ||
    redirectPath.startsWith('//') ||
    normalizePathname(redirectPath) === LOGIN_PATH
  ) {
    return '/';
  }

  return redirectPath;
}
