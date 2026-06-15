# Module: Auth

> **Note:** The auth system is OTP-only, using the Kavenegar SMS panel to send verification codes. There is no Google OAuth and no email verification flow — neither is planned. Email is an optional profile field only.

All issues below have been fixed.

## Backend

| # | Issue | Severity | File | Status |
|---|-------|----------|------|--------|
| AUTH-B1 | `/auth/make-admin` has no auth or role guard — anyone can promote themselves to admin | 🔴 Blocker | `auth.routes.ts` | ✅ Fixed — route removed; first admin is created via `backend/src/database/seeds/make-admin.ts` (`npm run make-admin <phone_number>`) |
| AUTH-B2 | `secure: false` hardcoded on **all** auth cookies — tokens sent in plain HTTP | 🔴 Blocker | `auth.controller.ts` | ✅ Fixed — `backend/src/shared/utils/cookies.ts` sets `secure: env.nodeEnv === 'production'`, `httpOnly: true`, `sameSite` accordingly |
| AUTH-B3 | JWT `verify()` has no `algorithms` option — vulnerable to algorithm confusion attack | 🔴 Blocker | `auth.jwt.ts` | ✅ Fixed — `{ algorithms: ['HS256'] }` added to all `jwt.verify` calls (`auth.jwt.ts`, `middleware/auth.ts`) |
| AUTH-B4 | `login_log` entity exists but `ip_address` and `user_agent` **never populated** — audit trail is empty | 🟠 Bug | `auth.service.ts` | ✅ Fixed — `verifyOTP` now saves `login_log` with `ip_address`/`user_agent` from request meta |
| AUTH-B5 | Verified/expired OTP codes never deleted — accumulate in DB indefinitely | 🟠 Bug | `auth.service.ts` | ✅ Fixed — OTP row deleted immediately after successful verify; `cleanupOtpCodes()` sweep runs at the start of `sendOTP` |
| AUTH-B6 | `refresh_token.ip_address`, `user_agent`, `last_used_at` never populated | 🟠 Bug | `auth.service.ts` | ✅ Fixed — populated on issue (`generateTokenPair`) and on refresh (`refreshToken` updates `last_used_at`) |
| AUTH-B7 | `user.last_login_at` never updated on login | 🟠 Bug | `auth.service.ts` | ✅ Fixed — `verifyOTP` updates `user.last_login_at` on successful login |
| AUTH-B8 | User created with `full_name: ""` (empty string) instead of `null` | 🟠 Bug | `auth.service.ts` | ✅ Fixed — new users created with `full_name: null`; `user.entity.ts` column made nullable |
| AUTH-B9 | Email uniqueness enforced only at service level — DB unique constraint allows multiple `NULL` emails | 🟡 Incomplete | `user.entity.ts` | ✅ Fixed — `@BeforeInsert/@BeforeUpdate` hook normalizes email to lowercase/trim; `completeProfile`/`updateProfile` normalize before uniqueness check |
| AUTH-B10 | Kavenegar API key passed in query string URL — key visible in proxy/server logs | 🟡 Incomplete | `sms.service.ts` | ✅ Fixed — error handler logs only `error.message`, never the raw `AxiosError` (whose `config.url` embeds the API key) |
| AUTH-B12 | No account deletion endpoint — GDPR/user rights gap | 🟡 Incomplete | `auth.routes.ts` | ✅ Fixed — `DELETE /auth/account` soft-deletes the user (`is_active = false`, `deleted_at`) and revokes all refresh tokens |

## Frontend

| # | Issue | Severity | File | Status |
|---|-------|----------|------|--------|
| AUTH-F1 | `refreshToken` stored in `localStorage` — XSS-readable; httpOnly cookie already handles it | 🔴 Blocker | `auth.service.ts` | ✅ Fixed — `refreshToken` removed from store/localStorage entirely; refresh token lives only in an httpOnly cookie |
| AUTH-F2 | OTP verify form has no client-side attempt limiting — 4-digit code brute-forceable | 🔴 Blocker | `VerifyOTPForm.tsx` | ✅ Fixed — after 5 failed attempts the verify button is disabled with a Persian warning until the user requests a new code |
| AUTH-F3 | `OTPForm` shows plaintext OTP code in a toast (dev mode) — visible on screen | 🟠 Bug | `OTPForm.tsx` | ✅ Fixed — toast now always shows the generic server message, never the OTP code |
| AUTH-F4 | `AuthInitProvider` skips session check when no `refreshToken` in localStorage — misses cookie-only sessions | 🟠 Bug | `AuthInitProvider.tsx` | ✅ Fixed — always calls `getMe()` first, falls back to `refreshToken()` + `getMe()`, then `clearAuth` |
| AUTH-F5 | No automatic token refresh — access token expiry silently breaks all API calls | 🟠 Bug | `auth.service.ts` | ✅ Fixed — `api-client.ts` response interceptor retries once via `POST /auth/refresh` on 401, then logs out on failure |
| AUTH-F6 | `useProtectedRoute` has no SSR guard — causes hydration mismatch and redirect flash | 🟠 Bug | `useProtectedRoute.ts` | ✅ Fixed — waits for `isInitialized` (set by `AuthInitProvider`) before redirecting to `/login` |
| AUTH-F7 | No session management UI — user cannot list or revoke active sessions | 🟡 Incomplete | — | ✅ Fixed — `frontend/src/app/profile/sessions/page.tsx` lists sessions (`GET /auth/sessions`) and revokes them (`DELETE /auth/sessions/:id`), linked from profile nav |
| AUTH-F9 | `CompleteProfileForm` / `EditProfileForm` send empty string for email instead of `null` | 🟡 Incomplete | `CompleteProfileForm.tsx` | ✅ Fixed — both forms send `email: data.email || null` |
