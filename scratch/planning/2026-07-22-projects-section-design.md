# Projects section — design

**Date:** 2026-07-22 · **Status:** approved by Jayson in-session

## Purpose

Add a Projects section: a nav tab, `/projects/` index, and a full write-up page per
project. Supersedes the local spec's "not a portfolio" non-goal (owner decision,
2026-07-22): the site now also showcases things Jayson has built.

## Decisions (made with Jayson)

1. **Separate `projects` content collection** — not posts. Posts feed, RSS, and the
   exactly-three-tags rule stay untouched. Build stories about a project may later run
   as normal tagged posts.
2. **Authorship: drafted from repo evidence** — README, planning docs, commit history,
   the running app. `TODO(verify)` anywhere a claim would otherwise be a guess
   (motivations, war stories, unrecorded outcomes). Jayson fills gaps and approves;
   `draft: true` until then.
3. **Launch set:** onwrist.watch and jdstemmler.dev itself.

## Content model

`src/content/projects/*.mdx`:

```ts
title: z.string(),
description: z.string().max(160),
url: z.string().url().optional(),      // live site
repo: z.string().url().optional(),     // source
stack: z.array(z.string()).default([]),
status: z.enum(['active', 'maintained', 'archived']).default('active'),
order: z.number().default(0),          // index sort, ascending
draft: z.boolean().default(false),
```

No symptom/cause — the diagnostic strip stays a debugging-post signature. The
content-safety hook already covers `src/content/`.

## Pages

- `/projects/` — index in the post-list visual family: mono meta line
  (status · stack), display-face title, description, site/repo links.
- `/projects/[slug]/` — article-family page: "Project" eyebrow label, title, the mono
  meta grid (Status / Site / Source / Stack), prose body. Screenshots allowed.
- Nav: Posts · Projects · About. About page's onwrist paragraph slims to a pointer
  at `/projects/`. RSS untouched; sitemap picks pages up automatically.

## Source material

- onwrist.watch: repo README (multi-tenant self-hosted tracker; SvelteKit 2 /
  Svelte 5 / Drizzle / Postgres / Docker; argon2 auth, Turnstile, Resend, optional S3,
  admin console), watch-it planning docs (2026-07-14 horolog design spec + unattended
  overnight-build kickoff), landing screenshots (demo data, already public).
- jdstemmler.dev: this repo and the build history from 2026-07-22 (three-proposal
  design bake-off, `.claude` tooling, zero-JS rule, review fleet, git-connected Pages).

## Verification

Build + `astro check` clean; desktop/mobile screenshots of index and one project page;
`rss.xml` asserted to contain no `/projects/` URLs; links resolve; push → auto-deploy →
fresh-context production check.
