---
name: code-review
description: Review code changes for TonNam srms/ internal frontend. Checks business rules, design system, React patterns, TypeScript, and role-based access. Use before opening a PR.
context: fork
---

# Code Review — TonNam srms/

Review current changes for: **$ARGUMENTS**

Run `git diff HEAD` or `git diff main` first.

## Checklist

### 1. Business Rules
- [ ] Bill status: OPEN → PAID | CANCELLED only
- [ ] Table returns AVAILABLE only when Cashier clears it
- [ ] Every Bill edit includes reason field
- [ ] Role-based access enforced via ProtectedRoute
- [ ] No WAITER accessing /pos routes
- [ ] No KITCHEN accessing anything outside /kitchen

### 2. Design System
- [ ] Font: Noto Sans Thai only (no Playfair Display)
- [ ] Background: white or gray (no cream #FAF6F0)
- [ ] Primary action: Forest Green (#1B4332)
- [ ] Icons from Lucide React only
- [ ] shadcn/ui as base components
- [ ] Status badges use correct color scheme

### 3. React Patterns
- [ ] No direct API calls in components — TanStack Query only
- [ ] No useEffect for data fetching
- [ ] Socket listeners cleaned up on unmount
- [ ] No magic strings — constants used
- [ ] API calls through lib/api.ts only
- [ ] Socket events through lib/socket.ts only

### 4. State Management
- [ ] API data → TanStack Query (not Zustand)
- [ ] Auth/WS state → Zustand
- [ ] No tokens in localStorage
- [ ] Store selectors pick only needed fields

### 5. TypeScript
- [ ] No `any` types
- [ ] All props interfaces defined
- [ ] Imports use @/ alias

### 6. Routing
- [ ] New routes registered in router
- [ ] ProtectedRoute wraps role-restricted pages
- [ ] Navigation uses ROUTES constants

## Output Format
- 🔴 Critical — must fix
- 🟡 Warning — should fix
- 🟢 Suggestion — optional

List only real issues. No style preferences.
