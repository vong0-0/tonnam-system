---
paths:
  - "api/tests/**/*.ts"
  - "**/*.test.ts"
  - "**/*.spec.ts"
---

# Testing Rules

## Structure
- Unit tests: `api/tests/unit/<module>.test.ts`
- Integration tests: `api/tests/integration/<resource>.test.ts`
- Test file mirrors source file structure

## What to Test
Every API endpoint needs:
1. Happy path (200/201)
2. Validation error (400) — missing/invalid fields
3. Unauthorized (401) — no token
4. Forbidden (403) — wrong role
5. Not found (404) — where applicable
6. Business rule violations (409) — where applicable

## Patterns
```ts
// Use supertest for integration tests
import request from 'supertest'
import app from '../../src/app'

// Seed test data in beforeEach, clean in afterEach
// Never depend on test order
// Use separate test DB (TEST_MONGODB_URI in .env.test)
```

## Run Commands
```bash
npm test                         # run all
npm test -- auth.test.ts         # run single file
npm test -- --coverage           # with coverage
npm run test:watch               # watch mode
```

## IMPORTANT
- Tests must pass before any PR
- Never skip tests with `.skip` without a comment explaining why
- Mock external services (email, payment gateway) — never call real ones in tests
