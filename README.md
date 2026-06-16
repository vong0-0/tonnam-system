# TonNam (ຕົ້ນນ້ຳ) — Smart Restaurant Management System

TonNam SRMS is a restaurant management system for a Lao restaurant. It covers the full
service flow — taking orders, sending them to the kitchen, billing, splitting bills, taking
payment, managing tables and reservations — plus an admin back office with analytics and an
audit trail. The staff-facing app is in **Lao**.

> **New here?** See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for where to start and how to run
> everything locally.

---

## Repository layout

This is a **multi-project repository of independent folders** — there is no root `package.json`
and it is **not** an npm/pnpm/turbo workspace. Each sub-project has its own dependencies and is
installed and run on its own.

| Folder | What it is | Stack | Has README |
|---|---|---|---|
| [`api-contract/`](./api-contract) | OpenAPI 3.0 spec — **source of truth** for the API | OpenAPI 3.0.3 · Redocly | ✅ |
| [`api/`](./api) | Backend REST API + WebSocket server | Node.js · Express 5 · MongoDB/Mongoose · Socket.io · JWT | ✅ |
| [`srms/`](./srms) | Internal **staff** frontend (POS · Waiter · Kitchen · Admin) | React 19 · React Router 7 (SSR) · Tailwind v4 | ✅ |
| [`web/`](./web) | Public marketing website (brochure) | Next.js 16 · React 19 · Tailwind v4 | ✅ |
| [`docs/`](./docs) | Manual UAT test cases + Google Form generator | Markdown · Google Apps Script | ✅ |

---

## Architecture at a glance

```
┌──────────────┐         ┌──────────────┐
│  web/  :3000 │         │ srms/  :5173 │   ← React Router 7 (SSR) staff app
│ (brochure,   │         │  POS/Waiter/ │
│  no backend) │         │  Kitchen/Admin│
└──────────────┘         └──────┬───────┘
                                │ HTTP /v1  +  WebSocket
                                ▼
                        ┌───────────────┐        ┌──────────────┐
                        │ api/   :8080  │───────▶│   MongoDB    │
                        │ Express 5 +   │        │ (Atlas/local)│
                        │ Socket.io     │        └──────────────┘
                        └───────────────┘
                                ▲
                        api-contract/  (OpenAPI 3.0 — the spec both sides follow)
```

### A note on the API port (3000 vs 8080)

You will see **two different port numbers** for the API — this is intentional:

- The **code default is `3000`** — `api/src/app.ts` uses `process.env['PORT'] ?? 3000`.
- **Local development actually runs on `8080`**, because `api/.env.development` sets `PORT=8080`.
  That is why the frontends point at `http://localhost:8080` (`srms/.env.development` →
  `VITE_API_URL=http://localhost:8080`).

So if you clone the repo and run `npm run dev` in `api/`, it listens on **8080** (the dev env file
wins). The `3000` you see in the source is only the fallback when no `PORT` is set.

---

## Requirements

- **Node.js 20+** (22 recommended) and **npm**
- **MongoDB** — a connection string (MongoDB Atlas or a local `mongod`)
- Git

Each sub-project pins its own toolchain; see its README for specifics.

---

## Quick start

Install and run each project in its own terminal. **Start the API first** — the staff app depends
on it.

```bash
# 1) Backend API (terminal 1) → http://localhost:8080
cd api
cp .env.example .env.development   # then fill in MONGODB_URI, JWT secrets, etc.
npm install
npm run dev

# 2) Staff frontend (terminal 2) → http://localhost:5173
cd srms
cp .env.example .env.development   # VITE_API_URL=http://localhost:8080
npm install
npm run dev

# 3) Public website (terminal 3, optional) → http://localhost:3000
cd web
npm install
npm run dev
```

For seed data, login accounts, and the contributor workflow, see
**[CONTRIBUTING.md](./CONTRIBUTING.md)** and each project's README.

---

## Repository conventions

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) with a project scope —
  e.g. `feat(api): add payment endpoint`, `fix(srms): correct table status badge`.
- **Branches:** `feat/<scope>` · `fix/<scope>` · `chore/<scope>` · `docs/<scope>`.
- **Contract first:** when the API shape changes, update `api-contract/` first, then `api/`, then
  the frontends.

## Reference docs (repo root)

| File | Purpose |
|---|---|
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Where to start, local setup, and the dev workflow |
| [`CLAUDE.md`](./CLAUDE.md) | Working agreement / instructions for the codebase |
| [`PRODUCT.md`](./PRODUCT.md) | Product requirements and scope |
| [`DESIGN.md`](./DESIGN.md) | Design system documentation |
| [`design-token.json`](./design-token.json) | Design tokens (colors, spacing, typography) |

## Business rules (quick reference)

- A bill goes **`OPEN` → `PAID` | `CANCELLED`** — paid in **full**, no partial payments.
- Table status: **`AVAILABLE` → `RESERVED` → `OCCUPIED` → `PAID`**; it returns to `AVAILABLE` only
  when a Cashier explicitly clears it.
- Order status: **`SENT_TO_KITCHEN` → `COOKED` | `CANCELLED`**.
- Every bill edit requires a **reason** and creates an **AuditLog** entry.
- Payment methods: **`CASH` · `QR_PROMPTPAY` · `MIXED`**.

## Roles

| Role | Access |
|---|---|
| `ADMIN` | Everything |
| `CASHIER` | `/pos` + analytics summary |
| `WAITER` | `/waiter` |
| `KITCHEN` | `/kitchen` |
