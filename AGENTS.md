# Portscrollio — Agent Instructions

## Next.js 16

This project runs **Next.js 16** which has breaking changes from earlier versions. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices. Do not assume APIs, conventions, or file structure match your training data.

## Project Overview

Portscrollio (portfolio + scroll) is a TikTok-style portfolio site. It replaces the traditional resume with vertical-scroll video content designed to hook recruiters in seconds. The target audience is recruiters and hiring managers, often on mobile first, desktop second.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS 4 — this is the only styling approach. No CSS modules, no styled-components, no inline style objects.
- **Package manager:** pnpm
- **Path alias:** `@/*` maps to project root

## Architecture

- App Router only — all routes live in `app/`
- Server Components by default. Only add `"use client"` when the component needs browser APIs, event handlers, or React hooks (useState, useEffect, etc.)
- Colocate components with their routes when they're page-specific. Shared components go in a top-level `components/` directory.
- Keep data fetching in Server Components. Pass data down to Client Components as props.

## Design System: "Luminous Logic"

The full design specs and mockup PNGs live in `design/`. Each page has its own subfolder with a `DESIGN.md` and responsive mockups (desktop, tablet, mobile).

**You must match the mockups.** When implementing any page, open and study the corresponding PNGs in `design/<page>/` before writing code. The DESIGN.md files contain the authoritative spec.

### Pages

| Route | Concept | Mockups |
|-------|---------|---------|
| For You (`/`) | TikTok-style vertical video scroll — the main hook | `design/for_you/` |
| Explore (`/explore`) | YouTube-style thumbnail grid of projects and blog posts | `design/explore/` |
| Mobile Drawer | Slide-out sidebar with profile info, activity feed, resume link | `design/mobile_drawer/` |

### Layout

- **Desktop:** Fixed left sidebar with profile info, nav links, activity feed. Main content fills the rest.
- **Tablet:** Sidebar collapses to a slim icon bar or drawer.
- **Mobile:** Bottom tab bar (For You / Explore). Profile and activity accessed via a hamburger menu that opens the mobile drawer.

### Color Tokens

| Token | Hex |
|-------|-----|
| `surface` (base canvas) | `#0b1326` |
| `surface_dim` | `#080f1f` |
| `surface_container_lowest` | `#060e20` |
| `surface_container_low` | `#131b2e` |
| `surface_container` | `#1a2236` |
| `surface_container_high` | `#222a3d` |
| `surface_container_highest` | `#2d3449` |
| `surface_variant` | `#2d3449` |
| `primary` | `#4edea3` |
| `primary_container` | `#10b981` |
| `primary_fixed` | `#6ffbbe` |
| `on_primary` | `#003822` |
| `on_surface` | `#dae2fd` |
| `secondary` | `#adc6ff` |
| `secondary_container` | `#0566d9` |
| `outline` | `#8a938e` |
| `outline_variant` | `#3c4a42` |

### Typography

- **Display & Headlines:** Manrope — geometric, wide stance, editorial feel. Load via `next/font/google`.
- **Body & Labels:** Inter — maximum legibility for technical text. Load via `next/font/google`.
- Do NOT use monospace for anything other than actual code snippets.
- `display-lg`: 3.5rem, letter-spacing -0.02em
- `body-md`: 0.875rem

### Core Rules

1. **No-Line Rule** — Never use 1px solid borders to define sections. Use background color shifts (tonal transitions) between surface tokens instead.
2. **Glass & Gradient** — Navigation and floating elements use glassmorphism: `surface_variant` at 60% opacity + `backdrop-blur: 20px`. Primary CTAs use a 135-degree gradient from `primary` to `primary_container`.
3. **Tonal Layering** — Achieve depth through surface token shifts, not drop shadows. If a shadow is absolutely needed (modals), use 30-40px blur at 10% opacity with `surface_container_lowest`.
4. **Ghost Borders** — For accessibility in dense areas, use `outline_variant` at 15% opacity. Felt, not seen.
5. **No white text** — Use `on_surface` (`#dae2fd`) instead of `#ffffff`.
6. **Asymmetric layout** — Offset large display typography against centered content. Don't default to symmetric grids.
7. **Cards** — `surface_container_low` background. On hover: transition to `surface_container_high` + scale image 1.02x. No dividers — use 3rem spacing.
8. **Chips** (tech stacks) — `surface_container_high` background, `secondary` text, fully rounded (9999px).
9. **Buttons** — Primary: gradient background, `on_primary` text, 0.75rem radius. Secondary: ghost style, no background, `outline` border at 20% opacity. Hover: `primary_fixed` outer glow (0 0 15px).

### Responsive Design

Mobile-first. Three breakpoints matching the mockups:
- **Mobile:** ~496px wide
- **Tablet:** ~969px wide
- **Desktop:** ~2490px wide (scales down gracefully)

## Code Style

- TypeScript strict — no `any`, no `@ts-ignore` without a comment explaining why
- Semantic HTML elements (`nav`, `main`, `section`, `article`, `aside`)
- Accessible: meaningful alt text on images, keyboard navigable, proper ARIA where needed
- Prefer named exports for components
