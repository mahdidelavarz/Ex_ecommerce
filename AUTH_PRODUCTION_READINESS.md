# Auth System Production Readiness Plan

## Context
The Ex_ecommerce project uses OTP-based (passwordless) authentication with JWT tokens for an Iranian e-commerce platform. The system is built with Node.js/Express, TypeORM, and PostgreSQL. While the architecture is solid (refresh token rotation, httpOnly cookies, bcrypt hashing, Zod validation, role-based access), a security audit reveals **5 critical issues** and several medium/low issues that must be resolved before production deployment.

---

## Issues Found (by severity)

### CRITICAL

| # | Issue | File | Line |
|---|-------|------|------|
| C1 | OTP generated with `Math.random()` (not cryptographically secure) | `backend/src/modules/auth/sms.service.ts` | 78 |
| C2 | Database SSL has `rejectUnauthorized: false` (negates TLS security entirely) | `backend/src/config/database.ts` | ~30 |
| C3 | Hardcoded DB password `"123"` in `docker-compose.dev.yml` | `backend/docker-compose.dev.yml` | — |
| C4 | Error handler logs raw `req.body` / `req.params` (leaks OTP codes, tokens, PII) | `backend/src/middleware/errorHandler.ts` | ~50 |
| C5 | `Set-Cookie` in CORS `exposedHeaders` (security anti-pattern) | `backend/src/config/cors.ts` | — |

### HIGH

| # | Issue | File |
|---|-------|------|
| H1 | Dev OTP exposed in API response body AND as non-httpOnly `dev_otp` cookie (JS-readable) | `auth.controller.ts:38-46`, `auth.service.ts:76` |
| H2 | Kavenegar API key not validated at startup via Zod schema | `sms.service.ts:15`, `env.ts` |
| H3 | No rate limiting on `POST /auth/refresh` endpoint (allows token enumeration) | `auth.routes.ts` |
| H4 | Refresh token lookup is O(n) — linear scan with bcrypt per token, no index | `auth.service.ts:183-203` |

### MEDIUM

| # | Issue | File |
|---|-------|------|
| M1 | `email` column lacks DB-level `UNIQUE` constraint (only app-level check, race condition) | `user.entity.ts` |
| M2 | `cleanupOtpCodes()` runs synchronously on every `sendOTP` call (blocks hot path at scale) | `auth.service.ts:29-36, 44` |
| M3 | Admin self-demotion guard checks wrong condition (`role !== ADMIN` instead of protecting all admin demotions) | `user.service.ts:71-74` |
| M4 | File upload filenames use `Math.random()` (not cryptographically secure) | `upload.ts` |
| M5 | `req.ip` used for IP logging without `trust proxy` config (spoofable behind load balancer) | `auth.controller.ts:18`, `app.ts` |
| M6 | Bcrypt rounds hardcoded to `10` inline (not a named constant, hard to audit/update) | `auth.service.ts:64, 447` |

### LOW

| # | Issue | File |
|---|-------|------|
| L1 | No automated test coverage for auth flows | N/A |
| L2 | Failed OTP attempts not recorded in login logs (limits audit trail) | `auth.service.ts:154-161` |
| L3 | No user action audit log for admin operations (role changes, account deletions) | `user.service.ts` |

---

## Implementation Plan

### Phase 1 — Critical Fixes (must ship before production)

#### C1: Fix OTP generation with crypto
**File:** `backend/src/modules/auth/sms.service.ts`

Replace `Math.floor(1000 + Math.random() * 9000)` with:
```typescript
import { randomInt } from 'crypto';
// ...
static generateOTP(): string {
  return randomInt(1000, 10000).toString();
}
```

#### C2: Fix database SSL validation
**File:** `backend/src/config/database.ts`

Change:
```typescript
ssl: env.db.ssl ? { rejectUnauthorized: false } : false,
```
To:
```typescript
ssl: env.db.ssl ? { rejectUnauthorized: true } : false,
```
Also update `env.ts` Zod schema to add `DB_SSL_CA` optional field for custom CA certs.

