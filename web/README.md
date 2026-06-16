# TonNam (ຕົ້ນນ້ຳ) — Public Website (`web/`)

The public-facing **marketing website** for the TonNam restaurant — a single landing page with the
restaurant's story and menu highlights.

> ⚠️ **This is a brochure site — it is NOT connected to the backend API.**
> `web/` is presentational only: there is **no data fetching, no auth, and no live restaurant
> data**. Unlike [`srms/`](../srms) (the staff app, which is fully wired to `api/`), nothing here
> talks to the backend, so it does **not** work end-to-end. Treat it as a standalone static site.

---

## Tech stack

| Area | Choice |
|---|---|
| Framework | **Next.js 16** (App Router) |
| Library | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (`components/ui/`, style preset `radix-nova`) |
| Icons | lucide-react |
| Fonts | Playfair Display (display), **Noto Sans Lao** (body), JetBrains Mono (mono) |

---

## Requirements

- **Node.js 20+** (22 recommended) and **npm**

No environment variables are required — there is no `.env.example` because the site makes no API
calls.

---

## Getting started

```bash
npm install
npm run dev      # → http://localhost:3000
```

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js dev server (`:3000`) |
| `npm run build` | Production build (`next build`) |
| `npm run start` | Serve the production build (`next start`) |
| `npm run lint` | Lint (`eslint`) |

---

## Project structure

```
web/
├── app/
│   ├── layout.tsx       # root layout, fonts (Playfair Display / Noto Sans Lao / JetBrains Mono)
│   └── page.tsx         # landing page → Hero / About / Featured Menu / Contact
├── components/
│   ├── ui/              # shadcn/ui — generated; do not edit by hand
│   ├── common/          # shared presentational components
│   └── landing-page/    # Hero, About, FeaturedMenu, Contact sections
├── lib/
│   └── utils.ts         # cn() helper (no API client — by design)
└── components.json      # shadcn config
```

---

## Notes

- App Router with server components by default; add `'use client'` only when needed.
- If this site ever needs live data, it would gain a `lib/api.ts` client and consume the
  [`api-contract/`](../api-contract) spec — but that is **not** the case today.
