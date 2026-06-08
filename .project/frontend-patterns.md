---
name: frontend-patterns
description: Frontend module structure, React Query hooks pattern, Zustand stores, API client, and Next.js App Router pages
metadata:
  type: project
---

# Frontend Patterns

## Module Structure

Every frontend module lives in `frontend/src/modules/<name>/` and follows:

```
types/module.types.ts        — TypeScript types/interfaces
services/module.service.ts   — Axios calls, maps to backend endpoints
hooks/useModule.ts            — React Query (useQuery/useMutation) wrappers
components/                  — Module-specific React components (optional)
store/module.store.ts        — Zustand store (only for client-persistent state: auth, cart)
```

## API Client

`frontend/src/lib/api-client.ts` — single Axios instance, used by all services.
All service files import this client. Never create a second Axios instance.

## React Query Pattern

Hooks follow a consistent pattern:
```ts
// Read
export function useWishlist() {
  return useQuery({ queryKey: ['wishlist'], queryFn: wishlistService.list });
}
// Write
export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: wishlistService.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Persian success message');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'خطا'),
  });
}
```

Query keys use the module name as root: `['wishlist']`, `['products']`, `['cart']`, etc.
Toast messages are in Persian (Farsi).

## Zustand Pattern

Used only for client-side persistent state (auth session, cart):
- `frontend/src/modules/auth/store/auth.store.ts`
- `frontend/src/modules/cart/store/cart.store.ts`

## Next.js App Router Layout

```
frontend/src/app/
├── (auth)/login/             — Auth pages (login, OTP verify)
├── admin/                    — Admin panel pages
│   ├── categories/[id]/
│   ├── brands/ + [id]/
│   ├── products/ + [id]/ + [id]/variants/
│   ├── attributes/ + [id]/
│   ├── coupons/ + [id]/
│   ├── tags/
│   └── reviews/
├── products/                 — Public product listing
│   └── [slug]/              — Product detail page
├── cart/                     — Cart page
├── checkout/                 — Checkout page
├── orders/ + [id]/          — Order list + detail
├── wishlist/                 — Wishlist page
├── layout.tsx                — Root layout (includes providers)
├── page.tsx                  — Homepage
└── not-found.tsx
```

## Auth Flow

1. User enters phone number (`PhoneInput` component)
2. Backend sends OTP via Kavenegar SMS
3. User enters OTP (`OtpInput` component)
4. Backend returns access + refresh JWT tokens (httpOnly cookies)
5. `AuthInitProvider` hydrates auth store on app load
6. `useProtectedRoute` — redirects to login if not authenticated
7. `useAdminRoute` — redirects if not admin role

## UI Components (`frontend/src/components/`)

### Shared UI (`components/ui/`)
- `Button.tsx`
- `OtpInput.tsx`
- `PhoneInput.tsx`
- `StarRating.tsx`

### Layout (`components/layout/`)
- `Header.tsx`
- `Footer.tsx`
- `MegaMenu.tsx`
- `MobileCategoryMenu.tsx`

### Icons (`components/icons/Icons.tsx`) — wraps Iconify

## Styling

- Tailwind CSS v4 with `@theme` directives in `globals.css`
- CSS custom properties for theming (light/dark)
- `next-themes` for dark/light mode toggle
- Vazirmatn Persian font (woff2 files in `public/fonts/`)
- RTL layout (logical CSS properties throughout)
- All text content is Persian (Farsi)

## Query Provider

`frontend/src/lib/query-provider.tsx` — wraps app with TanStack Query's `QueryClientProvider`.
