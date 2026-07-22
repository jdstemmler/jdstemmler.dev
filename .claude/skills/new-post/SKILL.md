---
name: new-post
description: Turn a messy brain-dump of what broke and what fixed it into a valid MDX post skeleton with correct frontmatter, a filled diagnostic strip, and TODO(verify) markers everywhere real output must be pasted. Use when Jayson wants to start a new post.
---

# new-post

Input: a rough, unstructured account from Jayson — what looked broken, what he
suspected, what it actually was, roughly what fixed it. Terminal output may or
may not be included yet.

Output: one file in `src/content/posts/<slug>.mdx` that builds cleanly.

## Hard rules (restated from CLAUDE.md — they are binding)

- **Never invent command output, version numbers, timings, or benchmark
  figures.** If a value is not in the brain-dump, write `TODO(verify)` and
  move on. A plausible-looking command that was never run is fatal to this
  site's only asset: trust.
- **Never write the prose from scratch.** Structure what was supplied; mark
  the gaps. If the account doesn't say why the fix worked, the skeleton gets a
  `TODO(verify: explain why this worked)` — not your best guess.
- Sanitize as you write: only RFC 5737 addresses (`192.0.2.0/24`,
  `198.51.100.0/24`, `203.0.113.0/24`), generic hostnames, no VLAN IDs, no
  internet-facing/VPN-only distinctions.

## Frontmatter

Follow the schema in `src/content.config.ts` exactly:

- `title` — no emoji. Prefer the counterintuitive finding ("It wasn't the
  10GbE adapter") over a description of the topic.
- `description` — ≤160 chars, written for a search result snippet.
- `pubDate` — today. No `updatedDate` on a new post.
- `tags` — subset of `homelab`, `claude`, `networking` only.
- `symptom` / `cause` — required for every debugging post. Symptom is what it
  looked like; cause is what it actually was. One line each, concrete.
- `stack` — versions the account mentions, e.g. `['Proxmox 8.2', 'UniFi 9.x']`.
  Unknown versions become `TODO(verify)` in the body, not guesses here.
- `draft: true` until verify-post passes.

## Structure

1. **Open with the wrong hypothesis** — what the reader (and Jayson) believed
   first. Then the actual cause. No throat-clearing, first person, direct.
2. **The symptom in detail** — what was observed, with real output or
   `TODO(verify: paste <specific thing>)` placeholders.
3. **The investigation** — the path from wrong hypothesis to cause, including
   dead ends. Every command shown is one that was actually run; if its output
   isn't in the dump, put the command with `TODO(verify: paste output)`.
4. **The fix** — exact change, then evidence it worked (before/after numbers
   only if supplied).
5. **Slug**: kebab-case, no date prefix.

Make each `TODO(verify: ...)` specific about what needs pasting, so filling
them in is mechanical. When done, tell Jayson how many TODO markers remain and
remind him to run verify-post before publishing.
