---
name: fix-issue
description: Fix a GitHub issue in the TonNam system. Invoke with issue number.
disable-model-invocation: true
allowed-tools: Bash(gh *) Bash(git *) Bash(npm test *) Bash(npx tsc *)
---

# Fix Issue — TonNam

Fix GitHub issue: **$ARGUMENTS**

## Steps

1. **Read the issue**
```bash
gh issue view $ARGUMENTS
```

2. **Understand the scope**
   - Which layer is affected? (api / web / srms)
   - Which business rule is involved?
   - Is there a failing test to reproduce?

3. **Create a branch**
```bash
git checkout -b fix/<short-description>
```

4. **Write a failing test first** (if applicable)
   - Reproduce the bug in a test
   - Confirm it fails before fixing

5. **Implement the fix**
   - Fix root cause, not symptom
   - Follow layer rules from CLAUDE.md
   - Do not change unrelated code

6. **Verify**
```bash
# TypeScript
cd api && npx tsc --noEmit

# Tests
npm test -- <relevant.test.ts>
```

7. **Commit**
```
fix(<scope>): <description>

Fixes #$ARGUMENTS
```

8. **Open PR**
```bash
gh pr create --title "fix: <description>" --body "Fixes #$ARGUMENTS"
```
