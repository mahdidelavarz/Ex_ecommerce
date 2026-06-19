import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const origin  = req.headers.origin as string | undefined;
  const referer = req.headers.referer as string | undefined;

  // No browser signal → non-browser client (server-to-server, Postman) — allow
  if (!origin && !referer) {
    return next();
  }

  let requestOrigin: string | null = origin ?? null;

  if (!requestOrigin && referer) {
    try {
      requestOrigin = new URL(referer).origin;
    } catch {
      requestOrigin = null;
    }
  }

  if (requestOrigin === env.cors.origin) {
    return next();
  }

  res.status(403).json({
    success: false,
    statusCode: 403,
    message: 'CSRF validation failed',
  });
}
