@AGENTS.md

# Project Map

Quick reference for navigating the codebase. Read this before exploring blindly.

## Routes & Pages

| Route | File | What it does |
|-------|------|-------------|
| `/` | `app/page.tsx` | For You — fetches `projects` from Supabase, passes to `VideoFeed` |
| `/explore` | `app/explore/page.tsx` | Grid of posts from Supabase; tag filter UI exists but is not wired |
| `/explore/[slug]` | `app/explore/[slug]/page.tsx` | Renders `/content/{slug}.md` via remark; falls back to YouTube embed |

No `/blog/` route. Post detail is at `/explore/[slug]`.

## Key Components

```
components/sidebar/     — Sidebar, MobileHeader, MobileDrawer, MobileNav, NavLink, ProfileAvatar
components/for-you/     — VideoFeed (scroll state), VideoCard (player + actions), VideoActions (dead code, unused)
components/explore/     — PostCard (grid card with YouTube auto-thumbnail)
components/icons.tsx    — All SVG icons
```

## Lib Files

```
lib/supabase.ts    — supabase (public client), supabaseAdmin (bypasses RLS, Server Components only)
lib/github.ts      — getLatestCommit(username), 300s revalidation
lib/mock-data.ts   — authoritative TypeScript interfaces (Project, Post, Stat, Settings)
lib/playlist.ts    — buildPlaylist(): shuffles projects, interleaves hobbies every 2–3 slots
```

## Content & Data

- **Video/post metadata** → Supabase tables: `projects`, `posts`, `stats`, `settings`
- **Blog post content** → `/content/{slug}.md` files (not stored in DB)
- **Profile avatars** → `public/avatars/{1,2,3}/` with weights 75%/20%/5%

## Pending Work

- `/resume` page: embed PDF from Supabase Storage (currently points to Overleaf)
- Explore tag filtering: UI renders but onClick logic is missing
- `components/for-you/VideoActions.tsx`: dead code, safe to delete

---

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
- Tailwind CSS 4 only - no other styling solutions.
- `@/*` path alias for imports.
- pnpm for package management (not npm or yarn).
- **No emdash or double hyphens** in git commits, code, or code comments. Use commas, colons, or single hyphens for separation.
- **Commit style** — No conventional commit prefixes (no `fix:`, `feat:`, `style:`, `refactor:`, etc.). Start commit messages directly with a capitalized verb: "Remove blank space in mobile drawer", "Add subtle green glow to NavLink hover state".
