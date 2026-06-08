---
name: new-component
description: Create a new React component for TonNam srms/ internal frontend. Use when building table cards, order items, status badges, modals, or any staff-facing UI element.
---

# New Internal Component — TonNam srms/

Create a component for: **$ARGUMENTS**

## Step 1 — Decide: Where does it live?
```
components/internal/   ← TonNam-specific (Sidebar, BottomNav, TableCard)
components/ui/         ← shadcn/ui base components (auto-generated)
```

## Step 2 — Component Template
```tsx
// src/components/internal/<ComponentName>.tsx
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SomeIcon } from 'lucide-react'

interface <ComponentName>Props {
  // define all props with types
}

export function <ComponentName>({ ...props }: <ComponentName>Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* content */}
    </div>
  )
}
```

## Step 3 — Status Badge Pattern
```tsx
const STATUS_STYLES = {
  AVAILABLE: 'bg-green-100 text-green-800',
  OCCUPIED:  'bg-blue-100 text-blue-800',
  RESERVED:  'bg-yellow-100 text-yellow-800',
  PAID:      'bg-gray-100 text-gray-600',
} as const

<Badge className={STATUS_STYLES[status]}>{status}</Badge>
```

## Step 4 — Design Checklist
- [ ] Font: Noto Sans Thai (default — no font-display)
- [ ] Background: white or gray — not cream
- [ ] Primary action: Forest Green (#1B4332)
- [ ] Icons from Lucide React only
- [ ] shadcn/ui as base components
- [ ] Compact — no excessive padding
- [ ] Mobile-friendly if for Waiter/Kitchen

## Step 5 — Verify
```bash
npx tsc --noEmit
npm run lint
```
