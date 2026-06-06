---
name: ws-integration
description: Add WebSocket real-time functionality to TonNam srms/. Use when wiring up Socket.io events for live table updates, kitchen orders, or payment confirmations.
---

# WebSocket Integration — TonNam srms/

Add WebSocket event for: **$ARGUMENTS**

## Existing Events Reference
```ts
// constants/socket.ts
export const WS_EVENTS = {
  TABLE_STATUS_UPDATED:        'table:status_updated',
  BILL_PAYMENT_CONFIRMED:      'bill:payment_confirmed',
  ORDER_NEW_RECEIVED:          'order:new_order_received',    // Kitchen
  ORDER_ITEM_STATUS_UPDATED:   'order:item_status_updated',   // Waiter
  MENU_ITEM_AVAIL_UPDATED:     'menu:item_availability_updated',
  SYSTEM_FORCE_LOGOUT:         'system:force_logout',
} as const
```

## Socket Setup — lib/socket.ts
```ts
import { io } from 'socket.io-client'

export const socket = io(import.meta.env.VITE_API_URL, {
  path: '/v1/ws',
  autoConnect: false,  // connect manually after getting ticket
})
```

## Connect with Ticket
```ts
// hooks/useSocket.ts
import { socket } from '@/lib/socket'
import { api } from '@/lib/api'
import { API } from '@/constants/api'

export function useSocket() {
  const connect = async () => {
    const { data } = await api.post(API.WS_TICKET)
    const ticket = data.data.ticket
    socket.auth = { ticket }
    socket.connect()
  }

  const disconnect = () => socket.disconnect()

  return { connect, disconnect, socket }
}
```

## Listen to Event in Store
```ts
// stores/table.store.ts
import { socket } from '@/lib/socket'
import { WS_EVENTS } from '@/constants/socket'

// Setup listeners (call once on app init)
export function setupTableSocketListeners() {
  socket.on(WS_EVENTS.TABLE_STATUS_UPDATED, (payload) => {
    useTableStore.getState().updateTableStatus(payload.tableId, payload.status)
  })
}

// Cleanup
export function cleanupTableSocketListeners() {
  socket.off(WS_EVENTS.TABLE_STATUS_UPDATED)
}
```

## Use in Component
```tsx
import { useEffect } from 'react'
import { setupTableSocketListeners, cleanupTableSocketListeners } from '@/stores/table.store'

export function PosPage() {
  useEffect(() => {
    setupTableSocketListeners()
    return () => cleanupTableSocketListeners()  // cleanup on unmount
  }, [])
  // ...
}
```

## Rules
- ALWAYS use `WS_EVENTS` constants — no magic strings
- ALWAYS clean up listeners on unmount (`socket.off`)
- NEVER call `socket.connect()` without a ticket
- Store WS state in Zustand — not TanStack Query

## Verify
```bash
npx tsc --noEmit
# Check browser console for socket connection logs
# Trigger event from backend and confirm store updates
```
