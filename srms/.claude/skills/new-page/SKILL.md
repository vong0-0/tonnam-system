---
name: new-page
description: Create a new page for TonNam srms/ internal staff frontend. Use when adding a new route under /pos, /waiter, /kitchen, or /admin. Covers component structure, role protection, data fetching with TanStack Query, and layout.
---

# New Internal Page — TonNam srms/

Create a new page for: **$ARGUMENTS**

## Step 1 — Identify Scope
- Which subsystem? (pos / waiter / kitchen / admin)
- Which roles can access? (ADMIN / CASHIER / WAITER / KITCHEN)
- Desktop (1280px) or Mobile (375px)?
- What data does it need from the API?

## Step 2 — Create Page File
`src/pages/<subsystem>/index.tsx` or `src/pages/<subsystem>/<name>.tsx`:

```tsx
import { useAuth } from '@/hooks/useAuth'
import { use<Resource> } from '@/hooks/use<Resource>'
import { Sidebar } from '@/components/internal/Sidebar'       // desktop
// import { BottomNav } from '@/components/internal/BottomNav' // mobile

export default function <Name>Page() {
  const { data, isLoading, isError } = use<Resource>()

  if (isLoading) return <PageSkeleton />
  if (isError) return <ErrorState />

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />  {/* desktop only */}
      <main className="flex-1 overflow-auto p-6">
        {/* content */}
      </main>
    </div>
  )
}
```

## Step 3 — Register Route
Add to router in `src/main.tsx` or `src/router.tsx`:
```tsx
import { ROUTES } from '@/constants/routes'
{
  path: ROUTES.<NAME>,
  element: <ProtectedRoute roles={['ADMIN', 'CASHIER']} />,
  children: [{ index: true, element: <NamePage /> }]
}
```

## Step 4 — Create Query Hook
`src/hooks/use<Resource>.ts`:
```ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function use<Resource>() {
  return useQuery({
    queryKey: ['<resource>'],
    queryFn: async () => {
      const { data } = await api.get('/v1/<resource>')
      return data.data
    },
  })
}
```

## Step 5 — Design Checklist
- [ ] Font: Noto Sans Thai only (no Playfair Display)
- [ ] Background: bg-white or bg-gray-50
- [ ] Primary action: Forest Green (#1B4332)
- [ ] Compact layout — information-dense
- [ ] Desktop: Sidebar present
- [ ] Mobile: BottomNav present + pb-16 on content
- [ ] Loading skeleton state
- [ ] Error state

## Step 6 — Verify
```bash
npx tsc --noEmit
npm run lint
npm run dev  # visual check
```
