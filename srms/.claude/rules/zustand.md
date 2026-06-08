---
paths:
  - "src/stores/**/*.ts"
  - "src/hooks/**/*.ts"
---

# Zustand Store Rules

## When to Use Zustand vs TanStack Query
| Data | Use |
|---|---|
| Auth state (user, token, role) | Zustand |
| Table states from WebSocket | Zustand |
| Toast/notification queue | Zustand |
| API data (tables list, bills, menu) | TanStack Query |
| Form state | Local useState |

## Store Pattern
```ts
// src/stores/auth.store.ts
import { create } from 'zustand'
import { Role } from '@/types'

interface AuthState {
  user: { userId: string; name: string; role: Role } | null
  accessToken: string | null
  setAuth: (user: AuthState['user'], token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  setAuth: (user, accessToken) => set({ user, accessToken }),
  clearAuth: () => set({ user: null, accessToken: null }),
}))
```

## Access Store in Components
```ts
// CORRECT — select only what you need
const user = useAuthStore(state => state.user)
const clearAuth = useAuthStore(state => state.clearAuth)

// AVOID — subscribes to entire store (causes unnecessary re-renders)
const store = useAuthStore()
```

## 3 Stores in srms/
```
auth.store.ts         ← user, accessToken, role
table.store.ts        ← real-time table statuses from WS
notification.store.ts ← toast queue from WS events
```

## Token Storage
```ts
// CORRECT — Zustand memory only
const { accessToken } = useAuthStore()

// WRONG — never store tokens in localStorage
localStorage.setItem('token', accessToken)
```
