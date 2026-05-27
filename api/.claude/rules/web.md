---
paths:
  - "web/**/*.{ts,tsx}"
---

# Web (Public Frontend) Rules

## Next.js App Router
- Server components by default
- Add `'use client'` only when you need: hooks, event handlers, browser APIs
- Layout in `app/layout.tsx` — do not duplicate head/font setup

## Design System (Public pages)
- Font: Playfair Display for headings, Noto Sans Thai for body
- Background: --tn-cream (#FAF6F0) — NEVER pure white
- Gold (#C9A84C) accents prominently
- Generous whitespace, organic feel
- No glassmorphism, no purple gradients, no neon

## What NOT to Do
- No emoji in UI components
- No exclamation marks in copy
- No pure black text — use --tn-brown (#2C1810)
- No studio-bright food photography style references in copy

## Pages in Scope
- `/` → Landing page (Hero, About, Visit Us, Footer)
- `/menu` → Menu with category filter + bottom sheet on tap
