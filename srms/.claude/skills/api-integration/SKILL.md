---
name: api-integration
description: Integrate TonNam SRMS API into the internal staff frontend. Use when fetching tables, bills, orders, menu, or any backend data. Covers TanStack Query hooks, Axios patterns, and mutation with cache invalidation.
---

# API Integration — TonNam srms/

Integrate API for: **$ARGUMENTS**

## Axios Instance — lib/api.ts
```ts
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 — clear auth and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)
```

## Query Hook Pattern
`src/hooks/use<Resource>.ts`:
```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { API } from '@/constants/api'

// READ
export function use<Resource>s(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['<resource>s', filters],
    queryFn: async () => {
      const { data } = await api.get(API.<RESOURCE>S, { params: filters })
      return data.data  // unwrap EnvelopeResponse
    },
  })
}

// CREATE
export function useCreate<Resource>() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Create<Resource>Input) =>
      api.post(API.<RESOURCE>S, body).then(r => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['<resource>s'] })
    },
  })
}

// UPDATE
export function useUpdate<Resource>() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Update<Resource>Input }) =>
      api.patch(`${API.<RESOURCE>S}/${id}`, body).then(r => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['<resource>s'] })
    },
  })
}
```

## Usage in Component
```tsx
import { useTables } from '@/hooks/useTables'

export function TableGrid() {
  const { data: tables, isLoading, isError } = useTables({ status: 'OCCUPIED' })
  const { mutate: createBill } = useCreateBill()

  if (isLoading) return <Skeleton />
  if (isError) return <ErrorState />

  return (
    <div>
      {tables.map(table => (
        <TableCard key={table._id} table={table}
          onCreateBill={() => createBill({ tableId: table._id })}
        />
      ))}
    </div>
  )
}
```

## API Response Shape
```ts
// Always unwrap .data from EnvelopeResponse
const { data } = await api.get('/v1/tables')
return data.data        // single or array
return data.pagination  // if list endpoint
```

## Verify
```bash
npx tsc --noEmit
npm run dev
# Check Network tab — confirm Bearer token sent
```