#### C3: Remove hardcoded credentials from docker-compose
**File:** `backend/docker-compose.dev.yml`

Replace hardcoded `"123"` passwords with `${POSTGRES_PASSWORD}` referencing `.env`.
Add a `.env.example` file documenting required variables.

#### C4: Sanitize request body before error logging
**File:** `backend/src/middleware/errorHandler.ts`

Before logging `req.body`, strip sensitive fields:
```typescript
const SENSITIVE_KEYS = ['otp_code', 'token', 'password', 'authorization'];
function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body;
  return Object.fromEntries(
    Object.entries(body as Record<string, unknown>).map(([k, v]) =>
      SENSITIVE_KEYS.includes(k.toLowerCase()) ? [k, '[REDACTED]'] : [k, v]
    )
  );
}
```

#### C5: Remove `Set-Cookie` from CORS `exposedHeaders`
**File:** `backend/src/config/cors.ts`

Remove `exposedHeaders: ['Set-Cookie']`. Cookies are set via `Set-Cookie` response header automatically; exposing it in CORS allows JS to observe it.

---

### Phase 2 — High Priority Fixes

#### H1: Restrict dev OTP exposure to logs only
**Files:** `auth.service.ts:76-81`, `auth.controller.ts:38-46`

- Remove the `otpCode` field from the API response (even in dev mode)
- Remove the `dev_otp` non-httpOnly cookie from `auth.controller.ts`
- Keep the `logger.info()` in `sms.service.ts` (console/log-only is acceptable for dev)
- Guard with: only log to console, never return in HTTP response

#### H2: Add Kavenegar keys to Zod env validation
**File:** `backend/src/config/env.ts`

Add to `envSchema`:
```typescript
KAVENEGAR_API_KEY: z.string().min(10).optional(),
KAVENEGAR_SENDER: z.string().min(1).optional(),
```
Update `SMSService` to read from `env` object instead of `process.env` directly. Validate these are set when `NODE_ENV === 'production'`.

#### H3: Add rate limiting to token refresh endpoint
**File:** `backend/src/modules/auth/auth.routes.ts`

Apply `authLimiter` to `POST /refresh`:
```typescript
router.post('/refresh', authLimiter, validate(...), controller.refreshToken);
```

#### H4: Add DB index on refresh token for faster lookup
**File:** `backend/src/database/entities/refresh-token.entity.ts`

Add composite index:
```typescript
@Index(['user_id', 'revoked'])
```
This speeds up the `find({ where: { user_id, revoked: false } })` query from a full table scan to an index scan.

---

### Phase 3 — Medium Priority Fixes

#### M1: Add DB-level unique constraint on email
**File:** `backend/src/database/entities/user.entity.ts`

Change the email column decorator:
```typescript
@Column({ type: 'text', unique: true, nullable: true })
email: string | null;
```
Create a migration for this. The `nullable: true` + `unique: true` combination is handled by PostgreSQL with a partial index (NULLs are not considered equal, so multiple NULLs are allowed).

#### M2: Run OTP cleanup asynchronously (fire-and-forget)
**File:** `backend/src/modules/auth/auth.service.ts`

Change the `sendOTP` method to not `await` the cleanup:
```typescript
void this.cleanupOtpCodes(); // fire-and-forget, non-blocking
```
Or move cleanup to a scheduled job (cron).

#### M3: Fix admin self-demotion guard
**File:** `backend/src/modules/users/user.service.ts:71-74`

Fix the condition to prevent any admin from demoting themselves:
```typescript
if (id === actingUserId) {
  throw new BadRequestError('نمی‌توانید نقش خود را تغییر دهید');
}
```

#### M4: Use `crypto.randomBytes` for upload filenames
**File:** `backend/src/middleware/upload.ts`

