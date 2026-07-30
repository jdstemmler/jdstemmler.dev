---
name: review-post
description: Adversarial fresh-eyes review of a finished post — source-restatement audit, claim classification, figure reproduction, and prose-tell detection. Run before opening any PR with a new post. Catches what verify-post structurally cannot.
---

# review-post

`verify-post` checks whether a post is *valid*. This checks whether it's *honest and
worth reading*. They fail differently and you need both.

Run this before opening a PR, not after. A post that has already shipped costs a
retraction; a post on a branch costs an edit.

## Why this exists

A post passed `verify-post` cleanly at every stage — schema, zero `TODO(verify)`,
description length, sanitization, build green — while containing:

- a central novelty claim ("this isn't documented anywhere") that was false, and
  checkable in one click, because the documentation page the post *block-quoted*
  documented most of its findings
- a vendor comparison table reproduced with one row dropped, under a heading claiming
  to correct what "most writing on this" gets wrong
- a sentence from that same page with two words changed, presented as the author's
  reasoning
- a figure that didn't reproduce on the version in the post's own frontmatter
- "they answer it the same way twice" describing two runs with opposite conditions and
  opposite outcomes
- a recommended technique published without its failure mode, in a post whose thesis
  was that every obvious check has one

None of that is detectable mechanically. All of it was found by two readers with
different reasons to care.

A later round on the same post also found that its results section rested on two prompts
that differed in more ways than the post claimed, and that a quote described as volunteered
was a required field in the prompt's own schema. Both were checkable in a minute against
files already on disk. If a post reports a comparison, diff the inputs.

## How to run it

Dispatch **two** reviewers in parallel, as subagents, and give each a persona with a
motive rather than a checklist. The personas below are the ones that worked.

**Hand them the evidence directory.** This is the single most important operational
detail. When the skeptic was pointed at the lab notes behind the post, it withdrew its
two next-most-severe findings — it had assumed figures were unevidenced, then re-tallied
the raw logs itself and matched exactly. A reviewer without the evidence generates
false accusations you then have to disprove; a reviewer with it generates findings you
can act on, and its remaining criticisms carry much more weight.

**Have them write to a file, not message back.** Ask for
`scratch/<persona>-review.md` and a one-word confirmation. Reports sent by message
have been lost in transit even when the send reported success. The file is the
deliverable; the message is only a receipt.

**Tell them not to edit anything.** Read-only review.

### Reviewer 1 — the operator

Someone with the problem the post claims to solve, mid-incident, who wants to act in
the next five minutes. Give them a specific situation, not a role.

Ask for: where in the post they got their answer and how far they had to read; whether
there is a command they could copy-paste *right now*, quoted; what confused them in
reading order; what they skimmed and whether deleting it would have cost them
anything; what was missing that they needed.

This persona finds structural failures. It's the one that noticed the post was
unusable for its most likely reader — someone whose session had ended — and didn't say
so until its exact midpoint.

### Reviewer 2 — the skeptic

Someone who has built the thing the post is about, is tired of the genre, and assumes
AI-assisted writing hides a thin evidential core. Willing to be convinced by evidence,
not by tone.

Ask for a **claim audit**: classify each factual claim as demonstrated in the post,
asserted without support, sourced to documentation or a third party, or quietly hedged
so it can't be wrong. Then: does it lean on its sample harder than the sample bears;
where does it read machine-assembled; do the self-narrated mistakes earn their place;
what's overclaimed and what's true-but-buried; would you act on it and would you
subscribe.

## The checks that earn their keep

Fold these into the reviewer briefs, or run them yourself.

**Source restatement.** Fetch every source the post cites and read it in full. For
each fact the post presents as discovery, ask whether it's in there. Watch for the
asymmetry that's easy to commit unconsciously: crediting sources for *failure modes*
(which looks thorough) while restating their *facts* in first-person discovery voice
(which would shrink the contribution). If the post claims something is undocumented,
that claim must survive reading the documentation it links to.

**Reproduce every figure.** Re-run the commands, re-tally the logs, re-count the
strings. A decorative integer that argues for nothing is the worst possible trade —
it's the one thing a hostile reader can trivially fail to reproduce. Check the
provenance note actually covers what's in the post; a note vouching for two items
reads as a limited warranty on everything else.

**Sample honesty.** Two runs under opposite conditions are one run per condition and
zero replication. Watch for hedge-then-lean in a single sentence: "I won't dress this
up as a rate" followed immediately by a claim that only a rate would support.

**Failure modes of anything recommended.** If the post recommends a technique, it must
state when that technique is wrong. This matters most in posts *about* unreliable
checks, where the omission is self-refuting.

**Prose tells.** Specific and countable:

