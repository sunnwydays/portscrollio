@AGENTS.md

# Claude-Specific Instructions

## Before Writing Code

1. Check `node_modules/next/dist/docs/` for the relevant Next.js 16 guide. This version has breaking changes.
2. Check `design/<page>/` for mockups and DESIGN.md before implementing any page.
3. Read existing files before modifying them.

## Design System Quick Reference

The full "Luminous Logic" design system is documented in AGENTS.md and in each page's `design/<page>/DESIGN.md`. Key reminders:

- **No borders** — use tonal surface shifts
- **No white text** — use `#dae2fd` (`on_surface`)
- **No monospace** outside code snippets — Manrope for headlines, Inter for body
- **Glassmorphism** on nav/floating elements — 60% opacity, backdrop-blur 20px
- **Gradient CTAs** — 135deg from `#4edea3` to `#10b981`
- **Cards hover** — background shift + 1.02x image scale, no dividers

## Development

```sh
pnpm dev     # start dev server
pnpm build   # production build
pnpm lint    # eslint
```

## Conventions

- Server Components by default. Only use `"use client"` when necessary.
- Tailwind CSS 4 only — no other styling solutions.
- `@/*` path alias for imports.
- pnpm for package management (not npm or yarn).
