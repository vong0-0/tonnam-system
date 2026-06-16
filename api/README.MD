# TonNam (ต้นน้ำ) — API Server

REST API and WebSocket server for the TonNam Smart Restaurant Management System.

## Stack

- **Runtime**: Node.js 20+
- **Framework**: Express 5
- **Database**: MongoDB · Mongoose
- **Validation**: Zod
- **Real-time**: Socket.io
- **Auth**: JWT · bcrypt
- **Language**: TypeScript (strict)

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment file and fill in values
cp .env.example .env

# Start development server (reads .env.development) → http://localhost:8080
npm run dev
```

All routes are served under the **`/v1`** prefix (e.g. `GET /v1/tables`). There is no dedicated
health-check route.

### Which port? (3000 vs 8080)

- The **code default is `3000`** — `src/app.ts` uses `process.env['PORT'] ?? 3000`.
- **Development runs on `8080`**, because `.env.development` sets `PORT=8080`. That's why the
  frontends point at `http://localhost:8080`.

So `npm run dev` listens on **8080** (the dev env file wins); `3000` is only the fallback when no
`PORT` is set.

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server (nodemon + tsx, `.env.development`) |
| `npm run build` | Compile TypeScript to `dist/` (`tsc && tsc-alias`) |
| `npm run test` | Run Jest test suite |
| `npm run test:watch` | Run Jest in watch mode |
| `npm run lint` | Run ESLint |
| `npm run seed:daily` | Seed a day's worth of sample data |
| `npm run test:flows` | Run the end-to-end API flow checks against a running server |
| `npm run e2e:users` | Create/remove the e2e login users used by the frontend Playwright tests |

## Project Structure

```
api/
├── src/
│   ├── controllers/    # Thin request/response handlers
│   ├── services/       # Business logic
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routers (mounted under /v1)
│   ├── middleware/     # authenticate, authorize, validate, error handler
│   ├── schemas/        # Zod validation schemas
│   ├── types/          # Shared TypeScript types & enums (barrel)
│   ├── config/         # env, database, CORS configuration
│   ├── websocket/      # Socket.io handlers
│   ├── app.ts          # Express + Socket.io setup, server.listen
│   ├── index.ts        # entry point
│   └── utils/
│       ├── logger.ts   # Winston logger
│       ├── response.ts # Unified API response helper
│       ├── problem.ts  # RFC 9457 problem+json error helper
│       └── short-id.ts
├── scripts/            # seed-daily.ts, test-flows.ts, e2e-users.ts
├── tests/
│   ├── unit/           # Jest service + middleware tests
│   └── integration/    # convention (no integration tests yet)
└── dist/               # Compiled output (git-ignored)
```

**Route groups** (under `/v1`): `auth`, `users`, `tables`, `table-merge-groups`,
`menu-categories`, `menu-items`, `reservations`, `bills`, `orders`, `payments`, `audit-logs`,
`analytics`.

## Business Rules

| Entity | Status Flow |
|---|---|
| Bill | `OPEN` → `PAID` \| `CANCELLED` |
| Table | `AVAILABLE` → `RESERVED` → `OCCUPIED` → `PAID` |
| Order | `SENT_TO_KITCHEN` → `COOKED` \| `CANCELLED` |

- Bills must be paid in **full** in one transaction — no partial payments
- Table returns to `AVAILABLE` only when a Cashier explicitly clears it
- Every Bill edit must include a reason, which creates an `AuditLog` entry
- Accepted payment methods: `CASH` · `QR_PROMPTPAY` · `MIXED`

## Roles

| Role | Access |
|---|---|
| `ADMIN` | Full access |
| `CASHIER` | `/pos` + analytics summary |
| `WAITER` | `/waiter` only |
| `KITCHEN` | `/kitchen` only |

## Environment Variables

Copy `.env.example` and configure for your environment. Never commit `.env`.

| Variable | Description |
|---|---|
| `PORT` | HTTP server port (dev `.env.development` sets `8080`; code default `3000`) |
| `API_BASE_URL` | Public base URL of the API |
| `MONGODB_URI` | MongoDB connection string |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Secret used to sign access tokens |
| `JWT_EXPIRES_IN` | Access-token lifetime |
| `JWT_REFRESH_SECRET` | Secret used to sign refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | Refresh-token lifetime |
| `WS_TICKET_EXPIRES_IN` | WebSocket ticket lifetime (one-time, short-lived) |
| `ALLOWED_ORIGINS` | CORS allow-list (comma-separated origins) |

See `.env.example` for the full, up-to-date list of keys.

## Environments

| Name | Host |
|---|---|
| development | localhost |
| staging | vongsouvan.com |
| production | tonnam.com |

## Testing

Tests must be written before marking a task done.

```bash
# Run all tests
npm run test

# Run a single file
npm test -- auth.test.ts
```

- Unit tests → `tests/unit/` (service + middleware tests; currently 12 files)
- Integration tests → `tests/integration/` (convention — none yet)
- Every endpoint needs at minimum: happy path + one error case

Jest runs in ESM mode (`NODE_OPTIONS=--experimental-vm-modules`). For end-to-end checks against a
running server, see `npm run test:flows` and `npm run e2e:users`.
