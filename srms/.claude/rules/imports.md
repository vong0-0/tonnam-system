---
paths:
  - "src/**/*.{ts,tsx}"
---

# Import Convention — Path Aliases

ALWAYS use @/ alias. Never use relative paths with ../

## srms/ aliases (vite.config.ts + tsconfig.json)
```
@/* → src/*
```

```ts
// CORRECT
import { api } from '@/lib/api'
import { socket } from '@/lib/socket'
import { useAuth } from '@/hooks/useAuth'
import { useTables } from '@/hooks/useTables'
import { ROUTES } from '@/constants/routes'
import { API } from '@/constants/api'
import { ROLES } from '@/constants/roles'
import { WS_EVENTS } from '@/constants/socket'
import { useAuthStore } from '@/stores/auth.store'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/internal/Sidebar'

// WRONG
import { api } from '../../lib/api'
import { ROUTES } from '../constants/routes'
```

## Exception
Same directory only:
```ts
import { TableCard } from './TableCard'  // OK — same directory
```
