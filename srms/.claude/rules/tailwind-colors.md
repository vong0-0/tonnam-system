---
paths:
  - "src/**/*.{ts,tsx,css}"
---

# Tailwind Color Token Rules (Tailwind v4)

## Core Rule
ALWAYS use Tailwind tokens from `@theme` — never hardcode hex values in className.

In Tailwind v4, CSS variables defined under `@theme` become utility classes automatically:
```css
/* globals.css */
@theme {
  --color-forest:      #1B4332;
  --color-forest-light:#2D6A4F;
  --color-gold:        #C9A84C;
  --color-gold-light:  #E8C97A;
  --color-terracotta:  #C4623A;
  --color-cream:       #FAF6F0;
  --color-cream-dark:  #F0E8DC;
  --color-brown-dark:  #2C1810;
  --color-brown-mid:   #6B4C3B;
  --color-brown-light: #A07850;
  --color-success:     #0F9B8E;
  --color-warning:     #F5A623;
  --color-danger:      #C0392B;
}
```

These become usable as utility classes directly:
```
bg-forest        text-forest        border-forest
bg-forest-light  text-forest-light  border-forest-light
bg-gold          text-gold          border-gold
bg-danger        text-danger        border-danger
bg-success       text-success       border-success
bg-warning       text-warning       border-warning
```

## CORRECT vs WRONG

```tsx
// CORRECT — use token
<button className="bg-forest text-white hover:bg-forest-light">
  Confirm Payment
</button>
<Badge className="bg-danger/10 text-danger">CANCELLED</Badge>
<span className="text-success">COOKED</span>

// WRONG — hardcoded hex
<button className="bg-[#1B4332] hover:bg-[#2D6A4F]">
<Badge className="bg-[#C0392B]/10 text-[#C0392B]">
```

## Status Badge Tokens
Use semantic tokens for status colors:
```tsx
const STATUS_CLASS = {
  AVAILABLE: 'bg-success/10 text-success',
  OCCUPIED:  'bg-forest/10 text-forest',
  RESERVED:  'bg-warning/10 text-warning',
  PAID:      'bg-brown-light/10 text-brown-light',
  CANCELLED: 'bg-danger/10 text-danger',
  COOKED:    'bg-success/10 text-success',
} as const
```

## When Custom Values Are Allowed
Use `text-[#hex]` ONLY for truly one-off values with no design meaning:
```tsx
// OK — one-off, not a design token
<div className="border-[#E2E8F0]">
```

## When to Add a New Token
If a custom hex appears in 2 or more places → add to `@theme` in `globals.css`:
```css
@theme {
  --color-new-token: #HEXVAL;
}
```
Then replace all usages with `bg-new-token` / `text-new-token`.

## Opacity Variants
```tsx
// CORRECT
<div className="bg-forest/10">   ← 10% opacity forest green
<div className="bg-danger/10">   ← 10% opacity red (for badge bg)

// WRONG
<div className="bg-[#1B4332]/10">
```
