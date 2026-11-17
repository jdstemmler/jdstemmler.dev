#!/usr/bin/env python3
"""Pull AI usage survey responses from D1 and print them as markdown.

  pull.py              list companies with response counts
  pull.py <company>    all responses for that company, grouped by question

Needs wrangler logged in to the account that owns the database.
"""
import json
import re
import subprocess
import sys
from collections import defaultdict

DB = "jdstemmler-dev-survey"


def query(sql: str) -> list[dict]:
    proc = subprocess.run(
        ["npx", "wrangler", "d1", "execute", DB, "--remote", "--json", "--command", sql],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        sys.exit(f"wrangler failed:\n{proc.stdout}\n{proc.stderr}")
    return json.loads(proc.stdout)[0]["results"]


def main() -> None:
    if len(sys.argv) < 2:
        rows = query(
            "select company, count(*) as responses, min(submitted_at) as first, "
            "max(submitted_at) as last from survey_responses group by company"
        )
        if not rows:
            print("No responses yet.")
        for r in rows:
            print(f"{r['company']}: {r['responses']} responses ({r['first'][:10]} to {r['last'][:10]})")
        return

    company = sys.argv[1]
    if not re.fullmatch(r"[\w .&-]+", company):
        sys.exit("Company name has unexpected characters.")
    rows = query(
        "select id, submitted_at, role, answers from survey_responses "
        f"where lower(company) = lower('{company}') order by id"
    )
    if not rows:
        sys.exit(f"No responses for {company!r}. Run with no argument to list companies.")

    by_question: dict[str, list[tuple[int, str, str]]] = defaultdict(list)
    for r in rows:
        for a in json.loads(r["answers"]):
            if a["answer"].strip():
                by_question[a["label"]].append((r["id"], r["role"] or "", a["answer"].strip()))

    roles = sorted({r["role"] for r in rows if r["role"]})
    print(f"# {company} survey responses\n")
    print(f"{len(rows)} responses, {rows[0]['submitted_at'][:10]} to {rows[-1]['submitted_at'][:10]}.")
    if roles:
        print(f"Roles given: {', '.join(roles)}.")
    for label, answers in by_question.items():
        print(f"\n## {label}\n\n{len(answers)} of {len(rows)} answered.\n")
        for rid, role, answer in answers:
            tag = f"#{rid}" + (f", {role}" if role else "")
            print(f"- ({tag}) " + answer.replace("\n", "\n  "))


if __name__ == "__main__":
    main()
