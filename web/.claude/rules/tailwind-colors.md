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
}
```

These become usable as utility classes directly:
```
bg-forest        text-forest        border-forest
bg-gold          text-gold          border-gold
bg-cream         text-cream         border-cream
bg-brown-dark    text-brown-dark    border-brown-dark
bg-brown-mid     text-brown-mid     border-brown-mid
bg-brown-light   text-brown-light   border-brown-light
bg-terracotta    text-terracotta    border-terracotta
```

## CORRECT vs WRONG

```tsx
// CORRECT — use token
<p className="text-brown-mid">body text</p>
<section className="bg-cream">...</section>
<button className="bg-forest text-white hover:bg-forest-light">CTA</button>
<div className="border-gold">...</div>

// WRONG — hardcoded hex
<p className="text-[#6B4C3B]">body text</p>
<section className="bg-[#FAF6F0]">...</section>
<button className="bg-[#1B4332]">CTA</button>
```

## When Custom Values Are Allowed
Use `text-[#hex]` or `bg-[#hex]` ONLY for one-off values with no design meaning:
```tsx
// OK — truly one-off, no design token needed
<div className="border-[#E2E8F0]">...</div>
```

## When to Add a New Token
If a custom hex value appears in 2 or more places → add it to `@theme` in `globals.css`:

```css
/* globals.css */
@theme {
  /* existing tokens... */
  --color-new-token: #HEXVAL;  /* add here */
}
```

Then replace all usages with the token class:
```tsx
// Before
<div className="bg-[#HEXVAL]">
<span className="text-[#HEXVAL]">

// After
<div className="bg-new-token">
<span className="text-new-token">
```

## Opacity Variants
Tailwind v4 supports opacity via slash syntax with tokens too:
```tsx
// CORRECT
<div className="bg-forest/10">      ← 10% opacity
<div className="text-gold/80">      ← 80% opacity

// WRONG
<div className="bg-[#1B4332]/10">
```

## Shadows — Always Custom
Warm brown shadows are not color tokens — use the CSS variable directly in globals.css:
```css
.shadow-warm-sm { box-shadow: 0 1px 3px rgba(44,24,16,0.08); }
.shadow-warm-md { box-shadow: 0 4px 12px rgba(44,24,16,0.12); }
.shadow-warm-lg { box-shadow: 0 8px 32px rgba(44,24,16,0.18); }
```
