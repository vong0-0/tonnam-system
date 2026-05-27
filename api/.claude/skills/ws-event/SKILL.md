---
name: ws-event
description: Add a new WebSocket event to TonNam. Use when adding real-time functionality, new Socket.io events, or wiring up frontend listeners for live updates.
---

# New WebSocket Event — TonNam

Add WebSocket event for: **$ARGUMENTS**

## Step 1 — Define Type
`api/src/types/websocket.types.ts`:
```ts
export interface Ws<Event>Payload {
  // fields the event carries
}
```

Export from `types/index.ts`.

## Step 2 — Add Event Name Constant
`api/src/websocket/ws-events.ts`:
```ts
export const WS_EVENTS = {
  // existing events...
  <RESOURCE>_<ACTION>: '<resource>:<action>',  // e.g. 'table:status_updated'
} as const
```

## Step 3 — Emit from Service
In the relevant `api/src/services/` file, after state changes:
```ts
import { wsServer } from '../websocket/ws-server'
import { WS_EVENTS } from '../websocket/ws-events'
import { Ws<Event>Payload } from '../types'

const payload: Ws<Event>Payload = { ... }
wsServer.to(room).emit(WS_EVENTS.<RESOURCE>_<ACTION>, payload)
```

Emit to the correct room — see `ws-rooms.ts` for room naming.

## Step 4 — Frontend Constant (srms/)
`srms/src/constants/socket.ts`:
```ts
export const WS_EVENTS = {
  // existing...
  <RESOURCE>_<ACTION>: '<resource>:<action>',
} as const
```

Keep in sync with backend constant.

## Step 5 — Frontend Listener
In the relevant store or hook:
```ts
import { WS_EVENTS } from '@/constants/socket'
import { socket } from '@/lib/socket'

socket.on(WS_EVENTS.<RESOURCE>_<ACTION>, (payload) => {
  // update Zustand store
})

// Always clean up
return () => {
  socket.off(WS_EVENTS.<RESOURCE>_<ACTION>)
}
```

## Existing Events Reference
```
table:status_updated
bill:payment_confirmed
order:new_order_received      ← Kitchen
order:item_status_updated     ← Waiter
menu:item_availability_updated
system:force_logout
```
