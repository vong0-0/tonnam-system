# TonNam (ต้นน้ำ) — Internal Staff Frontend (srms/)

## Project Overview
Internal staff management system for TonNam restaurant.
4 subsystems: POS (Cashier), Waiter App, Kitchen Display, Admin Backend.

See @README.md for full project context.
See @package.json for available npm commands.

## Tech Stack
```
Framework:    React 18 + Vite
Language:     TypeScript
Styling:      Tailwind CSS
Components:   shadcn/ui
Icons:        Lucide React
Routing:      React Router DOM v6
State:        Zustand
Server State: TanStack Query v5
Tables:       TanStack Table v8
Charts:       Recharts
WebSocket:    socket.io-client
Env prefix:   VITE_
```

## Commands
```bash
npm run dev      # vite dev server
npm run build    # tsc + vite build
npm run preview  # preview production build
npm run lint     # eslint
npx tsc --noEmit # typecheck only
```

## Import Convention
ALWAYS use @/ alias — never relative paths with ../
```ts
// CORRECT
import { api } from '@/lib/api'
import { connectSocket, onWsEvent } from '@/lib/socket'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { WS_EVENTS, WS_CHANNELS } from '@/constants/socket'
import { authStore } from '@/stores/auth.store'
import { Button } from '@/components/ui/button'

// WRONG
import { api } from '../../lib/api'
import { ROUTES } from '../constants/routes'
```
Exception: same directory only → `import { x } from './x'`

## Roles & Pages
| Role | Pages |
|---|---|
| ADMIN | ทุกหน้า |
| CASHIER | /pos, /pos/bills/:id, /pos/bills/:id/orders/new, /pos/bills/:id/payment, /pos/reservations |
| WAITER | /waiter, /waiter/tables/:id, /waiter/orders/new, /waiter/orders/:id |
| KITCHEN | /kitchen, /kitchen/history |

## Design System — Internal Personality
Tone: Clean, Fast, Functional

### Colors
```
Primary action:  Forest Green  #1B4332  (bg-green)
Hover:           Forest Light  #2D6A4F  (bg-green-light)
Page bg:         Near White    #F1F3F5  (bg-ink-50)
Surface/Card:    Paper White   #FFFFFF  (bg-paper)
Border:          Border Grey   #DEE2E6  (border-ink-100)
Text primary:    Deep Charcoal #1F2326  (text-ink-900)
Text body:       Slate Body    #495057  (text-ink-700)
Text secondary:  Muted Slate   #6C757D  (text-ink-500)
Text disabled:   Light Slate   #ADB5BD  (text-ink-300)
Success:         Teal Jade     #0F9B8E  (text-success)
Warning:         Warm Amber    #F5A623  (text-warning)
Danger:          Chili Red     #C0392B  (text-danger)
```

### Typography
```
Font: Noto Sans Thai ONLY
NO Playfair Display on internal pages — ever
```

### Viewport
```
Waiter + Kitchen: Mobile-first (375px)
POS + Admin:      Desktop-first (1280px)
```

## Constants — ALWAYS Use, NEVER Hardcode
```ts
import { ROUTES } from '@/constants/routes'
import { API } from '@/constants/api'
import { ROLES } from '@/constants/roles'
import { WS_EVENTS, WS_CHANNELS } from '@/constants/socket'
```

## API Calls
ALWAYS through `lib/api.ts` (Axios instance) only:
```ts
import { api } from '@/lib/api'
const { data } = await api.get(API.TABLES)
```

## Data Fetching Pattern

Every API integration follows exactly 3 layers. Never skip or merge layers.

```
service → query/mutation hook → component
```

### Layer 1 — Service (`app/services/*.ts`)
Raw API call only. No React. No state. Just axios + return data.

```ts
// app/services/table.service.ts
import { api } from '@/lib/api'
import { API } from '@/constants/api'
import type { Table, ApiResponse, PaginatedResponse } from '@/types'

export async function listTables(): Promise<PaginatedResponse<Table>> {
  const { data } = await api.get(API.TABLES)
  return data
}

export async function updateTableStatus(
  id: string,
  status: string
): Promise<ApiResponse<Table>> {
  const { data } = await api.patch(API.TABLE_STATUS(id), { status })
  return data
}
```

### Layer 2 — Hook (`app/hooks/*.ts`)
TanStack Query wrapping the service. No JSX. No business logic.

