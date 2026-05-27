# TonNam (ต้นน้ำ) — API Server

REST API and WebSocket server for the TonNam Smart Restaurant Management System.

## Stack

- **Runtime**: Node.js 20
- **Framework**: Express
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

# Start development server
npm run dev
```

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server with nodemon |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run test` | Run Jest test suite |
| `npm run test:watch` | Run Jest in watch mode |
| `npm run lint` | Run ESLint |

## Project Structure

```
api/
├── src/
│   ├── controllers/    # Thin request/response handlers
│   ├── services/       # Business logic
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routers
│   ├── middleware/     # authenticate, authorize, etc.
│   ├── schemas/        # Zod validation schemas
│   ├── types/          # Shared TypeScript types & enums (barrel)
│   └── utils/
│       ├── logger.ts   # Winston logger
│       └── response.ts # Unified API response helper
├── tests/
│   ├── unit/
│   └── integration/
└── dist/               # Compiled output (git-ignored)
```

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
| `PORT` | HTTP server port |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `NODE_ENV` | `development` \| `staging` \| `production` |

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

- Unit tests → `tests/unit/`
- Integration tests → `tests/integration/`
- Every endpoint needs at minimum: happy path + one error case
