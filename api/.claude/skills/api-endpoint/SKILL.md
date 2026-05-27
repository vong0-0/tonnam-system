---
name: api-endpoint
description: Scaffold a complete API endpoint for TonNam SRMS. Use when adding a new route, creating a CRUD endpoint, or implementing a new API feature. Covers route, controller, service, Zod schema, type, and tests.
---

# New API Endpoint — TonNam SRMS

Scaffold a complete endpoint for: **$ARGUMENTS**

Follow this exact order:

## Step 1 — Type Definition
Add to `api/src/types/<resource>.types.ts`:
```ts
export type <Resource>Status = 'STATUS_A' | 'STATUS_B'
// etc.
```
Export from `api/src/types/index.ts` barrel.

## Step 2 — Zod Schema
`api/src/schemas/<resource>.schema.ts`:
```ts
import { z } from 'zod'

export const create<Resource>Schema = z.object({
  field: z.string().min(1, 'Field is required'),
  // match field names from API contract exactly
})

export type Create<Resource>Input = z.infer<typeof create<Resource>Schema>
```

## Step 3 — Service
`api/src/services/<resource>.service.ts`:
```ts
// ALL business logic here — controller is thin
// Check business rules (CLAUDE.md)
// Throw descriptive Error — controller catches via next(err)
// Use .lean() for read-only queries
```

## Step 4 — Controller
`api/src/controllers/<resource>.controller.ts`:
```ts
import { success, successList } from '../utils/response'
import { problem } from '../utils/problem'

export const create<Resource> = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await <resource>Service.create(req.body, req.user.userId)
    return res.status(201).json(success(data))
  } catch (err) {
    next(err)
  }
}
```

Errors return `application/problem+json` — see `/api-conventions` for full format.

## Step 5 — Route
`api/src/routes/<resource>.routes.ts`:
```ts
// list + create
router
  .route('/')
  .get(authenticate, authorize(['ADMIN', 'CASHIER']), controller.list)
  .post(authenticate, authorize(['ADMIN']), validate(createSchema), controller.create)

// by-id
router
  .route('/:id')
  .get(authenticate, authorize(['ADMIN', 'CASHIER']), controller.getById)
  .patch(authenticate, authorize(['ADMIN']), validate(updateSchema), controller.update)
  .delete(authenticate, authorize(['ADMIN']), controller.delete)
```

## Step 6 — Tests
`api/tests/integration/<resource>.test.ts`:

| Case | Expected |
|---|---|
| Happy path GET list | 200 + EnvelopeResponse with array + pagination |
| Happy path POST | 201 + EnvelopeResponse with resource |
| Missing required field | 400 + ProblemDetail (type: validation-error) |
| No token | 401 + ProblemDetail (type: unauthorized) |
| Wrong role | 403 + ProblemDetail (type: forbidden) |
| Not found | 404 + ProblemDetail (type: not-found) |
| Duplicate / conflict | 409 + ProblemDetail (type: conflict) |

## Step 7 — Verify
```bash
cd api && npx tsc --noEmit
npm test -- <resource>.test.ts
```

Fix ALL TypeScript errors and failing tests before done.

> See `/api-conventions` for full EnvelopeResponse + ProblemDetail format.