- the two-beat punch ("It's wrong." / "You can't." / "There is no team.") — one is a
  voice, six is a template
- em-dash self-interruption as the default sentence shape: assert, interrupt, qualify
- sentences with the cadence of hard-won judgment and the content of a transition
  ("generalises about as far as you'd expect")
- symmetrical headings imposed on asymmetric material
- cross-references between the post's own sections — writers say the thing
- takeaway bloat. Calibrate against the rest of the site rather than in the abstract.

**Length calibration.** Count words against the existing posts. A number in isolation
means nothing; "48% longer than anything else published here" is actionable.

**Self-narrated mistakes.** The rule that separates them: an admission that changes
the reader's procedure earns its place; an admission that only certifies the author as
careful does not. Enough of the second kind starts discounting the first.

**The inversion to look for.** Foregrounding errors while hiding rigor. If the work
behind the post is more careful than the post admits, showing the method would buy the
credibility the confessions are reaching for — and pre-empt the sample-size criticism
for free.

## Review again after fixing — the fixes are the next defect surface

This is the most important thing on this page and it isn't optional.

In the round that produced this skill, a post went through three review rounds. **Every
defect found in round three had been introduced by round two's fixes.** Not one was
original to the post. Three usability complaints were answered with three convenience
commands, and each introduced a false negative in an environment that hadn't been tested.

So budget for at least two rounds, and when re-reviewing, aim the reviewer at what changed
rather than at the whole post. A returning reviewer is cheaper and better for this — it
still has the sources and evidence loaded, and it can check whether a fix landed or was
merely papered over. Resume it rather than spawning a fresh one; a send resumes an agent
from its transcript with context intact.

Reviewers die. Three were killed by API 529s during that session. Have them write to a
file, keep the file as the deliverable, and resume rather than restart.

### Over-correction is a failure mode with the same root as overclaiming

Watch for the correction that overshoots. In round two a finding was **hedged short** of
what the evidence supported. In round three the same finding was **pushed past** it, into
"you can't trust this in either direction" — which contradicted the post's own advice
elsewhere and was disproved by the author's own files, where the behaviour turned out to be
a clean conditional. Unpredictability *sounds* like the bigger finding. It's usually the
smaller one, and reaching for it is the same avoidance as hedging: both are ways of not
committing to what you actually measured.

Ask the reviewer explicitly to flag it: anything now credited to a source that's genuinely
yours, anything hedged below what the evidence supports, and any claim that has drifted from
too-strong to too-weak.

### Prefer cutting to hedging

When a review lands, the reflex is to add a disclaimer. Resist it. Adding "this is reasoning,
not measurement" keeps an unsupported claim on the page and buys credit for labelling it —
and enough of those turn honesty into an unfalsifiable posture.

The test: if you're about to hedge a claim, ask whether the claim needs to exist. In that
session, cutting the unverified claims dropped hedge density from five instances to one and
lost nothing, because each hedged claim was decorative. Measure it — count hedges per
thousand words against the other posts on the site. A post hedging several times where the
others hedge zero is usually carrying claims it hasn't earned.

### Published commands are the highest-risk content

Every command in a post is a promise. The recurring failure isn't a command that errors —
it's one that runs cleanly and returns the wrong answer somewhere the author never stood.

- **Run each command from a second environment**, not just the one you wrote it in. A `cwd`
  disambiguator worked in a normal checkout and silently failed in a git worktree. A
  "newest transcript" shortcut returned the *current* session, giving a false negative in
  exactly the scenario its section addressed.
- **Distrust convenience.** Auto-detection, `head -1`, machine-wide globs, and index
  guesses like `.members[0]` are where the false negatives live. Prefer a minimal command
  scoped to something the reader has already identified, and let them do the identifying.
- **Prefer evidence the post's own commands produce.** One control experiment was backed by
  a separate artifact; it turned out the post's own published command demonstrated the same
  thing in its normal output. Self-demonstrating evidence can't drift from the artifact and
  needs no reader trust.

## Acting on the findings

Verify each finding yourself before acting. Reviewers are confidently wrong sometimes,
and a review that has been checked is worth far more than one taken on faith.

Sort by whether a reader could catch it: anything checkable in one click — a false
claim about a linked source, an uncited lift, a figure that doesn't reproduce — is
urgent regardless of how small it looks, because each one survives if nobody checks
and is embarrassing if somebody does.

Expect at least one finding to invert an instinct you were confident about. "Too much
on what didn't work" turned out to be exactly backwards: the failures were the only
material not already in the documentation, and the fat was the documentation paraphrase.

## Output

A short report per reviewer, then your own verified list, ranked by whether a reader
could catch it. End with either "ready to open a PR" or the specific list of what must
change first.
