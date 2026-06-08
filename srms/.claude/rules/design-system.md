---
paths:
  - "src/**/*.{ts,tsx,css}"
---

# Design System Rules — Internal Pages

## CRITICAL
- Font: Noto Sans Thai ONLY — NO Playfair Display ever
- Background: White or Gray (#F1F3F5) — NOT cream
- Primary action: Forest Green (#1B4332)

## Color Usage
```
Backgrounds:
  Page         → bg-white or bg-gray-50
  Sidebar      → bg-[#1B4332]  (forest)
  Active nav   → bg-[#2D6A4F]  (forest-light)

Actions:
  Primary btn  → bg-[#1B4332] text-white hover:bg-[#2D6A4F]
  Danger btn   → bg-[#C0392B] text-white
  Ghost btn    → border border-gray-200 text-[#2C1810]

Status Badges:
  AVAILABLE    → bg-green-100 text-green-800
  OCCUPIED     → bg-blue-100 text-blue-800
  RESERVED     → bg-yellow-100 text-yellow-800
  PAID         → bg-gray-100 text-gray-600
  OPEN         → bg-orange-100 text-orange-800
  COOKED       → bg-green-100 text-green-800
  CANCELLED    → bg-red-100 text-red-800
```

## Layout
```
Desktop (POS + Admin):
  Sidebar: 240px fixed left
  Content: flex-1 with overflow-auto
  Min width: 1280px

Mobile (Waiter + Kitchen):
  BottomNav: fixed bottom
  Content: pb-16 to avoid BottomNav overlap
  Min width: 375px
```

## shadcn/ui Components
Use shadcn components as base — customize with Tailwind:
```tsx
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { Table } from '@/components/ui/table'
```

## Lucide Icons
```tsx
import { ChefHat, Receipt, Users, BarChart3 } from 'lucide-react'
// Always size-5 (20px) for inline icons
// size-6 (24px) for nav icons
<ChefHat className="size-5" />
```

## What NOT to Do
```
❌ Playfair Display font
❌ Cream (#FAF6F0) background
❌ Gold (#C9A84C) as primary color
❌ Decorative elements from public pages
❌ Generous whitespace — this is information-dense
```