Replace `Math.random()` with:
```typescript
import { randomBytes } from 'crypto';
// ...
`${Date.now()}-${randomBytes(8).toString('hex')}${ext}`
```

#### M5: Enable Express `trust proxy` for correct IP extraction
**File:** `backend/src/app.ts`

Add early in app setup:
```typescript
app.set('trust proxy', 1); // trust first proxy (load balancer)
```
This makes `req.ip` return the real client IP from `X-Forwarded-For`.

#### M6: Extract bcrypt rounds to named constant
**File:** `backend/src/shared/constants/config.constants.ts`

Add:
```typescript
BCRYPT_ROUNDS: 12,
```
Update all `bcrypt.hash(value, 10)` calls in `auth.service.ts` to use `AUTH.BCRYPT_ROUNDS`.

---

### Phase 4 — Low Priority Improvements

#### L1: Add integration tests for auth flows
Create `backend/src/__tests__/auth.test.ts` using Jest + supertest covering:
- Send OTP (valid/invalid phone)
- Verify OTP (valid, expired, max attempts exceeded)
- Token refresh (valid, revoked, expired)
- Protected route access (authenticated, unauthenticated)
- Logout (single session, all sessions)

#### L2: Log failed OTP attempts
**File:** `backend/src/modules/auth/auth.service.ts`

Save a `LoginLog` record on failed verification with a `success: false` flag. This requires adding a `success` boolean column to `login-log.entity.ts`.

#### L3: Add admin audit log on sensitive operations
Create a `UserAuditLog` entity that records who changed what (role changes, account activation/deactivation, admin deletion) with timestamps and `acting_user_id`.

---

## Files to Modify

| File | Changes |
|------|---------|
| `backend/src/modules/auth/sms.service.ts` | C1: crypto OTP, H2: use env obj |
| `backend/src/config/database.ts` | C2: `rejectUnauthorized: true` |
| `backend/docker-compose.dev.yml` | C3: remove hardcoded passwords |
| `backend/src/middleware/errorHandler.ts` | C4: sanitize body before logging |
| `backend/src/config/cors.ts` | C5: remove `exposedHeaders: ['Set-Cookie']` |
| `backend/src/modules/auth/auth.service.ts` | H1: remove OTP from response, M2: async cleanup, M6: constant rounds |
| `backend/src/modules/auth/auth.controller.ts` | H1: remove `dev_otp` cookie |
| `backend/src/config/env.ts` | H2: add Kavenegar keys to Zod schema |
| `backend/src/modules/auth/auth.routes.ts` | H3: rate limit refresh endpoint |
| `backend/src/database/entities/refresh-token.entity.ts` | H4: add composite index |
| `backend/src/database/entities/user.entity.ts` | M1: unique constraint on email |
| `backend/src/modules/users/user.service.ts` | M3: fix self-demotion guard |
| `backend/src/middleware/upload.ts` | M4: crypto filenames |
| `backend/src/app.ts` | M5: `trust proxy` setting |
| `backend/src/shared/constants/config.constants.ts` | M6: add `BCRYPT_ROUNDS` constant |

---

## Verification Steps

1. **C1 (OTP crypto):** Start server in dev, call `/auth/send-otp` — OTP should appear only in server logs, not in response body.
2. **C2 (DB SSL):** Deploy with `DB_SSL=true` and a proper CA cert; connection should succeed without errors.
3. **C3 (docker passwords):** Run `grep -r '"123"' docker-compose*` — should return no results.
4. **C4 (error log sanitization):** Trigger a validation error with `otp_code` in body; check logs for `[REDACTED]`.
5. **H3 (refresh rate limit):** Send 6+ requests to `/auth/refresh` within 15 min from same IP — 6th should return 429.
6. **H4 (DB index):** Run `EXPLAIN ANALYZE` on the refresh token query — should show index scan, not seq scan.
7. **M1 (email unique):** Attempt two concurrent profile completions with same email — second should fail with DB constraint error.
8. **Run full test suite** after changes: `cd backend && npm test`.
