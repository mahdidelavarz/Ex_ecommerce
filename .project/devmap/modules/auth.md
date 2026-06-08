# Module: Auth

## Backend

| # | Issue | Severity | File |
|---|-------|----------|------|
| AUTH-B1 | `/auth/make-admin` has no auth or role guard — anyone can promote themselves to admin | 🔴 Blocker | `auth.routes.ts:29` |
| AUTH-B2 | `secure: false` hardcoded on **all** auth cookies — tokens sent in plain HTTP | 🔴 Blocker | `auth.controller.ts:72` |
| AUTH-B3 | JWT `verify()` has no `algorithms` option — vulnerable to algorithm confusion attack | 🔴 Blocker | `auth.jwt.ts` |
| AUTH-B4 | `login_log` entity exists but `ip_address` and `user_agent` **never populated** — audit trail is empty | 🟠 Bug | `auth.service.ts` |
| AUTH-B5 | Verified/expired OTP codes never deleted — accumulate in DB indefinitely | 🟠 Bug | `auth.service.ts` |
| AUTH-B6 | `refresh_token.ip_address`, `user_agent`, `last_used_at` never populated | 🟠 Bug | `auth.service.ts` |
| AUTH-B7 | `user.last_login_at` never updated on login | 🟠 Bug | `auth.service.ts` |
| AUTH-B8 | User created with `full_name: ""` (empty string) instead of `null` | 🟠 Bug | `auth.service.ts:123` |
| AUTH-B9 | Email uniqueness enforced only at service level — DB unique constraint allows multiple `NULL` emails | 🟡 Incomplete | `user.entity.ts` |
| AUTH-B10 | Kavenegar API key passed in query string URL — key visible in proxy/server logs | 🟡 Incomplete | `sms.service.ts:34` |
| AUTH-B11 | Google OAuth callback (`GET /auth/callback`) is a placeholder — no implementation | 🟡 Incomplete | `auth.controller.ts` |
| AUTH-B12 | No account deletion endpoint — GDPR/user rights gap | 🟡 Incomplete | `auth.routes.ts` |

## Frontend

| # | Issue | Severity | File |
|---|-------|----------|------|
| AUTH-F1 | `refreshToken` stored in `localStorage` — XSS-readable; httpOnly cookie already handles it | 🔴 Blocker | `auth.service.ts:36` |
| AUTH-F2 | OTP verify form has no client-side attempt limiting — 4-digit code brute-forceable | 🔴 Blocker | `VerifyOTPForm.tsx` |
| AUTH-F3 | `OTPForm` shows plaintext OTP code in a toast (dev mode) — visible on screen | 🟠 Bug | `OTPForm.tsx:47` |
| AUTH-F4 | `AuthInitProvider` skips session check when no `refreshToken` in localStorage — misses cookie-only sessions | 🟠 Bug | `AuthInitProvider.tsx:17` |
| AUTH-F5 | No automatic token refresh — access token expiry silently breaks all API calls | 🟠 Bug | `auth.service.ts` |
| AUTH-F6 | `useProtectedRoute` has no SSR guard — causes hydration mismatch and redirect flash | 🟠 Bug | `useProtectedRoute.ts:18` |
| AUTH-F7 | No session management UI — user cannot list or revoke active sessions | 🟡 Incomplete | — |
| AUTH-F8 | No email verification flow — email collected but never confirmed | 🟡 Incomplete | — |
| AUTH-F9 | `CompleteProfileForm` / `EditProfileForm` send empty string for email instead of `null` | 🟡 Incomplete | `CompleteProfileForm.tsx:48` |

## Fix Solutions

### AUTH-B1 — Remove or guard `/auth/make-admin`
```ts
// auth.routes.ts — delete the route before going to production.
// For bootstrapping the first admin, use a one-time seed script instead:
// backend/src/database/seeds/make-admin.ts
//   npx ts-node src/database/seeds/make-admin.ts 09123456789
```

### AUTH-B2 — Fix cookie `secure` flag
```ts
// auth.controller.ts — apply to all 3 cookie-setting locations:
const isProd = env.nodeEnv === 'production';
res.cookie('accessToken', tokens.accessToken, {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'strict' : 'lax',
  maxAge: 15 * 60 * 1000,
  path: '/',
});
```

### AUTH-B3 — Lock JWT algorithm
```ts
// auth.jwt.ts
// BEFORE:
jwt.verify(token, secret)

// AFTER:
jwt.verify(token, secret, { algorithms: ['HS256'] })
```

### AUTH-B4 + AUTH-B6 + AUTH-B7 — Populate audit fields on login
```ts
// auth.controller.ts — pass request metadata to service:
await this.authService.verifyOTP(dto.phone_number, dto.otp_code, {
  ipAddress: req.ip ?? req.socket.remoteAddress ?? '',
  userAgent: req.headers['user-agent'] ?? '',
});

// auth.service.ts — use them:
async verifyOTP(phone: string, code: string, meta: { ipAddress: string; userAgent: string }) {
  // ... existing logic ...
  await this.loginLogRepository.save({
    user_id: user.id,
    ip_address: meta.ipAddress,
    user_agent: meta.userAgent,
    logged_in_at: new Date(),
  });
  await this.userRepository.update(user.id, { last_login_at: new Date() });
  // Also populate refresh token fields:
  // refreshToken.ip_address = meta.ipAddress;
  // refreshToken.user_agent = meta.userAgent;
}
```

### AUTH-B5 — Delete OTPs after use and on expiry
```ts
// auth.service.ts — after successful verify:
await this.otpRepository.delete({ phone_number: phoneNumber });

// Add periodic cleanup (call from a cron or on app startup):
await this.otpRepository
  .createQueryBuilder()
  .delete()
  .where('expires_at < :now', { now: new Date() })
  .execute();
```

### AUTH-B8 — Store null instead of empty string
```ts
// auth.service.ts:
full_name: null,

// user.entity.ts — allow nullable:
@Column({ nullable: true })
full_name: string | null;
```

### AUTH-F1 — Remove refreshToken from localStorage
```ts
// auth.service.ts — delete every localStorage.setItem/getItem for refreshToken.
// The httpOnly cookie set by the backend is the source of truth.

// auth.store.ts — remove refreshToken from persisted state:
partialize: (state) => ({ user: state.user })
```

### AUTH-F2 — Client-side OTP attempt limiting
```tsx
// VerifyOTPForm.tsx
const [failedAttempts, setFailedAttempts] = useState(0);
const isLocked = failedAttempts >= 5;

// onError:
onError: () => setFailedAttempts(p => p + 1),

// Button:
<button disabled={isLocked || isSubmitting}>
  {isLocked ? 'تعداد تلاش‌ها بیش از حد — لطفاً دوباره OTP دریافت کنید' : 'تایید'}
</button>
```

### AUTH-F4 — Fix AuthInitProvider session check
```ts
// AuthInitProvider.tsx — try getMe() first, regardless of localStorage:
useEffect(() => {
  (async () => {
    try {
      const user = await authService.getMe();
      setUser(user);
    } catch {
      try {
        await authService.refreshToken();
        const user = await authService.getMe();
        setUser(user);
      } catch {
        clearAuth();
      }
    } finally {
      setInitialized(true);
    }
  })();
}, []);
```

### AUTH-F5 — Automatic token refresh via Axios interceptor
```ts
// frontend/src/lib/api-client.ts
apiClient.interceptors.response.use(
  res => res,
  async error => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        await authService.refreshToken();
        return apiClient(error.config);
      } catch {
        useAuthStore.getState().clearAuth();
      }
    }
    return Promise.reject(error);
  }
);
```
