---
paths:
  - "src/**/*.{ts,tsx}"
---

# Routing Rules — React Router DOM v6

## Route Structure
```tsx
// src/main.tsx or src/router.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

const router = createBrowserRouter([
  { path: ROUTES.LOGIN, element: <LoginPage /> },
  {
    path: ROUTES.POS,
    element: <ProtectedRoute roles={['ADMIN', 'CASHIER']} />,
    children: [
      { index: true, element: <PosPage /> },
      { path: ROUTES.POS_BILL(':id'), element: <BillPage /> },
      { path: ROUTES.POS_PAYMENT(':id'), element: <PaymentPage /> },
    ]
  },
  // etc.
])
```

## Navigation — ALWAYS use constants
```ts
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

// CORRECT
const navigate = useNavigate()
navigate(ROUTES.POS)
navigate(ROUTES.POS_BILL(billId))

// WRONG
navigate('/pos')
navigate(`/pos/bills/${billId}`)
```

## Protected Routes
Every internal route must check role:
```tsx
// components/internal/ProtectedRoute.tsx
import { useAuth } from '@/hooks/useAuth'
import { Navigate } from 'react-router-dom'
import { Role } from '@/types'

interface Props {
  roles: Role[]
}

export function ProtectedRoute({ roles }: Props) {
  const { user } = useAuth()
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />
  if (!roles.includes(user.role)) return <Navigate to={ROUTES.LOGIN} replace />
  return <Outlet />
}
```

## Reading URL Params
```ts
import { useParams } from 'react-router-dom'
const { id } = useParams<{ id: string }>()
```
