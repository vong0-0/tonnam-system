@AGENTS.md

# TonNam (ຕົ້ນນ້ຳ) — Public Website (web/)

## Project Overview
Public-facing **marketing website** for the TonNam restaurant — a single landing page (Hero, About,
Featured Menu, Contact).

> ⚠️ **Brochure site — NOT wired to the backend API.**
> `web/` is presentational only: **no data fetching, no auth, no live restaurant data.** It does not
> talk to `api/` and does **not** work end-to-end. The fully-wired staff app is a separate project,
> `srms/`. Do not add API calls here unless the project scope explicitly changes.

See @README.md for project context.
See @package.json for available npm commands.

## Tech Stack
```
Framework:    Next.js 16 (App Router)
Library:      React 19
Language:     TypeScript
Styling:      Tailwind CSS v4
Components:   shadcn/ui (style: radix-nova)
Icons:        lucide-react
Fonts:        Playfair Display (display) · Noto Sans Lao (body) · JetBrains Mono (mono)
```

## Commands
```bash
npm run dev      # next dev (:3000)
npm run build    # next build
npm run start    # next start
npm run lint     # eslint
```

## Structure
```
app/
├── layout.tsx          # root layout + fonts
└── page.tsx            # landing page (Hero / About / FeaturedMenu / Contact)
components/
├── ui/                 # shadcn/ui — generated; never edit by hand
├── common/             # shared presentational components
└── landing-page/       # section components
lib/
└── utils.ts            # cn() helper (no API client — by design)
```

## Patterns
- App Router: **server components by default** — add `'use client'` only when necessary.
- This is a static/presentational site; there is intentionally **no `lib/api.ts`**, no data
  fetching, and no environment variables.
- shadcn components live in `components/ui/` and are generated — never edit them by hand.

## IMPORTANT
- NEVER introduce backend/API calls, auth, or WebSocket here — that belongs in `srms/`.
- Keep it presentational; if live data is ever required, that is a scope change to plan separately.
