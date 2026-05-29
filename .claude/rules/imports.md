---
paths:
  - "api/**/*.ts"
  - "web/**/*.{ts,tsx}"
  - "srms/**/*.{ts,tsx}"
---

# Import Convention — Path Aliases

ALWAYS use path aliases for imports. Never use relative paths with ../

## api/ aliases (tsconfig.json)
```
@/*  →  src/*
```

Examples:
```ts
// CORRECT
import { UserModel } from '@/models/user.model'
import { success } from '@/utils/response'
import { problem } from '@/utils/problem'
import { authenticate } from '@/middleware/authenticate'
import { Role, AuthRequest } from '@/types'
import { logger } from '@/utils/logger'

// WRONG
import { UserModel } from '../models/user.model'
import { success } from '../../utils/response'
import { Role } from '../types'
```

## srms/ aliases (vite.config.ts + tsconfig.json)
```
@/*  →  src/*
```

Examples:
```ts
// CORRECT
import { api } from '@/lib/api'
import { socket } from '@/lib/socket'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { WS_EVENTS } from '@/constants/socket'
import { authStore } from '@/stores/auth.store'

// WRONG
import { api } from '../../lib/api'
import { ROUTES } from '../constants/routes'
```

## web/ aliases (tsconfig.json + next.config.ts)
```
@/*  →  src/*
```

Examples:
```ts
// CORRECT
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'

// WRONG
import { api } from '../../lib/api'
```