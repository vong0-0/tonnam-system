@AGENTS.md

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
import { socket } from '@/lib/socket'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { WS_EVENTS } from '@/constants/socket'
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
| CASHIER | /pos, /pos/bills/:id, /pos/bills/:id/payment, /pos/reservations |
| WAITER | /waiter, /waiter/tables/:id, /waiter/orders/new, /waiter/orders/:id |
| KITCHEN | /kitchen, /kitchen/history |

## Design System — Internal Personality
Tone: Clean, Fast, Functional

### Colors
```
Primary action:  Forest Green #1B4332
Hover:           Forest Light #2D6A4F
Background:      White #FFFFFF or Gray #F1F3F5
Text primary:    #2C1810
Text secondary:  #6B4C3B
Success:         #0F9B8E
Warning:         #F5A623
Danger:          #C0392B
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
import { WS_EVENTS } from '@/constants/socket'
```

## API Calls
ALWAYS through `lib/api.ts` (Axios instance) only:
```ts
import { api } from '@/lib/api'
const { data } = await api.get('/v1/tables')
```

## WebSocket Events
ALWAYS through `lib/socket.ts` only:
```ts
import { socket } from '@/lib/socket'
import { WS_EVENTS } from '@/constants/socket'
socket.on(WS_EVENTS.TABLE_STATUS_UPDATED, handler)
```

## State Management
- Global state → Zustand stores in `stores/`
- Server state → TanStack Query (useQuery, useMutation)
- WebSocket state → `stores/notification.store.ts`
- NEVER fetch data directly in components

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
- NEVER use magic strings for routes, events, or roles
- NEVER store tokens in localStorage — Zustand memory only
