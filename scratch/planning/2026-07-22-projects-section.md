# Projects Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Projects section — `/projects/` index, `/projects/[slug]/` write-up pages, nav tab — with evidence-sourced write-ups for onwrist.watch and jdstemmler.dev.

**Architecture:** A second Astro content collection (`projects`) parallel to `posts`, rendered by two new pages that reuse the existing instrument-heritage CSS classes. No new tokens, no new client JS, RSS untouched.

**Tech Stack:** Astro 5, MDX, TypeScript strict. Site CSS lives in `src/styles/global.css` (classes are reused, not extended, except small scoped styles inside the new pages).

## Global Constraints

- **Zero client JavaScript** on every page. No `<script>` in output.
- Colors: only the existing custom properties (`--ink`, `--ink-2`, `--paper`, `--muted`, `--signal`, `--wrong`, `--rule`, `--rule-2`). Never hardcode new colors.
- Fonts: only the existing `--font-display` / `--font-body` / `--font-mono` variables.
- Sanitization (content-safety hook enforces in `src/content/`): no RFC 1918 addresses (README quotes with `192.168.x.x` must be paraphrased or the address swapped to `192.0.2.x`), no internal hostnames (`.local`, `.lan`, `.internal`, `.home.arpa`), no `vlan` followed by a number.
- Write-up honesty: **never invent motivations, numbers, dates, or outcomes.** Anything not evidenced in the source repos becomes `{/* TODO(verify: ...) */}` with a specific question. Never fabricate command output.
- No emoji in titles or headings. First person, direct voice.
- Both write-ups ship `draft: true`.
- The `projects` schema already exists in `src/content.config.ts` (fields: `title`, `description` ≤160, `url?`, `repo?`, `stack[]`, `status` enum `active|maintained|archived` default `active`, `order` number default 0, `draft` default false). Do not modify the schema.
- Screenshots for onwrist already copied to `src/assets/projects/onwrist/` (`collection-dark.webp`, `stats-dark.webp`).
- Verify any task by running `npx astro check` (0 errors) and `npm run build` (exit 0) from the repo root.

---

### Task 1: Project pages, nav, about tweak

**Files:**
- Create: `src/pages/projects/index.astro`
- Create: `src/pages/projects/[slug].astro`
- Modify: `src/layouts/Base.astro` (nav block: add Projects link between Posts and About)
- Modify: `src/pages/about.astro` (replace the onwrist paragraph with a pointer to /projects/)

**Interfaces:**
- Consumes: `getCollection('projects')` from `astro:content`; CSS classes from `src/styles/global.css`: `.label`, `.page-title`, `.post-title`, `.post-list`, `.entry-meta`, `.entry-title`, `.prose`, `.meta` (+ `.meta dt/dd`, `.meta .verified`), `.wrap` (provided by Base layout).
- Produces: routes `/projects/` and `/projects/[slug]/` where slug = MDX file basename. Task 2/3 files render through `[slug].astro` unmodified.

- [ ] **Step 1: Create `src/pages/projects/index.astro`** — mirror `src/pages/posts/index.astro` exactly in structure (read it first), with these differences: eyebrow label text `Index`→`Projects`, h1 `Posts`→`Projects`, collection `posts`→`projects`, sort by `a.data.order - b.data.order` (ascending) instead of date, entry-meta line renders `{status} · {stack.join(' · ')}` instead of date · tags, no mini-readout `<dl>` — instead render the `description` in a plain `<p>` (body font, `--muted` via a small scoped style `.entry-desc { color: var(--muted); font-size: 0.9rem; line-height: 1.55; margin: 0.4rem 0 0.6rem; }`), then a links line in mono (`.entry-meta` class) with `Site` (→ `url`) and `Source` (→ `repo`) anchors, separated by ` · `, each rendered only when the field exists. Page `<Base title="Projects — jdstemmler.dev" description="Things I've built and shipped: self-hosted apps and the tooling behind this site.">`.
- [ ] **Step 2: Create `src/pages/projects/[slug].astro`** — mirror `src/pages/posts/[slug].astro` (read it first): `getStaticPaths` over `getCollection('projects', ({ data }) => !data.draft)`, params `{ slug: post.id }`. Header: `<p class="label">Project</p>`, `<h1 class="post-title">{title}</h1>`, then the `.meta` `<dl>` with rows: `Status` → status; `Site` → `<a href={url}>{url without protocol}</a>` (only if url); `Source` → `<a href={repo}>{repo path without https://github.com/}</a>` (only if repo); `Stack` → `stack.join(' · ')` in `class="verified"` (only if stack.length). No DiagnosticStrip import, no symptom/cause. Body: `<div class="prose"><Content /></div>`.
- [ ] **Step 3: Add nav link** — in `src/layouts/Base.astro`, inside `.nav-links`, add `<a href="/projects/">Projects</a>` between the Posts and About links.
- [ ] **Step 4: About tweak** — in `src/pages/about.astro`, replace the paragraph beginning "The watch enthusiasm produced" with: `<p>Things I've built live on the <a href="/projects/">projects page</a>. The rest of the code is at <a href="https://github.com/jdstemmler">github.com/jdstemmler</a>.</p>` (keep the separate "Opinions here are my own." paragraph).
- [ ] **Step 5: Verify** — `npx astro check` → 0 errors. `npm run build` → exit 0. Note: build emits no `/projects/[slug]` pages yet (collection empty until Tasks 2–3) — that is expected; the index page must render with an empty list without crashing.
- [ ] **Step 6: Commit** — `git add -A && git commit -m "Projects section: pages, nav, about pointer"`.

