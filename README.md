# portscrollio

**portfolio + scroll = portscrollio**

A TikTok-style portfolio that replaces the static resume. Live at [portscrollio.com](https://portscrollio.com) / [sunnywu.dev](https://sunnywu.dev)

---

## The idea

Gambling is fun. To make something interesting, it needs an unpredictable reward.

You already know what you're getting with a PDF resume, and so does the algorithm. Recruiters do a quick F-scan and move on. Great project galleries are few and far between.

But videos are fun. Uncertain if the next one slaps? You scroll. Curious about the content? You click.

So: what if a portfolio worked like a reels slot machine? The world's largest companies have found success in this model, so I'm taking their research.

---

## What it does

- **For You feed** — vertical scroll video feed with a shuffled playlist. Projects and hobby clips are interleaved so you never know what's next.
- **Explore grid** — YouTube-style thumbnail grid of all projects and posts, filterable by tag.
- **Post detail** — project write-ups rendered from Markdown.
- **Mobile-first** — bottom tab bar, hamburger drawer, fully responsive.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL via Supabase |
| Backend | Supabase (DB + storage) |
| Hosting | Vercel + Vercel Analytics |

---

## Architecture

- **App Router** — all routes live in `app/`; Server Components by default, `"use client"` only where needed
- **Data layer** — Supabase tables: `projects`, `posts`, `stats`, `settings`
- **Content** — blog post Markdown in `/content/`, rendered server-side with remark
- **Playlist logic** — `lib/playlist.ts` shuffles projects and interleaves hobby clips every 2–3 slots for unpredictability

---

## Running locally

```sh
pnpm install
pnpm dev
```

---

I don't know if this'll work, and that's the joy of it!

---

Feel free to clone and make your own Portscrollio `:)`