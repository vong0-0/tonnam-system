---
name: commit
description: Write and create a Conventional Commits message for TonNam srms/ frontend changes. Invoke manually when ready to commit.
disable-model-invocation: true
allowed-tools: Bash(git status) Bash(git diff *) Bash(git add *) Bash(git commit *) Bash(git log *)
---

# Commit — TonNam srms/

## Format
```
<type>(<scope>): <short description>

[optional body — WHY not WHAT]
```

## Types
- `feat` → new page, component, or feature
- `fix` → bug fix
- `style` → CSS/design changes only
- `chore` → config, deps, tooling
- `refactor` → restructure without behavior change

## Scopes for srms/
- `pos` → POS pages
- `waiter` → Waiter pages
- `kitchen` → Kitchen pages
- `admin` → Admin pages
- `auth` → login, auth flow
- `components` → shared internal components
- `stores` → Zustand stores
- `hooks` → custom hooks
- `ws` → WebSocket integration
- `api` → lib/api.ts, query hooks
- `routing` → React Router config
- `deps` → package updates
- `config` → vite, tailwind, tsconfig

## Examples
```
feat(pos): add table map with real-time status from WebSocket
feat(waiter): add order status page with item-level updates
fix(kitchen): fix order card not refreshing after WS event
feat(admin): add user management table with TanStack Table
style(pos): update table card status badge colors
chore(deps): update TanStack Query to v5.x
```

## Rules
- Max 72 chars in subject line
- Imperative mood: "add" not "added"
- No period at end of subject

## Workflow
1. git status
2. git diff — confirm changes correct
3. git add <files>
4. Commit with message above
