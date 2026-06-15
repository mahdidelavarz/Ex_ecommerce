---
name: open-questions
description: Unresolved design questions, things to verify, and architectural uncertainties
metadata:
  type: project
---

# Open Questions

Track these before making changes in the relevant areas.

## Architecture Questions

**Q1: Is `brand.entity.ts` missing?**
- RESOLVED: `brand.entity.ts` exists in `backend/src/database/entities/`. Was missed by earlier glob due to truncation.

**Q2: What is the payment gateway?**
- `PaymentMethod` enum includes credit_card, debit_card, PayPal, Stripe, bank_transfer, cash_on_delivery.
- No Stripe/PayPal SDK dependency found in `backend/package.json`.
- Hypothesis: payment integration is stubbed / not yet wired.
- **Action needed**: Read `backend/src/modules/payments/payment.service.ts`.

**Q3: Are admin order/return/shipment pages built?**
- These are not visible in the frontend glob. May be to-do.
- Git log shows `af3f6a7 return api and ui added` — check what "ui" actually includes.

**Q4: Does `support` role have distinct route guards?**
- `UserRole.SUPPORT` exists in enums but `authorize()` calls observed only use `UserRole.ADMIN`.
- Hypothesis: support role is defined but not yet used in route middleware.

## Design Uncertainties

**D1: Cart session management for guests**
- Cart supports `sessionId` for guests. How is `sessionId` generated and stored client-side?
- Is this in the cart store (Zustand)?

**D2: File uploads**
- `backend/package.json` includes `multer` and `UPLOAD_PATH=./uploads`.
- Where are uploads used — product images? avatars?
- Is there a static file serving setup for the upload folder?

**D3: OTP in development**
- Kavenegar requires a paid API key. How do developers test OTP flow locally without the key?
- Is there a dev bypass or mock OTP?

## Known Inconsistencies

| Area | Issue |
|------|-------|
| `returns` backend | Bypasses service layer, no input validation, doesn't use ApiResponseHelper |
| `payment` naming | Frontend module is `payment/` (singular), all others plural |
| Variant routes | Mounted at root prefix in app.ts, not `/variants` |
