

## Improvement Plan for AI Design Studio

After reviewing the entire codebase, here are the remaining issues and suggested improvements, grouped by priority:

### Critical Fixes

1. **Add `image-to-design` to config.toml** -- The edge function is missing its config entry, which will cause deployment issues. Add `[functions.image-to-design]` with `verify_jwt = false`.

2. **Enforce generation limits** -- `user_subscriptions` table tracks `generations_used` and `generations_limit`, but no code actually checks or increments these. Add a check before each generation (in Generator, ImageToDesign, DesignSystemBuilder) that blocks free users after 5 generations and shows an upgrade prompt.

3. **Templates page uses hardcoded data** -- The `templates` table exists in the DB but `Templates.tsx` uses a `sampleTemplates` array. Fetch from DB instead, and persist saves to `saved_templates`.

### Important Improvements

4. **Add a public landing page** -- Currently `/` redirects to the protected Dashboard. Create a marketing landing page at `/` with hero, features, and CTA. Move Dashboard to only `/dashboard`.

5. **Dark mode toggle** -- CSS tokens for dark mode exist in `index.css`, and `next-themes` is installed, but there's no toggle UI. Add a theme toggle button in the sidebar footer.

6. **Refactor DesignSystemBuilder.tsx** -- At 1199 lines, this file is too large. Extract into sub-components: `ColorEditor`, `TypographyEditor`, `SpacingEditor`, `GridEditor`, `ExportPanel`, etc.

7. **Remove demo credentials from Auth page** -- If there are hardcoded demo credentials shown in the login UI, remove them for security.

### Nice-to-Have

8. **Add Stripe for Pro payments** -- Currently the Pricing page has no real payment flow. Integrate Stripe checkout for Pro plan upgrades.

9. **Dashboard stats from real data** -- The Dashboard fetches from `projects` and `designs` tables but could show generation counts, subscription status, and usage metrics from `user_subscriptions` and `generation_history`.

### Implementation Order

I recommend tackling these in order: **1 → 2 → 3 → 5 → 4 → 6 → 7 → 8 → 9**

Shall I proceed with implementing all of these, or would you like to pick specific items?

