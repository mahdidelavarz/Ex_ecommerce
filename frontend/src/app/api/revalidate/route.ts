import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import {
  isStorefrontCacheScope,
  STOREFRONT_REVALIDATION,
  type StorefrontCacheScope,
} from '@/lib/cache-revalidation';

export const dynamic = 'force-dynamic';

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000/api/v1';

type CurrentUserResponse = {
  data?: {
    user?: {
      role?: string;
    };
  };
};

async function isAdminRequest(req: NextRequest): Promise<boolean> {
  const cookie = req.headers.get('cookie');
  if (!cookie || !/^https?:\/\//.test(API_BASE_URL)) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { cookie },
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return false;

    const body = (await response.json()) as CurrentUserResponse;
    return body.data?.user?.role === 'admin';
  } catch {
    return false;
  }
}

/**
 * Admin-only on-demand invalidation. The caller supplies named scopes; paths
 * and tags are resolved from a server-owned allowlist.
 */
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { scopes?: unknown[] };
  const scopes = Array.from(
    new Set((body.scopes ?? []).filter(isStorefrontCacheScope)),
  ) as StorefrontCacheScope[];

  if (scopes.length === 0) {
    return NextResponse.json(
      { message: 'At least one valid cache scope is required' },
      { status: 400 },
    );
  }

  const paths = new Map<string, Parameters<typeof revalidatePath>>();
  const tags = new Set<string>();

  for (const scope of scopes) {
    const config = STOREFRONT_REVALIDATION[scope];
    for (const tag of config.tags) tags.add(tag);
    for (const entry of config.paths) {
      if (typeof entry === 'string') paths.set(entry, [entry]);
      else paths.set(`${entry.path}:${entry.type ?? ''}`, [entry.path, entry.type]);
    }
  }

  // Immediate expiry is intentional after an admin write: the next request
  // blocks once for fresh data instead of showing the old catalog entry.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  for (const args of paths.values()) revalidatePath(...args);

  return NextResponse.json({
    revalidated: true,
    scopes,
    paths: paths.size,
    tags: tags.size,
  });
}
