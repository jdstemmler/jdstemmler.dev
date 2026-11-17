---
name: survey-responses
description: Pull responses to the /ai-usage-survey/ form out of the D1 database, grouped by question, and summarize them for lunch-and-learn planning. Use when Jayson asks for survey responses, survey results, what a company said, or wants to plan a session from the feedback.
---

# survey-responses

Responses to the survey at `/ai-usage-survey/` are stored in the D1 database
`jdstemmler-dev-survey` (table `survey_responses`, one row per submission;
`answers` is a JSON array of `{id, label, answer}`). The handler is
`functions/ai-usage-survey/form.ts`.

## Steps

1. If no company was named, list what's there:

   ```
   python3 .claude/skills/survey-responses/pull.py
   ```

2. Pull one company's responses as markdown, grouped by question:

   ```
   python3 .claude/skills/survey-responses/pull.py "<company>"
   ```

   Each answer is tagged with its response id and the optional role, so
   one person's answers can be tied together across questions.

3. Report: the response count, then for each question the recurring themes
   with how many responses raised each, quoting answers verbatim where the
   wording matters. Keep one-off answers visible; an outlier is often the
   best session material. Don't invent themes the answers don't support, and
   say so when there are too few responses to generalize.

4. Only if asked to plan the session: propose topics that trace back to
   specific answers, and name which answers each topic covers.

## Rules

- This repo is public and the responses are client material. Never write
  responses, company names, or company codes into tracked files. If a file
  is needed, put it under `scratch/` (gitignored).
- Read-only. Don't delete or edit rows unless Jayson explicitly asks.
- If wrangler reports it isn't authenticated, stop and ask Jayson to run
  `npx wrangler login`; don't work around it.
