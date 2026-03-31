# AI Design Studio — Feature TODO

## ✅ Completed Features

### Authentication & Authorization
- [x] Email/password signup & login
- [x] Auto-create profile, role (`user`), and subscription on signup (DB triggers)
- [x] Quick login buttons: Admin (`demo@aidesignstudio.com`) & User (`user@aidesignstudio.com`)
- [x] Protected routes with `ProtectedRoute` component
- [x] Role-based access: `admin` and `user` via `user_roles` table + `has_role()` function
- [x] Dark/light mode toggle

### AI Generator (`/generator`)
- [x] Prompt-based design generation (1–6 variants)
- [x] Device type selection (mobile, tablet, desktop, watch)
- [x] Reference image upload support
- [x] Iteration mode (refine previous designs)
- [x] Live preview with device frames
- [x] Code view (HTML + CSS)
- [x] Export as PNG (html2canvas)
- [x] Save design to database

### Image to Design (`/image-to-design`)
- [x] Upload screenshot/image
- [x] AI generates 4 code formats: HTML, CSS, React, Tailwind
- [x] Tab-based code viewer with copy functionality

### Design System Builder (`/design-system`)
- [x] 13+ token categories (colors, typography, spacing, shadows, animations, icons, etc.)
- [x] 12 component previews (Button, Card, Input, Badge, etc.)
- [x] 5 export formats (CSS Variables, Tailwind Config, SCSS, JSON, Design Tokens)
- [x] Figma SVG component export
- [x] Save/load design systems from database

### Template Gallery (`/templates`)
- [x] Database-backed templates table
- [x] Category filtering and search
- [x] Save/unsave templates per user
- [x] Premium template flagging

### History & My Designs (`/history`, `/my-designs`)
- [x] View all generation history with search
- [x] Filter by type (design, design-system, template)
- [x] Bulk delete functionality
- [x] View saved designs with code

### Dashboard (`/dashboard`)
- [x] Current plan display
- [x] Generations usage progress bar
- [x] Activity totals (designs, design systems, history)
- [x] Recent activity feed

### Admin Panel (`/admin`)
- [x] View all users with profiles
- [x] Role management (promote/demote admin)
- [x] Enable/disable user accounts
- [x] View all generation history

### Pricing (`/pricing`)
- [x] Free tier: 5 generations
- [x] Pro tier: unlimited generations
- [x] Feature comparison table

### Landing Page (`/`)
- [x] Public marketing page with feature highlights
- [x] CTA to signup

---

## 🔴 High Priority

- [ ] **Stripe Payment Integration** — Connect Pro plan to Stripe Checkout + webhooks to upgrade `user_subscriptions`
- [ ] **Seed Templates** — Insert 10–20 starter templates into `templates` table
- [ ] **Email Verification Page** — Post-signup page prompting users to verify email
- [ ] **Password Reset Flow** — Forgot password link → reset email → update password page

## 🟡 Medium Priority

- [ ] **Server-side Generation Counter** — Increment `generations_used` in Edge Function (not client)
- [ ] **Project Management UI** — CRUD for `projects` table, assign designs to projects
- [ ] **Design System Browser** — Browse/fork other users' public design systems
- [ ] **Admin Template CRUD** — Admin UI to add/edit/delete templates
- [ ] **Profile Editing** — Update display name, avatar in user settings

## 🟢 Nice to Have

- [ ] Realtime collaboration (Supabase Realtime)
- [ ] Figma plugin for direct import
- [ ] AI chat-based iteration on designs
- [ ] Design version history with diff view
- [ ] Team workspaces with shared projects
- [ ] Usage analytics dashboard
- [ ] Custom domain support per project
- [ ] Webhooks for design generation events

## 🔧 Current Migration Tasks

- [ ] **Remove Supabase Dependencies** — Clean up remaining Supabase references in frontend
- [ ] **Update Pricing Page** — Replace Supabase subscription queries with custom API
- [ ] **Update Password Reset** — Replace Supabase password reset with custom API
- [ ] **Remove Supabase Integration Directory** — Delete `src/integrations/supabase/`
- [ ] **Clean Package.json** — Remove `@supabase/supabase-js` dependency
- [ ] **Test Migration** — Verify all functionality works with custom backend
