# Contributing to TonNam SRMS

Welcome! This guide is the **map** for new contributors: where to start reading, how to bring the
system up locally, and the workflow for making changes. It links to the per-project READMEs and
`CLAUDE.md` files rather than repeating their details.

If you only want to run the apps, the [root README](./README.md#quick-start) has the short version.

---

## Where to start (read in this order)

TonNam is a **contract-first** repo. The fastest way to understand it is to follow the data from the
spec outward:

1. **[`api-contract/`](./api-contract)** — the OpenAPI 3.0 spec is the **source of truth** for every
   endpoint, request/response shape, and error. Start here so you know what the system *promises*.
   Run `npm run preview` in that folder to read the spec as rendered HTML docs.
2. **[`api/`](./api)** — the Express server that **implements** the contract. This is where business
   logic, the database models, auth, and WebSocket events live. Read `api/README.MD` and
   `api/CLAUDE.md`.
3. **[`srms/`](./srms)** — the staff frontend that **consumes** the API (POS, Waiter, Kitchen,
   Admin). Read `srms/README.md` and `srms/CLAUDE.md` for the 3-layer (service → hook → component)
   pattern.
4. **[`web/`](./web)** — the standalone public **brochure** website. Note: it is **not** wired to
   the backend, so you can treat it independently of the three above.

The repo root also has [`PRODUCT.md`](./PRODUCT.md) (scope), [`DESIGN.md`](./DESIGN.md) (design
system), and [`CLAUDE.md`](./CLAUDE.md) (working agreement) for deeper context.

---

## Prerequisites

- **Node.js 20+** (22 recommended) and **npm**
- **MongoDB** — a connection string (MongoDB Atlas or a local `mongod`)
- Git

This is a repository of **independent folders** (no root `package.json`, not a workspace). Install
dependencies inside each folder you work on.

---

## Local bring-up order

Bring services up in this order — the staff app depends on a running API, and the API depends on
MongoDB.

```bash
# 0) MongoDB — have a reachable MongoDB (Atlas URI or local mongod) before starting the API.

# 1) api  → http://localhost:8080
cd api
cp .env.example .env.development        # fill MONGODB_URI, JWT secrets, DB_NAME, ALLOWED_ORIGINS...
npm install
npm run dev                             # nodemon + tsx, reads .env.development

# 2) srms → http://localhost:5173
cd ../srms
cp .env.example .env.development        # VITE_API_URL=http://localhost:8080
npm install
npm run dev

# 3) web  → http://localhost:3000  (optional; independent brochure site)
cd ../web
npm install
npm run dev
```

> **Why does the API run on 8080 when the code says 3000?** The code default is `3000`
> (`process.env['PORT'] ?? 3000` in `api/src/app.ts`), but `api/.env.development` sets `PORT=8080`,
> so dev runs on **8080** — which is why the frontends target `http://localhost:8080`.

Seed data and login accounts: see `api/`'s scripts (`npm run seed:daily`, `npm run e2e:users`) and
the [docs/](./docs) UAT material for test accounts.

---

## Making a change (contract-first workflow)

When a change touches the API surface, flow the change outward so the spec, server, and clients stay
in sync:

```
1. api-contract/   →  update the OpenAPI spec; `npm run validate` (Redocly lint)
2. api/            →  implement: route → controller → service → model, with a Zod schema
3. srms/ (or web)  →  consume it: service → query/mutation hook → component
```

Never assume an API shape from memory — verify against `api-contract/` first.

### Layer conventions (one line each — full rules in each `CLAUDE.md`)

- **api/** — thin controllers, thick services; validate with Zod before touching the DB; every
  mutating route uses `authenticate` + `authorize`; respond via the shared response helper.
- **srms/** — strictly `service → hook → component`; never call axios in a component; routes,
  roles, and socket events come from `constants/`, never magic strings.
- **web/** — Next.js App Router; server components by default.

---

## Commits & branches

- **Conventional Commits** with a scope: `feat(api): ...`, `fix(srms): ...`, `chore(deps): ...`,
  `docs: ...`. Common scopes: `api`, `srms`, `web`, `auth`, `tables`, `bills`, `orders`, `payments`.
- **Branches:** `feat/<scope>`, `fix/<scope>`, `chore/<scope>`, `docs/<scope>`.
- One concern per pull request.

---

## Before you open a PR

Run the checks for whichever project(s) you touched:

| Project | Type-check | Tests | Lint |
|---|---|---|---|
| `api/` | `npm run build` (tsc) | `npm test` (Jest) | `npm run lint` |
| `srms/` | `npm run typecheck` | Playwright e2e (`npx playwright test`) | — |
| `web/` | — | — | `npm run lint` |
| `api-contract/` | `npm run validate` (Redocly) | — | — |

Optional end-to-end smoke against a running API (from `api/`): `npm run test:flows` and
`npm run e2e:users` (seeds throwaway e2e login users).

Make sure type-checks and relevant tests pass before requesting review.