```ts
// app/hooks/useTables.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listTables, updateTableStatus } from '@/services/table.service'

export const TABLE_KEYS = {
  all:    ['tables'] as const,
  detail: (id: string) => ['tables', id] as const,
}

export function useTables() {
  return useQuery({
    queryKey: TABLE_KEYS.all,
    queryFn:  listTables,
  })
}

export function useUpdateTableStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateTableStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TABLE_KEYS.all })
    },
  })
}
```

### Layer 3 — Component
Calls the hook. Renders data. No direct api or service imports.

```ts
// app/pages/pos/index.tsx
import { useTables } from '@/hooks/useTables'

export function PosPage() {
  const { data, isLoading, isError } = useTables()
  // render only — no api calls here
}
```

### File naming convention
```
app/services/   table.service.ts, bill.service.ts, order.service.ts ...
app/hooks/      useTables.ts, useBills.ts, useOrders.ts ...
```

### Query key convention
Each service domain exports a `*_KEYS` object — use for
`queryKey` in useQuery and `invalidateQueries` in mutations.
Never use raw string arrays as query keys inline in components.

### Rules
- NEVER import from `@/services/*` directly in a component
- NEVER call `api.*` inside a component or hook body
- ALWAYS define query keys in the hook file, not inline
- Mutations MUST invalidate or update related query keys on success
- One service file per API resource
- One hook file per service file

## Forms

All forms use React Hook Form + Zod via shared wrappers.
NEVER import from libraries directly.

```ts
import { useZodForm, z, type SubmitHandler } from '@/lib/form'
import { loginSchema } from '@/schemas/auth.schema'
```

Schema location:
```
Shared primitives:  app/lib/schemas.ts
Domain schemas:     app/schemas/*.schema.ts — one file per domain
```

## WebSocket
ALWAYS through `lib/socket.ts` only.
Auth flow: POST /auth/ws-ticket → ticket (30s TTL, one-time) → connect with ?ticket=xxx
NEVER use access token directly for WS connection.

```ts
import { connectSocket, onWsEvent, subscribeChannel } from '@/lib/socket'
import { WS_EVENTS, WS_CHANNELS } from '@/constants/socket'

// Subscribe to a channel
subscribeChannel(WS_CHANNELS.TABLES)

// Listen to events — type-safe via WsPayloadMap
const unsubscribe = onWsEvent(WS_EVENTS.TABLE_STATUS_UPDATED, (data) => {
  // data is typed as WsTableStatusUpdatedPayload
})

// Cleanup
unsubscribe()
```

All events are defined in `@/constants/socket` — see WS_EVENTS and WS_CHANNELS for full list.

## Auth & Token Rules
```
Access token (15m):   stored in Zustand memory only — NEVER localStorage
Refresh token:        HttpOnly cookie — browser sends automatically
Token refresh:        Axios interceptor in lib/api.ts handles 401 → POST /auth/refresh automatically
                      NEVER handle refresh token manually in component or hook code
WS ticket (30s):      POST /auth/ws-ticket → one-time use → connect wss://...?ticket=xxx
                      NEVER use access token directly for WS connection
```

## State Management
- Global state → Zustand stores in `stores/`
- Server state → TanStack Query (useQuery, useMutation)
- WebSocket state → `stores/notification.store.ts`
- NEVER fetch data directly in components

## shadcn/ui
```
components/ui/       ← auto-generated by shadcn CLI — NEVER edit these files directly
components/internal/ ← TonNam-specific components (Sidebar, TableCard, etc.) — edit here
```

## Business Rules (CRITICAL)
```
Bill: OPEN → PAID | CANCELLED only (no partial)
Table: AVAILABLE → RESERVED → OCCUPIED → PAID
Table returns AVAILABLE only when Cashier clears it
Every Bill edit requires reason → AuditLog
Order: SENT_TO_KITCHEN → COOKED | CANCELLED
Payment: CASH | QR_PROMPTPAY | MIXED
```

## IMPORTANT
- ALWAYS run `npx tsc --noEmit` after changes
- NEVER use Playfair Display on any internal page
- NEVER call API directly in components — use TanStack Query
- NEVER import from `@/services/*` directly in a component
- NEVER use magic strings for routes, events, or roles
- NEVER store tokens in localStorage — Zustand memory only
- NEVER edit files in `components/ui/` — shadcn auto-generated
- NEVER handle token refresh manually — Axios interceptor does it
- NEVER use access token for WS connection — use ws-ticket only
