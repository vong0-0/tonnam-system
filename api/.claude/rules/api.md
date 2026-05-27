---
paths:
  - "api/**/*.ts"
---

# API Layer Rules

## Layer Responsibilities (NEVER mix)
- `routes/` → register endpoints + middleware chain only, no logic
- `controllers/` → parse req, call service, return response. No DB access.
- `services/` → ALL business logic. Calls models only.
- `models/` → Mongoose schema + Model definition only
- `schemas/` → Zod validation schemas only
- `types/` → TypeScript types only, no runtime code

## Response Format (from API contract)

Two content types — never mix:

| Situation | Content-Type | Use |
|---|---|---|
| 2xx success | `application/json` | `success()` or `successList()` from `utils/response` |
| 4xx / 5xx error | `application/problem+json` | `problem()` from `utils/problem` |

```ts
// Success — single resource
res.status(200).json(success(data))

// Success — list
res.status(200).json(successList(items, pagination))

// Success — action/delete with no data
res.status(200).json(success(null))

// Error
res.status(404).json(problem({
  type: 'not-found',
  title: 'Not Found',
  status: 404,
  detail: 'The requested resource was not found.',
  instance: req.path,
  errors: null
}))
```

> Full format reference: invoke `/api-conventions` skill

## Standard HTTP Status Codes
- `200` → GET, PATCH, DELETE, action endpoints
- `201` → POST create
- `400` → validation error / bad logic
- `401` → no/invalid token
- `403` → wrong role
- `404` → not found
- `409` → conflict (duplicate, pending bills, etc.)
- `429` → rate limit
- `500` → unexpected

## Middleware Chain Pattern
```ts
router.post('/path',
  authenticate,
  authorize(['ADMIN']),
  validate(schema),
  controller.method
)
```

## Mongoose
- `.lean()` for read-only queries
- Always paginate — never `find({})` without limit
- Use transactions (`.session()`) for multi-document operations
- Index defined in schema, not manually

## Short ID
- Bills: `B-XXXX` via `utils/short-id.ts`
- Orders: `O-XXXX` via `utils/short-id.ts`
