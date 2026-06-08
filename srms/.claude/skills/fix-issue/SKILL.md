---
name: fix-issue
description: Fix a GitHub issue for TonNam srms/ internal frontend. Invoke with issue number.
disable-model-invocation: true
allowed-tools: Bash(gh *) Bash(git *) Bash(npm run *) Bash(npx tsc *)
---

# Fix Issue — TonNam srms/

Fix GitHub issue: **$ARGUMENTS**

## Steps

1. **Read the issue**
```bash
gh issue view $ARGUMENTS
```

2. **Understand the scope**
   - Which subsystem? (pos / waiter / kitchen / admin)
   - Which role is affected?
   - UI bug, logic bug, or WS issue?

3. **Create a branch**
```bash
git checkout -b fix/<short-description>
```

4. **Implement the fix**
   - Fix root cause — not symptom
   - Follow design system rules (internal personality)
   - Use constants — no magic strings
   - Do not change unrelated code

5. **Verify**
```bash
npx tsc --noEmit
npm run lint
npm run build
```

6. **Commit**
```
fix(<scope>): <description>

Fixes #$ARGUMENTS
```

7. **Open PR**
```bash
gh pr create --title "fix: <description>" --body "Fixes #$ARGUMENTS"
```
