---
paths:
  - "srms/**/*.{ts,tsx}"
---

# SRMS (Internal Staff Frontend) Rules

## Component Rules
- All pages in `pages/` — one file per route
- Shared layout components in `components/internal/`
- Primitive UI components in `components/ui/`
- Never fetch data directly in components — use hooks or stores

## State Management
- Global state → Zustand stores in `stores/`
- Server state (API data) → local useState or React Query if needed
- WebSocket state → `stores/notification.store.ts`
- Never call `useSocket` outside of hooks or stores

## API Calls
```ts
// CORRECT — always use the Axios instance
import { api } from '@/lib/api'
const data = await api.get('/v1/tables')

// WRONG
fetch('/v1/tables')
axios.get(...)  // don't import axios directly
```

## WebSocket Events
```ts
// CORRECT — use socket instance and constants
import { socket } from '@/lib/socket'
import { WS_EVENTS } from '@/constants/socket'
socket.on(WS_EVENTS.TABLE_STATUS_UPDATED, handler)

// WRONG — magic strings
socket.on('table:status_updated', handler)
```

## Constants — Always Use, Never Hardcode
```ts
import { ROUTES } from '@/constants/routes'
import { API } from '@/constants/api'
import { ROLES } from '@/constants/roles'
import { WS_EVENTS } from '@/constants/socket'

// WRONG
navigate('/pos/bills/123')
fetch('/v1/bills')
if (role === 'ADMIN')
socket.on('table:status_updated', ...)
```

## Design System (Internal pages)
- Font: Noto Sans Thai ONLY (no Playfair Display on internal pages)
- Background: white or --tn-ink-50 (#F1F3F5)
- Primary action: Forest Green (#1B4332)
- Compact, information-dense layout
- No decorative elements or gold accents on internal pages

## Mobile vs Desktop
- Waiter + Kitchen pages: mobile-first (375px)
- POS + Admin pages: desktop-first (1280px)
- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`
