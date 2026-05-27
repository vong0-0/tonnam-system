# TonNam (ต้นน้ำ) — Smart Restaurant Management System

## Project Overview
Thai heritage family restaurant management system.
Monorepo: `api/` (Express) · `web/` (Next.js public) · `srms/` (React internal staff)

See @README.md for full project context.

## Tech Stack
- **api/**: Node.js 20 · TypeScript · Express · MongoDB/Mongoose · Zod · Socket.io · JWT
- **web/**: Next.js 14 App Router · TypeScript · Tailwind CSS
- **srms/**: React 18 + Vite · TypeScript · Tailwind · Zustand · socket.io-client

## Repository Conventions

### Branch Naming
```
feat/<scope>   → new feature
fix/<scope>    → bug fix
chore/<scope>  → tooling, config, deps
docs/<scope>   → documentation only
```

### Commit Format (Conventional Commits)
```
feat(api): add payment endpoint
fix(srms): correct table status badge color
chore(deps): update mongoose to 8.x
```

### PR Rules
- Always run tests before opening PR
- One concern per PR
- Reference issue number in description

## Commands

### api/
```bash
cd api
npm run dev        # development with nodemon
npm run build      # tsc compile
npm run test       # jest
npm run test:watch # jest --watch
npm run lint       # eslint
```

### web/
```bash
cd web
npm run dev        # next dev
npm run build      # next build
npm run lint       # next lint
```

### srms/
```bash
cd srms
npm run dev        # vite
npm run build      # tsc + vite build
npm run preview    # preview production build
npm run lint       # eslint
```

## Code Style

### TypeScript
- Strict mode ON — no `any`, no `as unknown`
- Always type function return values explicitly
- Use `interface` for object shapes, `type` for unions/aliases

### api/ Patterns
- Import types from `../types` barrel (never inline enums)
- Services handle business logic — controllers are thin
- Always validate with Zod schema before touching DB
- Use `response.ts` helper for all API responses
- Every route that mutates data requires authenticate + authorize middleware

### srms/ Patterns
- Use constants from `constants/` — never magic strings for routes or events
- Zustand stores are the single source of truth for global state
- API calls go through `lib/api.ts` (Axios instance) only
- Socket events go through `lib/socket.ts` only

### web/ Patterns
- Server components by default — use `'use client'` only when necessary
- No direct fetch — always use `lib/api.ts`

## Business Rules (CRITICAL — never violate)
- Bill MUST be paid in FULL in one transaction (no partial payment)
- Bill status flow: OPEN → PAID | CANCELLED only
- Table status flow: AVAILABLE → RESERVED → OCCUPIED → PAID
- Table returns to AVAILABLE only when Cashier explicitly clears it
- Order status: SENT_TO_KITCHEN → COOKED | CANCELLED
- Every Bill edit MUST include a reason → creates AuditLog entry
- Payment methods: CASH | QR_PROMPTPAY | MIXED

## Roles & Access
- ADMIN: all pages
- CASHIER: /pos + analytics summary
- WAITER: /waiter only
- KITCHEN: /kitchen only

## Environment
- development → localhost
- staging → vongsouvan.com
- production → tonnam.com
- NEVER commit .env files (only .env.example)
- api/ prefix: plain keys
- web/ prefix: NEXT_PUBLIC_
- srms/ prefix: VITE_

## Testing
- Write tests BEFORE marking a task done
- Run single test file when possible: `npm test -- auth.test.ts`
- Integration tests go in `tests/integration/`
- Unit tests go in `tests/unit/`
- Minimum: test the happy path + at least one error case per endpoint

## IMPORTANT Rules
- ALWAYS typecheck after a series of changes: `npx tsc --noEmit`
- NEVER use `console.log` in production code — use Winston logger (`utils/logger.ts`)
- NEVER expose stack traces in API responses
- NEVER store plain text passwords — bcrypt only
- ALWAYS use the `types/` barrel import: `import { TableStatus } from '../types'`
