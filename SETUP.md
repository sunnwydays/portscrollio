# Setting Up Your Own Portscrollio

The guide is written to be LLM-readable. At the bottom there is a Claude Code prompt you can fill out like a form and have most of the setup done automatically.

---

## Quick Setup (via Script)

There is a setup script that automates the tedious parts. To use it:

1. Copy the example config and fill it in:
   ```sh
   cp setup.config.example.json setup.config.json
   # edit setup.config.json with your details
   ```

2. Run the script:
   ```sh
   node scripts/setup.js
   ```

The script will:
- Replace the hardcoded name and school in the two sidebar components
- Write a `.env.local` template (skipped if one already exists)
- Generate `supabase-seed.sql` with all your INSERT statements, ready to paste into Supabase
- Create `content/{slug}.md` files for any posts you included markdown for

After running it, follow the checklist it prints: fill in `.env.local`, create the DB tables, paste the SQL, then `pnpm dev`.

The rest of this guide explains each piece in detail if you want to understand what the script is doing or make changes manually.

---

## Prerequisites

- Node.js 18+ and pnpm (`npm i -g pnpm`)
- Git
- A [Supabase](https://supabase.com) account (free tier is fine)
- A [Vercel](https://vercel.com) account (free tier is fine)
- A GitHub account (needed for the "latest commit" activity card in the sidebar)

---

## Step 1: Fork and Clone

Fork this repo, then clone your fork:

```sh
git clone https://github.com/YOUR_USERNAME/portscrollio.git
cd portscrollio
pnpm install
```

---

## Step 2: Set Up Supabase

### 2a. Create a project

Go to [supabase.com](https://supabase.com), create a new project, and wait for it to provision. You will need the project URL and API keys in Step 3.

### 2b. Create the database tables

Open the SQL Editor in your Supabase dashboard and run the following. This creates all four tables the app expects.

```sql
-- Key/value pairs for your links and status message
CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO settings (key, value) VALUES
  ('github_url',   'https://github.com/YOUR_USERNAME'),
  ('linkedin_url', 'https://linkedin.com/in/YOUR_PROFILE'),
  ('resume_url',   'https://your-resume-url.com'),
  ('status',       'Your current sprint or one-line status');

-- Sidebar metrics and achievements
CREATE TABLE stats (
  key           TEXT PRIMARY KEY,
  label         TEXT NOT NULL,
  value         TEXT NOT NULL,
  display_order INT  NOT NULL DEFAULT 0
);

-- For You feed (the vertical scroll)
CREATE TABLE projects (
  id          TEXT    PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title       TEXT    NOT NULL,
  description TEXT    NOT NULL,
  video_url   TEXT    NOT NULL,
  github_url  TEXT    NOT NULL,
  website_url TEXT,
  tech        TEXT    NOT NULL DEFAULT '',
  is_hobby    BOOLEAN NOT NULL DEFAULT false,
  bg_from     TEXT    NOT NULL DEFAULT '#1a2236',
  bg_to       TEXT    NOT NULL DEFAULT '#0b1326',
  tags        TEXT    NOT NULL DEFAULT ''
);

-- Explore grid (blog posts, write-ups, standalone videos)
CREATE TABLE posts (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  slug          TEXT,
  title         TEXT NOT NULL,

  video_url     TEXT,
  thumbnail_url TEXT,
  tags          TEXT NOT NULL DEFAULT '',
  bg_from       TEXT NOT NULL DEFAULT '#1a2236',
  bg_to         TEXT NOT NULL DEFAULT '#0b1326',
  duration      TEXT,
  published_at  TEXT NOT NULL DEFAULT NOW()::TEXT
);
```

### 2c. Row Level Security

The app reads data using the public/anon key, so you need to allow anonymous reads. The simplest approach for a personal public portfolio is to disable RLS on all four tables (Table Editor > select table > "Disable RLS"). If you prefer to keep RLS on, add a policy that allows `SELECT` for the `anon` role on each table.

### 2d. Get your API keys

Go to Project Settings > API:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public key** → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **service_role secret** → `SUPABASE_SECRET_KEY` (used only in server-side code, never exposed to the browser)

---

## Step 3: Environment Variables

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
GITHUB_TOKEN=github_pat_...
```

The `GITHUB_TOKEN` is optional but recommended. Without it you will hit GitHub's unauthenticated rate limit quickly. To generate one: GitHub Settings > Developer Settings > Personal Access Tokens > Fine-grained. No scopes are needed since it only reads public commit history.

---

## Step 4: Personal Details

### 4a. Name and school (hardcoded in the sidebar)

Open `components/sidebar/Sidebar.tsx` and find the two lines near the top of the JSX that render your name and school/program. Update them to your own.

Do the same in `components/sidebar/MobileDrawer.tsx` (same two fields, same location).

If you use the Claude Code prompt at the bottom of this guide, it handles this automatically.

### 4b. Links and status (settings table)

These come from the `settings` table you already seeded in Step 2. You can update them any time in the Supabase dashboard or with a SQL `UPDATE`.

---

## Step 5: Theme and Style Customization

All color tokens live in one place: [app/globals.css](app/globals.css) inside the `@theme` block. Changing a value there cascades to every component that uses that token.

```css
@theme {
  /* Background surfaces -- the dark navy palette */
  --color-surface:                   #0b1326;
  --color-surface-container-low:     #131b2e;
  --color-surface-container:         #1a2236;
  /* ... more surface shades */

  /* Accent -- swap these two for a different color personality */
  --color-primary:                   #4edea3;   /* mint green */
  --color-primary-container:         #10b981;

  /* Text -- avoid pure white, use on-surface instead */
  --color-on-surface:                #dae2fd;   /* lavender-white */
  --color-secondary:                 #adc6ff;   /* periwinkle blue */
}
```

**To change the accent color:** update `--color-primary` and `--color-primary-container` to any two shades of your chosen hue. Every button gradient, active nav indicator, stat value, and CTA inherits from these.

**To change the base dark color:** update the `--color-surface-*` family together, keeping each step slightly lighter than the last (lowest to highest).

**Fonts:** the display font (headlines) is Manrope and the body font is Inter, both loaded via `next/font/google` in `app/layout.tsx`. Swap either import to any Google Font.

---

## Step 6: Profile Avatars

The profile picture in the sidebar is chosen randomly from three folders, each with a different probability:

```
public/avatars/
├── 1/    <- 75% chance  (everyday / go-to photos)
├── 2/    <- 20% chance  (activity or interest shots)
└── 3/    <-  5% chance  (rare or funny ones)
```

Drop your own photos into each folder. Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`. The avatar is picked once per browser session and cached in sessionStorage.

To change the probabilities, open `components/sidebar/ProfileAvatar.tsx` and update the weighted random logic.

---

## Step 7: Projects (the For You Feed)

Each row in the `projects` table becomes a card in the vertical scroll feed.

| Column | Type | Description |
|--------|------|-------------|
| `title` | TEXT | Displayed on the video card |
| `description` | TEXT | 1-2 sentences shown below the title |
| `video_url` | TEXT | Full YouTube URL (`https://youtube.com/watch?v=...`) |
| `github_url` | TEXT | Repository link |
| `website_url` | TEXT (nullable) | Live site link, shown as a globe icon if set |
| `tech` | TEXT | Comma-separated stack: `"React,TypeScript,PostgreSQL"` |
| `is_hobby` | BOOLEAN | If true, the card is interleaved as a palette-cleanser every 2-3 main projects |
| `bg_from` | TEXT | Gradient start color (hex). Stick to dark colors like `#1a2236` |
| `bg_to` | TEXT | Gradient end color (hex) |
| `tags` | TEXT | Comma-separated, all caps: `"DISTRIBUTED SYSTEMS,RUST"` |

**On the hobby flag:** The playlist shuffler automatically weaves `is_hobby = true` rows between your main projects. I use it for side projects, sport clips, or anything that breaks up the professional content. It makes the feed feel less monotonous.

**YouTube URLs:** Paste the full watch URL. The embed logic extracts the video ID automatically.

---

## Step 8: Blog Posts and Write-ups (the Explore Grid)

A post has two parts: a database row for metadata and an optional Markdown file for the written content.

### 7a. Supabase row (metadata)

| Column | Type | Description |
|--------|------|-------------|
| `slug` | TEXT (nullable) | URL path. `/explore/[slug]`. Use kebab-case. Falls back to `id` if null |
| `title` | TEXT | Display title |

| `video_url` | TEXT (nullable) | YouTube URL. Set this if the post is a video |
| `thumbnail_url` | TEXT (nullable) | Hero image. For YouTube videos: `https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg` |
| `tags` | TEXT | Comma-separated tags |
| `bg_from` / `bg_to` | TEXT | Card gradient colors |
| `duration` | TEXT (nullable) | Video length for display only: `"12:45"` |
| `published_at` | TEXT | ISO 8601 timestamp: `"2025-01-15T00:00:00Z"` |

### 7b. Markdown file (written content)

Create `content/{slug}.md` where the slug matches what you put in the database. The file is rendered server-side with remark. No frontmatter is required; just start writing Markdown.

If no `.md` file exists but `video_url` is set, the detail page falls back to a YouTube embed instead.

**Post images:** Put them in `public/blog/{slug}/` and reference them in the Markdown with `/blog/{slug}/image.jpg`.

---

## Step 9: Stats and the Activity Feed

Each row in `stats` becomes a metric card in the sidebar.

| Column | Description |
|--------|-------------|
| `label` | Display name: `"Power Clean 3RM"` |
| `value` | `"100 kg"` renders as large text. `"75%"` renders as a progress bar |
| `display_order` | Integer, lower numbers appear first |

I use this for anything that signals who I am beyond code: fitness PRs, languages spoken, side-project metrics, whatever feels right. It is not meant to be purely technical.

---

## Step 10: GitHub Activity (Latest Commit Card)

The sidebar shows your latest commit message, fetched live from the GitHub Search API.

- Set `github_url` in the `settings` table to your full GitHub profile URL
- The app extracts your username from the URL automatically
- Set `GITHUB_TOKEN` in `.env.local` to avoid hitting the unauthenticated rate limit
- The message refreshes every 5 minutes (300-second revalidation)

---

## Step 11: Deploy to Vercel

Connect your repo at [vercel.com](https://vercel.com). Vercel auto-detects Next.js and sets up the build pipeline. After connecting, go to your project's Settings > Environment Variables and add the same four variables from your `.env.local`.

---

## Step 12: Making Videos

This is the hardest part and the most important one. Here's a summary from my notes.

**Arc and storytelling**

Structure each video around six beats: nostalgia/hook, problem, research or process montage, solution, payoff, CTA. Every portfolio video needs a payoff moment and a clear CTA or else it feels like a vlog instead of a portfolio piece. That shape is worth templating and reusing for every project.

**Voiceover performance**

Smile while recording. VERY audible and changes the warmth of your voice. Stand up, not sit. Aim for casual friend energy, not presenter energy. Slow down on key numbers and stats since those are your proof points and they need room to land. Let CTAs come in softer than your payoff, not louder. For re-records: one wince per listen is the threshold. Re-record individual lines, not full takes.

**Audio workflow (order matters)**

Clean dialogue edit, then add music, then run Audio Assistant, then add SFX last. Getting this order wrong means re-work. Master to -14 LUFS before export.

**DaVinci Resolve AI tools**

Use IntelliCut silence removal early in the edit. Run Dialogue Matcher when your takes were recorded in separate sessions. Audio Assistant goes after picture lock, not before. Add subtitles at the very end of editing.

**Visual defaults**

Drop shadow over stroke for subtitles. Lo-fi or retro/game-adjacent background music works well. Use SFX liberally.

**The most important thing**

Ship the first one imperfect. The fastest feedback loop is a real video, even if all the criticism is imagined. Making something public feels different. Future videos will teach you more than that first one ever will if you sit on it.

PRACTICE

---

## Going Further

The version you cloned is my personal portfolio, so a few things are opinionated. Here are the most common things people will want to change, plus ideas I have not built yet that would make this a better template.

### Style personalization

- **Accent color** -- one swap in `app/globals.css` changes every button, active indicator, and highlighted stat. Mint green is just what worked for my dark navy background.
- **Fonts** -- Manrope (headlines) and Inter (body) are loaded in `app/layout.tsx` via `next/font/google`. Drop in any Google Font pair.
- **Card gradients** -- the `bg_from` / `bg_to` columns on projects and posts let you set per-card colors. Going monochrome (all cards the same dark shade) or colorful (each card its own hue) are both viable directions.

### Pages not yet built

- **Resume page** -- the sidebar resume icon links to `/resume` but that route just redirects to an external URL right now. A proper implementation would embed a PDF from Supabase Storage so the resume stays in-app.
- **About page** -- there is no `/about` route. A good place for a longer bio, gear list, or a photo gallery that does not fit in the sidebar.
- **Explore tag filtering** -- the tag filter UI renders on `/explore` but the onClick logic is not wired up. Adding `?tag=RUST` query param handling on the server and filtering the Supabase query is the missing piece.
- **Contact page** -- no contact form or email link beyond the sidebar icons.

### Content ideas

- Mix hobby videos freely. The playlist shuffler already supports it via `is_hobby: true`. The more variety in the feed, the more interesting the experience.
- Write posts for projects that need more than a 60-second video. The `/explore/[slug]` route renders Markdown server-side, so a deep-dive engineering post works well alongside a short video card.
- Keep stats fresh. A progress bar at 83% is more interesting than a static number. Anything you are actively working toward fits here.

---

## Appendix: Claude Code Setup Prompt

Paste the block below into Claude Code after cloning the repo. Fill in everything inside `[BRACKETS]`, then Claude Code will edit the sidebar files, generate your Supabase SQL, create any Markdown files, and give you a checklist of remaining steps.

````
# Portscrollio Setup

I have cloned portscrollio and want to configure it for my personal use.
The project root is the current working directory.

Please do the following:
1. Edit components/sidebar/Sidebar.tsx and components/sidebar/MobileDrawer.tsx to update my name and school (they are hardcoded near the top of the JSX in each file)
2. Generate SQL INSERT statements for the settings, stats, projects, and posts tables (ready to paste into the Supabase SQL editor)
3. Create content/{slug}.md files for any posts I mark as having markdown content
4. Give me a checklist of .env.local variables I still need to fill in

---

## My Details

Name: [Your Full Name]
School / Program: [e.g. MIT Computer Science]
GitHub profile URL: [https://github.com/your-username]
LinkedIn URL: [https://linkedin.com/in/your-profile]
Resume URL: [paste URL or leave blank]
Current status: [e.g. Open to summer 2026 roles]

---

## My Stats (sidebar metrics)

A value ending in "%" renders as a progress bar. Anything else renders as large text.

Stat 1:
  Label: [e.g. Power Clean 3RM]
  Value: [e.g. 100 kg]
  Order: 1

Stat 2:
  Label: [e.g. Projects shipped]
  Value: [e.g. 12]
  Order: 2

---

## My Projects (For You feed)

is_hobby: yes means the project is interleaved as a palette-cleanser between main projects.

Project 1:
  Title: [Project Name]
  Description: [1-2 sentences]
  YouTube URL: [paste URL]
  GitHub URL: [paste URL]
  Website URL: [optional, or leave blank]
  Tech stack: [React, TypeScript, PostgreSQL]
  Is hobby: [yes / no]
  Gradient from: [hex, e.g. #1a2236]
  Gradient to: [hex, e.g. #0b1326]
  Tags: [TAG ONE, TAG TWO]

---

## My Posts (Explore grid)

Post 1:
  Title: [Post Title]
  Slug: [url-kebab-case]
  YouTube URL: [optional]
  Thumbnail URL: [optional]
  Tags: [TAG ONE, TAG TWO]
  Gradient from: [hex]
  Gradient to: [hex]
  Duration: [e.g. 8:30, or leave blank]
  Published: [YYYY-MM-DD]
  Has markdown content: [yes / no]
  Markdown body (paste below if yes):

[markdown content here]

````
