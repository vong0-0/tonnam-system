# TonNam (ຕົ້ນນ້ຳ) — Staff Frontend (`srms/`)

The internal **staff** web app for the TonNam restaurant. One codebase serves four role-based
subsystems:

- **POS** (Cashier) — bills, orders, payments, reservations, summary
- **Waiter** — tables, take orders, reservations
- **Kitchen** — live kitchen display, order history
- **Admin** — tables, menu, users, reservations, bills, audit logs, analytics

The UI is in **Lao**. It talks to the [`api/`](../api) backend over HTTP (`/v1`) and a WebSocket for
live updates (table status, kitchen orders, etc.).

---

## Tech stack

| Area | Choice |
|---|---|
| Framework | **React 19** + **React Router 7** (framework mode, **SSR enabled**) |
| Build/dev | React Router CLI (Vite under the hood) |
| Language | TypeScript (strict) |
| Styling | **Tailwind CSS v4** (tokens via `@theme` in `app/app.css`) |
| Components | shadcn/ui (`app/components/ui/`, style preset `radix-mira`) |
| Icons | Hugeicons (`@hugeicons/react`); `lucide-react` also available |
| Server state | TanStack Query v5 |
| Tables | TanStack Table v8 |
| Charts | Recharts |
| Client state | Zustand |
| HTTP | Axios (`app/lib/api.ts`) |
| Realtime | socket.io-client (`app/lib/socket.ts`) |
| Forms | React Hook Form + Zod |
| Fonts | Inter, Playfair Display, **Noto Sans Lao**, JetBrains Mono |
| E2E tests | Playwright |

> This is **not** a Vite SPA and **not** React Router DOM v6. It is React Router 7 framework mode
> with SSR (`react-router.config.ts` → `ssr: true`), so dev/build/start go through the
> `react-router` CLI.

---

## Requirements

- **Node.js 20+** (22 recommended) and **npm**
- A running **`api/`** backend reachable at `VITE_API_URL` (default dev: `http://localhost:8080`)

---

## Getting started

```bash
cp .env.example .env.development     # VITE_API_URL=http://localhost:8080
npm install
npm run dev                          # → http://localhost:5173
```

> Make sure the API is running first. In development the API listens on **8080** (its
> `.env.development` sets `PORT=8080`), even though the API's own code default is `3000` — which is
> why `.env.development` here points at `http://localhost:8080`.

### Environment variables

| Variable | Description | Dev value |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:8080` |

Only `VITE_`-prefixed variables are exposed to the client.

---

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the React Router dev server (`:5173`) |
| `npm run build` | Production build (`react-router build`) |
| `npm run start` | Serve the production build (`react-router-serve ./build/server/index.js`) |
| `npm run typecheck` | Generate route types and type-check (`react-router typegen && tsc`) |
| `npx playwright test` | Run the Playwright end-to-end smoke tests (see `e2e/`) |

---

## Project structure

```
srms/
├── app/
│   ├── routes.ts        # route config (RouteConfig: index/layout/route)
│   ├── root.tsx         # root layout + document
│   ├── app.css          # Tailwind v4 entry + @theme tokens + @font-face
│   ├── routes/          # route modules (login, select, admin/*, waiter/*, kitchen/*, pos/*)
│   ├── layouts/         # guard + per-role layouts (admin/waiter/kitchen/pos)
│   ├── components/
│   │   ├── ui/          # shadcn/ui — generated; do not edit by hand
│   │   └── ...          # TonNam components
│   ├── hooks/           # TanStack Query hooks (useTables, useBills, ...)
│   ├── services/        # axios API calls (one file per resource)
│   ├── stores/          # Zustand (auth.store, notification.store)
│   ├── lib/             # api.ts, socket.ts, date.ts, form.ts, query-client.ts, ...
│   ├── constants/       # api.ts, routes.ts, roles.ts, socket.ts
│   ├── schemas/         # Zod schemas (per domain)
│   ├── types/           # entities, enums, api, websocket
│   ├── assets/
│   └── mocks/           # UI-only mock data — never import in production
├── e2e/                 # Playwright specs (smoke.spec.ts)
├── playwright.config.ts
├── react-router.config.ts
└── components.json      # shadcn config
```

### Data flow — always 3 layers

```
service (axios)  →  hook (TanStack Query)  →  component (render only)
```

Never call axios directly in a component or hook body, and never import a `services/*` file into a
component. See [`CLAUDE.md`](./CLAUDE.md) for the full conventions (query keys, mutations, socket
usage, auth/token rules, design system).

---

## Roles & routes

| Role | Routes |
|---|---|
| `ADMIN` | everything, incl. `/admin`, `/admin/analytics`, `/admin/tables`, `/admin/menu`, `/admin/users`, `/admin/reservations`, `/admin/bills`, `/admin/audit-logs` |
| `CASHIER` | `/pos`, `/pos/bills`, `/pos/bills/:id`, `/pos/bills/:id/orders/new`, `/pos/bills/:id/payment`, `/pos/reservations`, `/pos/summary`, `/pos/menu` |
| `WAITER` | `/waiter`, `/waiter/tables/:id`, `/waiter/orders/new`, `/waiter/reservations` |
| `KITCHEN` | `/kitchen`, `/kitchen/order-history` |

---

## End-to-end tests

Playwright smoke tests live in `e2e/`. They drive the real UI against a live API, so they need:

- the API running on `:8080` and the e2e login users seeded (from `api/`: `npm run e2e:users`),
- the dev server (Playwright auto-starts `npm run dev` if it isn't already running).

```bash
npx playwright test
```
