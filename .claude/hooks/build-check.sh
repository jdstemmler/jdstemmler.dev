#!/usr/bin/env bash
# Build-check hook: runs `astro check` after edits under src/ so type and
# schema errors surface immediately instead of at build time.
# PostToolUse for Write|Edit. Exit 2 feeds stderr back to Claude.

set -u

INPUT=$(cat)
FILE_PATH=$(printf '%s' "$INPUT" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("tool_input",{}).get("file_path",""))' 2>/dev/null)

case "$FILE_PATH" in
  */src/*) ;;
  *) exit 0 ;;
esac

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

OUTPUT=$(npx astro check 2>&1)
if [ $? -ne 0 ]; then
  echo "astro check failed after editing $FILE_PATH:" >&2
  printf '%s\n' "$OUTPUT" | tail -30 >&2
  exit 2
fi
exit 0
