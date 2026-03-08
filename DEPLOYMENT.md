# AI Design Studio — Deployment & Architecture

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   React + Vite   │────▶│   Lovable Cloud       │────▶│  AI Gateway     │
│   (Frontend)     │     │   (Backend)           │     │  (LLM Models)   │
│                  │     │                       │     │                 │
│  • React 18      │     │  • PostgreSQL DB      │     │  • Gemini 2.5   │
│  • TypeScript    │     │  • Auth (email/pass)  │     │    Flash        │
│  • Tailwind CSS  │     │  • Edge Functions     │     │                 │
│  • shadcn/ui     │     │  • Storage (designs)  │     │                 │
│  • Framer Motion │     │  • RLS Policies       │     │                 │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
```

---

## Tech Stack

| Layer      | Technology           | Purpose                          |
|------------|----------------------|----------------------------------|
| Framework  | React 18             | UI components                    |
| Bundler    | Vite 5               | Dev server & build               |
| Language   | TypeScript 5         | Type safety                      |
| Styling    | Tailwind CSS 3       | Utility-first CSS                |
| UI Library | shadcn/ui            | Accessible component primitives  |
| Animation  | Framer Motion        | Page transitions & micro-animations |
| Forms      | React Hook Form + Zod| Form handling & validation       |
| Routing    | React Router DOM 6   | Client-side routing              |
| State      | TanStack React Query | Server state management          |
| Charts     | Recharts             | Data visualization               |
| Export     | html2canvas          | PNG screenshot export            |
| Toasts     | Sonner               | Notification system              |
| Backend    | Lovable Cloud        | Database, auth, storage, functions |
| AI         | Lovable AI Gateway   | LLM-powered design generation    |
| Icons      | Lucide React         | Icon system                      |
| Theming    | next-themes          | Dark/light mode                  |

---

## Edge Functions

| Function                  | Path                                          | JWT Verify | Purpose                        |
|---------------------------|-----------------------------------------------|------------|--------------------------------|
| `generate-design`         | `/functions/v1/generate-design`               | `false`    | AI design variant generation   |
| `generate-design-system`  | `/functions/v1/generate-design-system`         | `false`    | AI design system token generation |
| `generate-templates`      | `/functions/v1/generate-templates`             | `false`    | AI template generation         |
| `image-to-design`         | `/functions/v1/image-to-design`               | `false`    | Image → code conversion        |

All functions use `LOVABLE_API_KEY` to call the AI Gateway at `https://ai.gateway.lovable.dev/v1/chat/completions`.

---

## Secrets

| Name                       | Purpose                              |
|----------------------------|--------------------------------------|
| `SUPABASE_URL`             | Backend API base URL                 |
| `SUPABASE_ANON_KEY`        | Public/anon access key               |
| `SUPABASE_PUBLISHABLE_KEY` | Client-side publishable key          |
| `SUPABASE_SERVICE_ROLE_KEY`| Admin-level backend access           |
| `SUPABASE_DB_URL`          | Direct database connection string    |
| `LOVABLE_API_KEY`          | AI Gateway authentication            |

---

## Deployment Process

### Frontend
1. Open Lovable editor
2. Click **Share → Publish**
3. App is deployed to `*.lovable.app` domain
4. Optional: Connect custom domain in **Settings → Domains**

### Backend (Automatic)
- Database migrations run automatically on save
- Edge Functions deploy automatically when code changes
- Storage buckets and RLS policies are managed via migrations

### Environment Variables
The `.env` file is auto-managed and contains:
```
VITE_SUPABASE_URL=<auto>
VITE_SUPABASE_PUBLISHABLE_KEY=<auto>
VITE_SUPABASE_PROJECT_ID=<auto>
```

---

## Local Development

```bash
# Clone & install
git clone <repo-url>
cd <project>
npm install

# Start dev server
npm run dev          # → http://localhost:5173

# Build for production
npm run build

# Run tests
npm test

# Lint
npm run lint
```

---

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── design-system/   # 13 Design System Builder sub-components
│   │   ├── generator/       # AI Generator components
│   │   └── ui/              # shadcn/ui primitives
│   ├── contexts/            # AuthContext
│   ├── hooks/               # Custom hooks
│   ├── integrations/supabase/  # Auto-generated client & types
│   ├── lib/                 # Utilities & export helpers
│   └── pages/               # Route pages (13 pages)
├── supabase/
│   ├── functions/           # 4 Edge Functions
│   └── config.toml          # Function configuration
├── TODO.md                  # Feature checklist
├── DATABASE.md              # Full SQL schema
└── DEPLOYMENT.md            # This file
```

---

## Demo Credentials

| Role  | Email                       | Password  |
|-------|-----------------------------|-----------|
| Admin | demo@aidesignstudio.com     | demo1234  |
| User  | user@aidesignstudio.com     | user1234  |
