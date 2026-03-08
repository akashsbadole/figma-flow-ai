

## Plan: Create TODO.md, DATABASE.md, and DEPLOYMENT.md

I'll create three documentation files covering all features, SQL schema, and deployment process.

---

### File 1: `TODO.md` — Complete Feature Checklist

**Completed features** (all checked):
- Auth: email/password, auto-profile/role/subscription triggers, quick login buttons (Admin + User), protected routes
- AI Generator: prompt-based variants (1-6), device types, reference image, iteration mode, preview, code view, PNG export, save
- Image to Design: upload image → 4 code formats (HTML, CSS, React, Tailwind)
- Design System Builder: 13+ token categories, 12 component previews, 5 export formats, Figma SVG export
- Template Gallery: DB-backed, category/search filtering, save/unsave
- History & My Designs: search, filters, bulk delete
- Dashboard: real usage stats (plan, generations progress bar, activity totals)
- Admin Panel: role management, enable/disable users, view all history
- Pricing: Free (5 gen) / Pro (unlimited) tiers
- Landing Page: public marketing page
- Dark/light mode toggle

**TODO items**:
- High: Stripe payments, seed templates, email verification page, password reset
- Medium: Server-side generation count increment, project management UI, design system browser, admin template CRUD, profile editing
- Nice-to-have: Realtime collaboration, Figma plugin, AI chat iteration, version history, team workspaces, analytics

---

### File 2: `DATABASE.md` — Complete SQL Reference

All SQL in one file:
- Enum: `app_role` (admin, user)
- 5 functions: `update_updated_at_column`, `handle_new_user`, `has_role`, `handle_new_user_role`, `handle_new_user_subscription`
- 6 triggers: 3 on `auth.users` (profile, role, subscription creation), 3 `updated_at` triggers
- 9 tables with full CREATE + RLS policies: profiles, user_roles, user_subscriptions, projects, designs, design_systems, templates, saved_templates, generation_history
- Storage bucket: `designs` (public) with 4 policies
- ASCII entity-relationship diagram

---

### File 3: `DEPLOYMENT.md` — Deployment & Architecture

- Architecture diagram (Frontend → Lovable Cloud → AI Gateway)
- Edge functions table (4 functions, all `verify_jwt = false`)
- `config.toml` reference
- Secrets table (6 secrets)
- Deployment process: frontend (Publish button), backend (automatic)
- Local development commands
- Tech stack table (16 technologies)
- Migration file listing
- Demo credentials

---

### Implementation
Three new files at project root. No existing files modified.

