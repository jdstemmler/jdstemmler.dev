---
name: verify-post
description: Pre-publish validation for a post — schema, leftover TODO(verify) markers, description length, sanitization. Run before every publish, on one post or all posts.
---

# verify-post

Validates one post (or all of `src/content/posts/` if none named) before it
ships. Report every failure with file and line; do not fix anything without
being asked.

## Checks

1. **Schema** — `npx astro check` and `npm run build` both pass. Frontmatter
   parses with the exact schema in `src/content.config.ts`: tags only from
   `homelab`/`claude`/`networking`, dates valid, `stack` an array of strings.
2. **No leftover markers** — grep the post for `TODO(verify` (also match
   `TODO (verify` and bare `TODO:`). Any hit is a publish blocker.
3. **Description** — present and ≤160 characters (the schema enforces this,
   but report the actual length so near-misses are visible).
4. **Diagnostic strip** — if the post is a debugging post, `symptom` and
   `cause` are both filled, one line each.
5. **Sanitization** — run the same patterns as the content-safety hook:
   no RFC 1918 addresses (10/8, 172.16/12, 192.168/16), no `.local`/`.lan`/
   `.internal`/`.home.arpa` hostnames, no VLAN IDs. Only RFC 5737 addresses
   are acceptable. Also flag anything that reads as an inventory of
   infrastructure (service lists, which things are internet-facing).
6. **Output honesty** — every fenced command block should read as an actual
   run. Flag suspiciously round numbers, outputs with no command, or commands
   whose output was clearly hand-trimmed to nothing.
7. **`draft` flag** — remind that publishing means flipping `draft: false`,
   and only after all checks pass.

## Output format

A short pass/fail table per check, then the blockers as a list. End with
either "ready to publish" or the exact list of what must change first.
