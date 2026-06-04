---
paths:
  - "src/**/*.{ts,tsx}"
---

# TanStack Query Rules

## NEVER fetch in components directly
```ts
// WRONG
useEffect(() => {
  fetch('/v1/tables').then(...)
}, [])

// CORRECT — always TanStack Query
const { data, isLoading } = useQuery({
  queryKey: ['tables'],
  queryFn: () => api.get('/v1/tables').then(r => r.data.data)
})
```

## Query Key Convention
```ts
// Use array with resource + filters
['tables']
['tables', { status: 'OCCUPIED' }]
['bills', billId]
['bills', billId, 'orders']
['menu-items', { categoryId }]
```

## Standard Query Pattern
```ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useTables(status?: string) {
  return useQuery({
    queryKey: ['tables', { status }],
    queryFn: async () => {
      const { data } = await api.get('/v1/tables', {
        params: { status }
      })
      return data.data  // unwrap EnvelopeResponse
    },
    staleTime: 30_000,  // 30 seconds
  })
}
```

## Mutation Pattern
```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useCreateBill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateBillInput) =>
      api.post('/v1/bills', body).then(r => r.data.data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      queryClient.invalidateQueries({ queryKey: ['bills'] })
    },
  })
}
```

## Custom Hooks Location
All query hooks live in `src/hooks/`:
```
hooks/
├── useAuth.ts
├── useSocket.ts
├── useToast.ts
├── useTables.ts       ← TanStack Query hooks
├── useBills.ts
├── useOrders.ts
├── useMenuItems.ts
└── useAnalytics.ts
```

## Loading & Error States
```tsx
const { data, isLoading, isError } = useTables()

if (isLoading) return <TableSkeleton />
if (isError) return <ErrorMessage />
return <TableGrid tables={data} />
```

## QueryClient Setup
```ts
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})
```
