#!/usr/bin/env node
'use strict';

/**
 * Portscrollio setup script.
 *
 * Reads setup.config.json from the project root and:
 *   1. Replaces the hardcoded name and school in Sidebar.tsx and MobileDrawer.tsx
 *   2. Writes a .env.local template (skipped if one already exists)
 *   3. Generates supabase-seed.sql with all INSERT statements
 *   4. Creates content/{slug}.md files for any posts that include markdown
 *
 * Run: node scripts/setup.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function die(msg) {
  console.error(`\nError: ${msg}\n`);
  process.exit(1);
}

function readConfig() {
  const p = path.join(ROOT, 'setup.config.json');
  if (!fs.existsSync(p)) {
    die(
      'setup.config.json not found.\n' +
      '  Copy setup.config.example.json, rename it to setup.config.json, fill it in, then re-run.'
    );
  }
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    die(`Could not parse setup.config.json: ${e.message}`);
  }
}

function validate(cfg) {
  if (!cfg.name?.full)  die('config.name.full is required');
  if (!cfg.name?.first) die('config.name.first is required');
  if (!cfg.school)      die('config.school is required');
}

/** Replace all regex matches in a file and report whether anything changed. */
function patchFile(filePath, replacements) {
  const rel = path.relative(ROOT, filePath);
  if (!fs.existsSync(filePath)) { console.log(`  Skipped (not found): ${rel}`); return; }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const [pattern, replacement] of replacements) {
    const next = content.replace(pattern, replacement);
    if (next !== content) changed = true;
    content = next;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  Updated : ${rel}`);
  } else {
    console.log(`  No match: ${rel} (already customised, or pattern changed)`);
  }
}

/** Escape a string for safe use as JSX text content. */
function jsxEscape(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Wrap a value in single-quoted SQL string, escaping internal single quotes. */
function sqlStr(val) {
  if (val === null || val === undefined || val === '') return 'NULL';
  return `'${String(val).replace(/'/g, "''")}'`;
}

function sqlBool(val) {
  return val ? 'true' : 'false';
}

/** Generate a random UUID v4 (no external deps). */
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

function stepSidebars(cfg) {
  console.log('\n1. Updating sidebar components...');

  const fullName  = jsxEscape(cfg.name.full);
  const firstName = jsxEscape(cfg.name.first);
  const school    = jsxEscape(cfg.school);

  // Sidebar.tsx — full name + school
  patchFile(path.join(ROOT, 'components/sidebar/Sidebar.tsx'), [
    [
      /(<p\s[^>]*font-display[^>]*font-bold[^>]*text-xl[^>]*text-on-surface[^>]*leading-tight[^>]*>)[^<]*(<\/p>)/,
      `$1${fullName}$2`,
    ],
    [
      /(<p\s[^>]*text-sm[^>]*text-on-surface\/85[^>]*mt-0\.5[^>]*>)[^<]*(<\/p>)/,
      `$1${school}$2`,
    ],
  ]);

  // MobileDrawer.tsx — first name + school
  // The name line in the drawer uses a slightly different className (no leading-tight)
  patchFile(path.join(ROOT, 'components/sidebar/MobileDrawer.tsx'), [
    [
      /(<p\s[^>]*font-display[^>]*font-bold[^>]*text-xl[^>]*text-on-surface(?![^>]*leading-tight)[^>]*>)[^<]*(<\/p>)/,
      `$1${firstName}$2`,
    ],
    [
      /(<p\s[^>]*text-sm[^>]*text-on-surface\/85[^>]*mt-0\.5[^>]*>)[^<]*(<\/p>)/,
      `$1${school}$2`,
    ],
  ]);
}

function stepEnv(cfg) {
  console.log('\n2. Writing .env.local template...');
  const envPath = path.join(ROOT, '.env.local');
  if (fs.existsSync(envPath)) {
    console.log('  Skipped: .env.local already exists (not overwritten)');
    return;
  }
  const lines = [
    'NEXT_PUBLIC_SUPABASE_URL=',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=',
    'SUPABASE_SECRET_KEY=',
    'GITHUB_TOKEN=',
  ];
  fs.writeFileSync(envPath, lines.join('\n') + '\n', 'utf8');
  console.log('  Created : .env.local (fill in your Supabase and GitHub keys)');
}