### Task 2: onwrist.watch write-up

**Files:**
- Create: `src/content/projects/onwrist-watch.mdx`

**Interfaces:**
- Consumes: schema above; images `../../assets/projects/onwrist/collection-dark.webp` and `stats-dark.webp` via `import { Image } from 'astro:assets'` + default imports (same pattern as `src/content/posts/cameras-eating-the-2-4ghz-band.mdx` — read it for the exact idiom).
- Produces: `/projects/onwrist-watch/` (renders via Task 1's `[slug].astro`).

**Evidence (read all before writing):**
- `/Users/jayson/code/personal/onwrist.watch/README.md` — what it is today: self-hosted, multi-tenant watch-collection tracker; SvelteKit app + Postgres via docker compose; installable-PWA wear logging (`/log`); Resend for account email, Cloudflare Turnstile signup captcha (fails closed); admin console via `ADMIN_EMAIL`; photos on local disk or any S3-compatible bucket; rate-limiting `ADDRESS_HEADER` caveat behind proxies; dev against scratch Postgres, Vitest on PGlite.
- `/Users/jayson/code/personal/onwrist.watch/package.json` — deps: drizzle-orm, pg, argon2, sharp, zod, @aws-sdk/client-s3; SvelteKit 2, Svelte 5.
- `/Users/jayson/code/personal/watch-it/docs/superpowers/specs/2026-07-14-horolog-design.md` — the origin design (2026-07-14): codename horolog, single-user, SQLite, sessions-not-events data model with enforced invariants (no overlapping sessions, at most one open), iOS-Shortcut-first logging with server-composed status lines, one-container homelab deploy.
- `/Users/jayson/code/personal/watch-it/KICKOFF.md` — the unattended overnight build: an orchestrator instructed to execute the 16-task plan via subagent-driven development while the owner slept.

**Frontmatter (verbatim except description tuning ≤160):**

```yaml
---
title: 'onwrist.watch'
description: 'A self-hosted, multi-tenant watch-collection tracker: inventory, low-friction wear logging as an installable PWA, and a stats dashboard.'
url: 'https://onwrist.watch'
repo: 'https://github.com/jdstemmler/onwrist.watch'
stack: ['SvelteKit 2', 'Svelte 5', 'Drizzle ORM', 'Postgres', 'Docker']
status: 'active'
order: 1
draft: true
---
```

- [ ] **Step 1: Read every evidence file above in full.**
- [ ] **Step 2: Write the MDX** (~600–900 words) with this structure: (1) what it is, from the README; (2) origin story — designed 2026-07-14 as "horolog", the single-user/SQLite/iOS-Shortcut design, then the kickoff doc that handed a 16-task plan to an unattended overnight orchestrator (present the kickoff as what was *instructed*; add `{/* TODO(verify: how the overnight run actually went — what worked, what needed fixing in the morning) */}`); (3) evolution to what shipped — multi-tenant accounts (argon2, sliding sessions), Turnstile, Resend, Postgres instead of SQLite, optional S3 photos, admin console, with `{/* TODO(verify: why the single-user → multi-tenant pivot) */}`; (4) the two screenshots with descriptive alt text; (5) design decisions that survived from the original spec — sessions-not-events, the no-overlap/one-open invariants, server-composed status lines — phrased as originating in the design doc, with `{/* TODO(verify: confirm these survived into onwrist as shipped) */}`; (6) self-hosting posture from the README (compose + tunnel path, ORIGIN exactness, ADDRESS_HEADER rate-limit caveat) — paraphrase, do NOT quote the README line containing a `192.168.x.x` example address.
- [ ] **Step 3: Verify** — `npx astro check` 0 errors; `npm run build` exit 0; confirm `/projects/onwrist-watch/` is NOT in build output (draft: true) — expected.
- [ ] **Step 4: Commit** — `git add -A && git commit -m "onwrist.watch project write-up (draft)"`.

### Task 3: jdstemmler.dev write-up

**Files:**
- Create: `src/content/projects/jdstemmler-dev.mdx`

**Interfaces:**
- Consumes: schema above. No images required.
- Produces: `/projects/jdstemmler-dev/` (renders via Task 1's `[slug].astro`).

**Evidence (read before writing):** this repo — `README.md`, `CLAUDE.md`, `.claude/skills/new-post/SKILL.md`, `.claude/skills/verify-post/SKILL.md`, `.claude/hooks/content-safety.sh`, `src/components/DiagnosticStrip.astro`, `git log --oneline` (the build history: skeleton → design system → review fixes, all 2026-07-22).

**Frontmatter (verbatim):**

```yaml
---
title: 'jdstemmler.dev'
description: 'This site: an Astro 5 blog with zero client JavaScript, a diagnostic-strip content model, and Claude Code tooling that enforces its own rules.'
url: 'https://jdstemmler.dev'
repo: 'https://github.com/jdstemmler/jdstemmler.dev'
stack: ['Astro 5', 'TypeScript', 'MDX', 'IBM Plex', 'Cloudflare Pages']
status: 'active'
order: 2
draft: true
---
```

- [ ] **Step 1: Read the evidence files.**
- [ ] **Step 2: Write the MDX** (~500–800 words): (1) what the site is and its content model — every debugging post carries a symptom/cause pair driving the diagnostic strip, index previews, and RSS summaries; (2) the rules that make it trustworthy — zero client JS, never-invent-output, every command shown was actually run; (3) the `.claude/` tooling as the interesting artifact: `new-post` (brain-dump → valid MDX with TODO(verify) markers), `verify-post` (pre-publish checklist), the content-safety hook (blocks RFC 1918/hostnames/VLAN IDs at write time and before commits), the build-check hook; (4) how it was built — spec-first, then built in a day with Claude Code on 2026-07-22, including three parallel competing typography proposals of which the IBM Plex "instrument heritage" direction won, and a three-reviewer pass (accessibility, performance, cold design read) before shipping; (5) deploys — git-connected Cloudflare Pages, push-to-deploy. All claims are first-hand from this repo; do not state Lighthouse numbers or any metric not visible in the repo itself.
- [ ] **Step 3: Verify** — `npx astro check` 0 errors; `npm run build` exit 0.
- [ ] **Step 4: Commit** — `git add -A && git commit -m "jdstemmler.dev project write-up (draft)"`.

### Task 4 (orchestrator): Bookkeeping

- [ ] CLAUDE.md: add a `### Projects` subsection under Content: collection path, schema one-liner, "no symptom/cause — that's posts-only", authorship rule ("write-ups are drafted from repo evidence with TODO(verify) markers; Jayson approves before draft: false"), sanitization applies unchanged.
- [ ] `docs/spec.md` (local-only): annotate §1's "not a portfolio" non-goal: "Superseded 2026-07-22 — owner added a Projects section; see docs/superpowers/specs/2026-07-22-projects-section-design.md."
- [ ] Commit.

### Task 5 (orchestrator): Verify and ship

- [ ] `npx astro check` 0 errors; `npm run build` clean.
- [ ] Assert RSS unchanged: `grep -c '/projects/' dist/rss.xml` → 0.
- [ ] Zero-JS: `grep -rl '<script' dist --include='*.html'` → empty.
- [ ] Screenshots (Playwright, fresh context, dark): `/projects/` at 1440 and 390. Review visually. (Write-ups are drafts, so `[slug]` pages aren't in the build yet — screenshot them after Jayson approves and drafts flip.)
- [ ] Push (auto-deploys via Pages Git integration); verify `/projects/` on the apex in a fresh context.
- [ ] Ping Jayson: PushNotification + summary, listing the TODO(verify) questions from both write-ups that need his answers before drafts flip.
