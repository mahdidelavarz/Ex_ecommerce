export const LOGIN_PATH = '/login';

function normalizePathname(pathname: string): string {
  const [pathOnly] = pathname.split('?');
  const normalized = pathOnly.replace(/\/+$/, '');
  return normalized || '/';
}

export function isPublicRoute(pathname: string): boolean {
  const normalized = normalizePathname(pathname);

  return (
    normalized === '/' ||
    normalized === LOGIN_PATH ||
    normalized === '/cart' ||
    normalized === '/products' ||
    normalized.startsWith('/products/')
  );
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
