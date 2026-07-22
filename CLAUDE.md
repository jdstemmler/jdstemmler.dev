# jdstemmler.dev

Personal technical blog. Topics: homelab, self-hosting, Claude/Claude Code. Astro, static output, deployed to Cloudflare Pages.

Full rationale lives in `docs/spec.md`. This file is the binding version — where they conflict, say so rather than picking one.

## Commands

```
npm run dev       # local
npm run build     # static output to dist/
npm run preview   # verify the build, not the dev server
```

## Stack

- Astro 5, TypeScript strict
- Content collections + MDX
- Shiki for syntax highlighting (built into Astro). Never add a client-side highlighter.
- `@astrojs/rss`, `@astrojs/sitemap`
- **Zero client JS on article pages.** No framework islands unless a specific post needs one — ask first.

## Content

Posts live in `src/content/posts/*.mdx`. Schema in `src/content.config.ts`:

```ts
z.object({
  title: z.string(),
  description: z.string().max(160),
  pubDate: z.date(),
  updatedDate: z.date().optional(),
  tags: z.array(z.enum(['homelab', 'claude', 'networking'])),
  draft: z.boolean().default(false),
  symptom: z.string().optional(),
  cause: z.string().optional(),
  stack: z.array(z.string()).default([]),
})
```

- Tags are exactly those three. Don't add a fourth without asking.
- URLs are `/posts/[slug]/`. Never date-prefixed.
- Every debugging post fills `symptom` and `cause`. They drive the diagnostic strip, the index previews, and the RSS summaries.
- `stack` lists versions the post was verified against (e.g. `['Proxmox 8.2', 'UniFi 9.x']`).

## Design

```css
--ink:     #12141C;  /* ground */
--ink-2:   #1C202B;  /* raised surfaces, code blocks */
--paper:   #E8E6E1;  /* body text */
--muted:   #7C8496;  /* metadata, captions */
--signal:  #F2B705;  /* accent — only for "this is the thing" */
--wrong:   #E05252;  /* struck-through wrong hypotheses */
```

- Typefaces not chosen. Propose three display/body pairings before writing any CSS. Self-host them — no Google Fonts CDN.
- Body 18–19px, measure capped ~68ch.
- Dark is default; ship light mode. Respect `prefers-color-scheme` and `prefers-reduced-motion`.
- Signature element is the diagnostic strip: symptom in `--muted`, cause in `--signal`.
- Motion budget for the entire site: the cause line reveals one beat after the symptom on page load. Nothing else.
- Don't refactor the tokens. If something needs a new color, ask.

## Writing

- First person, direct. No hedging, no throat-clearing, no "in today's fast-paced world."
- Open by naming the wrong hypothesis, then the actual cause. The wrong hypothesis is usually what the reader currently believes.
- **Never invent command output, version numbers, timings, or benchmark figures.** If a value isn't in the source notes, write `TODO(verify)` and move on.
- **Never write post prose from scratch.** Jayson supplies the messy account; you structure it and mark the gaps.
- Every command shown is a command that was actually run, with its real output.

## Security

- No real IPs, hostnames, subnets, or VLAN IDs in published content. Use the RFC 5737 documentation ranges (`192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`) as placeholders — never RFC 1918; the content-safety hook blocks all RFC 1918 addresses.
- Don't publish which services are internet-facing versus VPN-only.
- Say something if a draft is drifting into an inventory of infrastructure.

## Don't

- No newsletter popup, no comments, no cookie banner.
- No analytics beyond privacy-preserving pageview counts.
- No emoji in post titles or headings.

## Tooling

`.claude/` holds two skills and two hooks:

- `new-post` — brain-dump in, valid MDX skeleton with `TODO(verify)` markers out.
- `verify-post` — schema validation, leftover `TODO(verify)`, description length, sanitization check. Run before every publish.
- Content-safety hook — blocks commits containing RFC 1918 addresses, real hostnames, or VLAN IDs in `src/content/`. If it fires, fix the content; don't bypass it.
- Build-check hook — `astro check` after edits to `src/`.
