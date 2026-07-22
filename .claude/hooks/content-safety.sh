#!/usr/bin/env bash
# Content-safety hook: keeps infrastructure details out of published content.
#
# Blocks in src/content/:
#   - RFC 1918 addresses (10/8, 172.16/12, 192.168/16)
#   - internal hostname suffixes (.local, .lan, .internal, .home.arpa)
#   - VLAN IDs (the word "vlan" followed by a number)
#
# Sanctioned placeholders are the RFC 5737 documentation ranges:
#   192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24
# (These do not overlap RFC 1918, so no whitelist logic is needed.)
#
# Modes:
#   default        PreToolUse for Write|Edit — reads hook JSON on stdin, scans
#                  the incoming content when the target is under src/content/
#   --pre-commit   PreToolUse for Bash — if the command is a git commit, scans
#                  the whole src/content/ tree as a backstop
#
# Exit 2 blocks the tool call; stderr is shown to Claude.

set -u

PATTERNS=(
  '\b10\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\b'
  '\b172\.(1[6-9]|2[0-9]|3[01])\.[0-9]{1,3}\.[0-9]{1,3}\b'
  '\b192\.168\.[0-9]{1,3}\.[0-9]{1,3}\b'
  '\b[a-zA-Z0-9][a-zA-Z0-9-]*\.(local|lan|internal|home\.arpa)\b'
  '\bvlan[ _-]?[0-9]+'
)

fail() {
  echo "content-safety: BLOCKED — $1" >&2
  echo "Published content must not reference real infrastructure. Use RFC 5737 placeholders (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24) and generic hostnames. Fix the content; do not bypass this hook." >&2
  exit 2
}

scan_text() {
  local text="$1" label="$2"
  for pat in "${PATTERNS[@]}"; do
    local match
    match=$(printf '%s' "$text" | grep -i -E -o "$pat" | head -1)
    if [ -n "$match" ]; then
      fail "$label matches forbidden pattern: '$match'"
    fi
  done
}

INPUT=$(cat)

if [ "${1:-}" = "--pre-commit" ]; then
  cmd=$(printf '%s' "$INPUT" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("tool_input",{}).get("command",""))' 2>/dev/null)
  case "$cmd" in
    *"git commit"*) ;;
    *) exit 0 ;;
  esac
  dir="${CLAUDE_PROJECT_DIR:-.}/src/content"
  [ -d "$dir" ] || exit 0
  for pat in "${PATTERNS[@]}"; do
    match=$(grep -r -i -E -o "$pat" "$dir" | head -1)
    if [ -n "$match" ]; then
      fail "src/content/ contains forbidden pattern before commit: '$match'"
    fi
  done
  exit 0
fi

# Write|Edit mode: scan the incoming text when the target is under src/content/
FILE_PATH=$(printf '%s' "$INPUT" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("tool_input",{}).get("file_path",""))' 2>/dev/null)
case "$FILE_PATH" in
  */src/content/*) ;;
  *) exit 0 ;;
esac

TEXT=$(printf '%s' "$INPUT" | python3 -c '
import json, sys
ti = json.load(sys.stdin).get("tool_input", {})
print(ti.get("content", "") or ti.get("new_string", ""))
' 2>/dev/null)

scan_text "$TEXT" "content written to $FILE_PATH"
exit 0
