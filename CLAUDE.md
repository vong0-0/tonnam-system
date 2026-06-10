# TonNam SRMS — Claude Code Instructions

## Project Structure

This monorepo contains three sub-projects:

```
tonnam/
├── web/           # Public website
├── srms/          # SRMS Staff frontend (React + Vite)
├── api/           # Backend REST API + WebSocket server
└── api-contract/  # OpenAPI specification (source of truth)
```

---

## API Integration & Socket — Read These First

> Applies whenever working on: API calls, hooks, services, WebSocket events, types from server responses

**Always read both folders before implementing:**

1. `api-contract/` — OpenAPI spec, request/response schemas, error codes **(source of truth)**
2. `api/` — actual server implementation, route handlers, socket events

Never assume API shape from memory. Always verify against `api-contract/` first.

---

## Frontend (`web/`)

### Tech Stack
- React + Vite + TypeScript (strict)
- TanStack Query v5 for server state
- Axios instance at `app/lib/api.ts` (handles 401 refresh automatically)
- Socket.io client at `app/lib/socket.ts`
- Tailwind v4 — tokens defined in `app/app.css` under `@theme`
- shadcn/ui components at `app/components/ui/`

### Folder Conventions
```
app/
├── components/
│   ├── ui/          # shadcn only — never edit manually
│   ├── common/      # shared across all pages
│   └── waiter/      # page-specific components
├── hooks/           # useQuery / useMutation hooks only
├── services/        # axios API call functions only (no React)
├── lib/             # api.ts, socket.ts, date.ts, sanitize-params.ts
├── types/           # entities.ts, enums.ts, api.ts
├── constants/       # api.ts (endpoint map), routes.ts, roles.ts
└── mocks/           # mock data for UI dev only — never import in production
```

### Layer Rules
- **Components** → import from `hooks/` only
- **Hooks** → import from `services/` + TanStack Query
- **Services** → import from `lib/api` + `constants/api`
- Never call axios directly in components or hooks

### sanitizeParams — call before every list API request
Strips: `null` · `undefined` · `''` · `'ALL'` (case-insensitive)
Keeps: `false` · `0` (valid values — never strip)

### Query Key Pattern
```ts
export const X_KEYS = {
  all:    ['x'] as const,
  list:   (params: ListXParams) => ['x', params] as const,
  detail: (id: string) => ['x', id] as const,
}
```

### Mutation Conventions
- No `retry` override needed — global default is `retry: 0`
- `onSuccess` → invalidate relevant query keys
- User-facing error messages → always in Lao language

### Token System — Two Layers (never mix)
- `--color-*` TonNam tokens → custom components (Tailwind utilities)
- `--primary` / `--secondary` oklch → shadcn `components/ui/` only

---

## WebSocket

Read `api/` socket handlers + `api-contract/` WS spec before implementing any event.

- Event constants → `app/constants/socket.ts` (`WS_EVENTS`, `WS_CHANNELS`)
- Connect after `useRestoreAuth` succeeds
- Disconnect on `clearAuth`

---

## Design System

| | Public (`/`, `/menu`) | Internal (all staff pages) |
|---|---|---|
| Font | Playfair Display + Noto Sans Lao | **Noto Sans Lao only** |
| Background | `--color-cream` | white / `--color-ink-50` |
| Viewport | — | Waiter/Kitchen: 375px · POS/Admin: 1280px |

**Never use:** purple gradients · glassmorphism · hardcoded hex in className

---

## Business Rules

- Bill: OPEN → PAID or CANCELLED (no partial payment)
- Table manual transitions: AVAILABLE ↔ OCCUPIED only
- Every bill edit requires `reason` → AuditLog
- Payment: CASH · QR_PROMPTPAY · MIXED

---

## Verification Checklist

Before finishing any task:
1. `npx tsc --noEmit` — no errors
2. No imports from `@/services/*` inside components
3. No imports from `@/mocks/*` in production code
4. No hardcoded hex in className
5. `sanitizeParams()` called in every list service function
