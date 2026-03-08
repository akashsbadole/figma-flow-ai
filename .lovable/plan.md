

## Production Readiness: Security, Missing Features, and Polish

### Overview
This plan covers 7 areas: a critical security vulnerability, removing demo credentials, edge function auth, password reset flow, error boundary, pricing page fix, and email verification handling.

---

### 1. Critical Security Fix: Subscription Self-Upgrade

**Problem**: The `user_subscriptions` UPDATE RLS policy lets users change their own `plan` and `generations_limit` columns. Any user can self-upgrade to Pro for free.

**Database migration**:
- Drop the existing "Users can update own subscription" policy
- Create a `increment_generation_usage` RPC function (SECURITY DEFINER) that only increments `generations_used`
- Create a new restrictive SELECT-only policy (users keep read access; no direct UPDATE from client)

**Code changes**:
- `src/hooks/useGenerationLimit.ts`: Replace direct `.update()` with `supabase.rpc("increment_generation_usage", { p_user_id: user.id })`
- `src/pages/Pricing.tsx`: Remove `handleUpgrade` direct update. Change "Upgrade to Pro" button to show "Coming Soon" or "Contact Us". Admin panel retains plan management (admin RLS policy allows it).

---

### 2. Remove Demo Credentials

**File**: `src/pages/Auth.tsx`
- Delete the `fillCredentials` function and the "Quick Login" section (the grid with Admin/User shortcut buttons)

---

### 3. Edge Function Authentication

Per the signing-keys system, keep `verify_jwt = false` in config.toml but add JWT validation in code for all 4 edge functions.

**Files**: All 4 edge functions (`generate-design`, `generate-design-system`, `generate-templates`, `image-to-design`)
- Add auth header check + `getClaims()` validation at the top of each function
- Return 401 for unauthenticated requests
- Extract `userId` from claims for audit/logging

**Frontend**: Edge functions are already called via `supabase.functions.invoke()` which automatically includes the auth header, so no frontend changes needed.

---

### 4. Password Reset Flow

**`src/contexts/AuthContext.tsx`**:
- Add `resetPassword(email: string)` method using `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })`

**`src/pages/Auth.tsx`**:
- Add "Forgot password?" link below the sign-in button
- When clicked, show a simple email input form that calls `resetPassword`
- Show success message: "Check your email for a reset link"

**New file: `src/pages/ResetPassword.tsx`**:
- Public route at `/reset-password`
- Check URL hash for `type=recovery`
- Show a "Set new password" form
- Call `supabase.auth.updateUser({ password })` on submit
- Redirect to `/dashboard` on success

**`src/App.tsx`**:
- Add route: `<Route path="/reset-password" element={<ResetPassword />} />`

---

### 5. Global Error Boundary

**New file: `src/components/ErrorBoundary.tsx`**:
- Class component implementing `componentDidCatch`
- Renders a friendly "Something went wrong" screen with a "Try again" button that reloads the page

**`src/App.tsx`**:
- Wrap the entire app tree with `<ErrorBoundary>`

---

### 6. Email Verification Handling

**`src/pages/Auth.tsx`**:
- After successful signup, show a clear info card: "Check your email to verify your account before signing in"
- Handle `email_not_confirmed` error on sign-in with a helpful message instead of the raw error

---

### 7. Pricing Page Polish

**`src/pages/Pricing.tsx`**:
- Remove direct plan update logic
- "Upgrade to Pro" button becomes disabled with text "Coming Soon" (or links to a contact form)
- Keep the subscription info display (read-only)
- Usage stats remain functional

---

### Summary

| Change | Files |
|--------|-------|
| Subscription security fix | DB migration + `useGenerationLimit.ts` + `Pricing.tsx` |
| Remove demo credentials | `Auth.tsx` |
| Edge function auth | 4 edge function `index.ts` files |
| Password reset | `AuthContext.tsx`, `Auth.tsx`, new `ResetPassword.tsx`, `App.tsx` |
| Error boundary | New `ErrorBoundary.tsx`, `App.tsx` |
| Email verification UX | `Auth.tsx` |
| Pricing polish | `Pricing.tsx` |

