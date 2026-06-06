---
paths:
  - "src/**/*.{ts,tsx}"
---

# Code Comments Rules

## Language
English ONLY — no Thai, no mixed language, no transliteration.

## Core Philosophy
Code should be self-explanatory through clear naming.
Comments explain WHY — not WHAT or HOW.
If you feel the need to comment WHAT the code does, rename the variable or function instead.

## When to Comment ✅
Comment only when the code alone cannot convey the intent:

### 1. Business rule reference
```ts
// BR-P02: bill must be paid in full — no partial payments allowed
if (amount < bill.total) throw new Error(...)

// Table returns to AVAILABLE only when Cashier explicitly clears it
// Automatic status change is intentionally disabled here
```

### 2. Non-obvious technical decision
```ts
// Ticket is one-time use — delete immediately after validation
// to prevent replay attacks
ticketStore.delete(ticket)

// Use sparse index because email is optional
// unique + sparse allows multiple documents with no email field
email: { type: String, unique: true, sparse: true }
```

### 3. Warning about side effects
```ts
// Calling this clears the refresh token cookie
// Make sure the response is sent immediately after
res.clearCookie('refreshToken', cookieOptions)
```

### 4. TODO / FIXME with context
```ts
// TODO: implement token blacklist for immediate invalidation on logout
// Currently relies on short expiry (15m) as mitigation
```

## When NOT to Comment ❌
```ts
// WRONG — explains WHAT, not WHY
// loop through items
items.forEach(item => ...)

// WRONG — restates the code
// set user to null
user = null

// WRONG — obvious from the name
// get user by id
const user = await getUserById(id)

// WRONG — Thai language
// ตรวจสอบว่า user มีสิทธิ์หรือไม่
if (!hasPermission(user)) ...
```

## Format Rules
- Single line: `// comment` with one space after `//`
- Multi line: use `//` on each line — avoid `/* */` blocks
- JSDoc on exported functions and interfaces only
- No commented-out code — delete it, use git instead

## JSDoc — Exported Functions Only
```ts
/**
 * Generates a short human-readable ID for bills.
 * Format: B-XXXX where X is uppercase alphanumeric (ambiguous chars excluded).
 */
export function generateBillId(): string { ... }
```
