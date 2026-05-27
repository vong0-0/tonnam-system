---
name: code-review
description: Review code changes for TonNam. Checks business rules, security, TypeScript correctness, and project conventions. Use before opening a PR or when asked to review a diff.
context: fork
agent: Explore
---

# Code Review — TonNam

Review the current changes (run `git diff HEAD` or `git diff main`) for: **$ARGUMENTS**

## Review Checklist

### 1. Business Rules
- [ ] No partial bill payment logic
- [ ] Bill status transitions only OPEN → PAID | CANCELLED
- [ ] Table status transitions follow correct flow
- [ ] All bill edits create an AuditLog entry with reason
- [ ] Role-based access enforced on routes

### 2. Security
- [ ] No secrets or credentials in code
- [ ] No raw SQL/NoSQL injection risks
- [ ] Authentication middleware on all protected routes
- [ ] Passwords go through bcrypt — never stored plain
- [ ] Stack traces not exposed in API responses
- [ ] JWT properly validated

### 3. TypeScript
- [ ] No `any` types
- [ ] No `as unknown` casts
- [ ] Return types explicitly declared on functions
- [ ] Types imported from `types/` barrel, not inline

### 4. API Layer (if applicable)
- [ ] Response uses `utils/response.ts` helpers
- [ ] Zod schema validates all inputs
- [ ] Controller is thin — logic in service
- [ ] Error handling via `next(err)` pattern

### 5. Frontend (if applicable)
- [ ] No magic strings — constants used
- [ ] API calls through `lib/api.ts` only
- [ ] Socket events through `lib/socket.ts` only
- [ ] No `console.log` left in code

### 6. Tests
- [ ] New feature has tests
- [ ] Happy path covered
- [ ] Error cases covered
- [ ] Tests actually run and pass

## Output Format
Report findings as:
- 🔴 **Critical** — must fix (security, business rule violation, broken tests)
- 🟡 **Warning** — should fix (convention violation, missing test)
- 🟢 **Suggestion** — optional improvement

List only real issues. Do not flag style preferences or over-engineer.
