# jdstemmler.dev

Source for [jdstemmler.dev](https://jdstemmler.dev) — a personal technical blog about
homelab, self-hosting, and Claude Code. Write-ups of specific fixes, with the wrong
hypothesis named first.

## Stack

- [Astro 5](https://astro.build), TypeScript strict, MDX content collections
- Shiki syntax highlighting on a `css-variables` theme mapped to the site tokens
- Self-hosted IBM Plex (Sans Condensed / Serif / Mono) — no font CDNs
- **Zero client JavaScript** on every page
- Cloudflare Pages via the Git integration — every push to `main` builds and deploys

## Working on it

```
npm install
npm run dev       # local dev server
npm run build     # static output to dist/
npm run preview   # serve the built output
```

## The interesting bits

- `src/components/DiagnosticStrip.astro` — the site's signature element: each debugging
  post opens with a SYMPTOM/CAUSE readout, and the cause line's one-beat reveal is the
  entire site's motion budget.
- `.claude/` — the Claude Code tooling this site is written with: a `new-post` skill
  (brain-dump in, valid MDX skeleton out, `TODO(verify)` markers where real command
  output must be pasted), a `verify-post` pre-publish checklist, a content-safety hook
  that blocks committing RFC 1918 addresses / internal hostnames / VLAN IDs in post
  content, and a build-check hook running `astro check` after source edits.
- `CLAUDE.md` — the binding instructions, including the writing rules: never invent
  command output, and every command shown was actually run.