function stepSQL(cfg) {
  console.log('\n3. Generating supabase-seed.sql...');
  const lines = ['-- Portscrollio seed SQL', '-- Paste this into the Supabase SQL Editor after creating the four tables.', ''];

  // settings
  const githubUrl   = cfg.links?.github   || '';
  const linkedinUrl = cfg.links?.linkedin || '';
  const resumeUrl   = cfg.links?.resume   || '';
  const status      = cfg.status          || '';

  lines.push('-- settings');
  lines.push('INSERT INTO settings (key, value) VALUES');
  lines.push([
    `  ('github_url',   ${sqlStr(githubUrl)})`,
    `  ('linkedin_url', ${sqlStr(linkedinUrl)})`,
    `  ('resume_url',   ${sqlStr(resumeUrl)})`,
    `  ('status',       ${sqlStr(status)})`,
  ].join(',\n') + ';');
  lines.push('');

  // stats
  if (cfg.stats?.length) {
    lines.push('-- stats');
    lines.push('INSERT INTO stats (key, label, value, display_order) VALUES');
    lines.push(
      cfg.stats.map(s =>
        `  (${sqlStr(s.key || uuid())}, ${sqlStr(s.label)}, ${sqlStr(s.value)}, ${Number(s.order) || 0})`
      ).join(',\n') + ';'
    );
    lines.push('');
  }

  // projects
  if (cfg.projects?.length) {
    lines.push('-- projects');
    lines.push('INSERT INTO projects (id, title, description, video_url, github_url, website_url, tech, is_hobby, bg_from, bg_to, tags) VALUES');
    lines.push(
      cfg.projects.map(p =>
        `  (${sqlStr(uuid())}, ${sqlStr(p.title)}, ${sqlStr(p.description)}, ` +
        `${sqlStr(p.video_url)}, ${sqlStr(p.github_url)}, ${sqlStr(p.website_url || null)}, ` +
        `${sqlStr(p.tech || '')}, ${sqlBool(p.is_hobby)}, ` +
        `${sqlStr(p.bg_from || '#1a2236')}, ${sqlStr(p.bg_to || '#0b1326')}, ${sqlStr(p.tags || '')})`
      ).join(',\n') + ';'
    );
    lines.push('');
  }

  // posts
  if (cfg.posts?.length) {
    lines.push('-- posts');
    lines.push('INSERT INTO posts (id, slug, title, category, video_url, thumbnail_url, tags, bg_from, bg_to, duration, published_at) VALUES');
    lines.push(
      cfg.posts.map(p => {
        const publishedAt = p.published_at
          ? `${p.published_at}T00:00:00Z`
          : new Date().toISOString();
        return (
          `  (${sqlStr(uuid())}, ${sqlStr(p.slug || null)}, ${sqlStr(p.title)}, ` +
          `${sqlStr(p.category || null)}, ${sqlStr(p.video_url || null)}, ${sqlStr(p.thumbnail_url || null)}, ` +
          `${sqlStr(p.tags || '')}, ${sqlStr(p.bg_from || '#1a2236')}, ${sqlStr(p.bg_to || '#0b1326')}, ` +
          `${sqlStr(p.duration || null)}, ${sqlStr(publishedAt)})`
        );
      }).join(',\n') + ';'
    );
    lines.push('');
  }

  const outPath = path.join(ROOT, 'supabase-seed.sql');
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log('  Created : supabase-seed.sql');
}

function stepMarkdown(cfg) {
  const postsWithMd = (cfg.posts || []).filter(p => p.markdown);
  if (!postsWithMd.length) return;

  console.log('\n4. Creating content/*.md files...');
  const contentDir = path.join(ROOT, 'content');
  if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true });

  for (const post of postsWithMd) {
    if (!post.slug) {
      console.log(`  Skipped: post "${post.title}" has no slug`);
      continue;
    }
    const mdPath = path.join(contentDir, `${post.slug}.md`);
    if (fs.existsSync(mdPath)) {
      console.log(`  Skipped: content/${post.slug}.md already exists`);
    } else {
      fs.writeFileSync(mdPath, post.markdown, 'utf8');
      console.log(`  Created : content/${post.slug}.md`);
    }
  }
}

function printChecklist() {
  console.log('\nRemaining manual steps:');
  console.log('  [ ] Fill in .env.local with your Supabase and GitHub keys');
  console.log('  [ ] Create the four DB tables in Supabase (see SETUP.md Step 2)');
  console.log('  [ ] Paste supabase-seed.sql into the Supabase SQL Editor');
  console.log('  [ ] Add your avatar photos to public/avatars/1/, /2/, /3/');
  console.log('  [ ] pnpm dev  -- verify everything looks right locally');
  console.log('  [ ] Deploy to Vercel and add env vars under Project Settings > Environment Variables');
  console.log('');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('Portscrollio setup script');
  console.log('=========================');

  const cfg = readConfig();
  validate(cfg);

  stepSidebars(cfg);
  stepEnv(cfg);
  stepSQL(cfg);
  stepMarkdown(cfg);
  printChecklist();

  console.log('Done.');
}

main();
