---
name: new-feature
description: Plan and implement a new feature end-to-end for TonNam. Use for larger features that touch multiple layers (api + frontend). Produces a SPEC before coding.
disable-model-invocation: true
---

# New Feature — TonNam

Feature to build: **$ARGUMENTS**

## Phase 1 — Explore (Plan Mode)
Before writing any code, read and understand:

1. Which pages/routes are affected?
2. Which API endpoints are needed (new or existing)?
3. Which business rules apply? (check CLAUDE.md)
4. Which roles have access?
5. What WebSocket events are needed (if any)?
6. What DB schema changes are needed?

## Phase 2 — Write SPEC
Create `SPEC-<feature>.md` with:
```md
# Feature: <name>

## Scope
- Files to create: [list]
- Files to modify: [list]
- Out of scope: [list]

## API Changes
- New endpoints: [list with method + path]
- Modified endpoints: [list]

## DB Changes
- New collections: [list]
- Modified schemas: [list]

## Business Rules
- [list applicable BRs from CLAUDE.md]

## Roles
- [which roles can access]

## WebSocket Events
- [events emitted + consumed]

## Verification
- [ ] Test: <end-to-end check that proves feature works>
```

## Phase 3 — Implement
Follow the spec in order:
1. Types → `api/src/types/`
2. DB Model → `api/src/models/`
3. Zod Schema → `api/src/schemas/`
4. Service → `api/src/services/`
5. Controller → `api/src/controllers/`
6. Route → `api/src/routes/`
7. Tests → `api/tests/`
8. Frontend components
9. Connect WS events if needed

## Phase 4 — Verify
```bash
cd api && npx tsc --noEmit
npm test -- <feature>.test.ts
```

All tests pass → run `/code-review` → open PR
