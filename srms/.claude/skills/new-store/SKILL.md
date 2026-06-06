---
name: new-store
description: Create a new Zustand store for TonNam srms/. Use when adding global client state that isn't server data (auth, WebSocket state, notifications, UI state).
---

# New Zustand Store — TonNam srms/

Create a store for: **$ARGUMENTS**

## When to Create a Store
✅ Auth state (user, token)
✅ Real-time state from WebSocket
✅ Toast/notification queue
✅ UI state shared across many components

❌ API data → use TanStack Query instead
❌ Form state → use local useState instead
❌ Single component state → use local useState instead

## Store Template
`src/stores/<name>.store.ts`:

```ts
import { create } from 'zustand'

interface <Name>State {
  // state fields
  // action functions
  set<Field>: (value: Type) => void
  clear: () => void
}

export const use<Name>Store = create<<Name>State>((set, get) => ({
  // initial state
  field: null,

  // actions
  set<Field>: (value) => set({ field: value }),
  clear: () => set({ field: null }),
}))
```

## Usage in Components
```ts
// Select only what you need — avoid subscribing to entire store
const field = use<Name>Store(state => state.field)
const setField = use<Name>Store(state => state.setField)
```

## Checklist
- [ ] Interface defines all state + actions
- [ ] Initial state is defined
- [ ] Actions use `set()` only — no direct mutation
- [ ] Export uses `use<Name>Store` naming convention
- [ ] No API calls inside store — use TanStack Query for that
- [ ] No localStorage — memory only

## Verify
```bash
npx tsc --noEmit
```
