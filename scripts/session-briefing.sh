#!/usr/bin/env bash
# What the other founder is building, printed when a Claude Code session
# starts in this repo (the SessionStart hook in .claude/settings.json), so
# neither founder's Claude starts on something the other is already doing.
# Read-only: it only asks GitHub and git. Never fails the session.

cd "$(dirname "$0")/.." || exit 0

echo "== Wedded App: work in flight (from GitHub, $(date '+%a %b %-d, %-I:%M %p')) =="
echo "Both founders build with Claude Code. Before starting anything, check this list;"
echo "if your task overlaps an open PR or issue, build on that branch or ask first."
echo

if ! command -v gh >/dev/null 2>&1; then
  echo "(GitHub CLI not installed, so open PRs and issues can't be listed: brew install gh, then gh auth login)"
  exit 0
fi

echo "-- Open pull requests (DRAFT ones wait for a look before they merge) --"
gh pr list --state open --limit 20 \
  --json number,title,author,isDraft,headRefName,updatedAt \
  --template '{{range .}}#{{.number}} {{if .isDraft}}[DRAFT] {{end}}{{.title}} (by {{.author.login}}, branch {{.headRefName}}, updated {{timeago .updatedAt}}){{"\n"}}{{end}}' \
  2>/dev/null || echo "(couldn't reach GitHub; run gh pr list yourself)"
echo

echo "-- Open issues: ideas and plans in progress --"
gh issue list --state open --limit 15 \
  --json number,title,assignees,updatedAt \
  --template '{{range .}}#{{.number}} {{.title}}{{if .assignees}} (assigned: {{range $i, $a := .assignees}}{{if $i}}, {{end}}{{$a.login}}{{end}}){{end}}, updated {{timeago .updatedAt}}{{"\n"}}{{end}}' \
  2>/dev/null || echo "(couldn't reach GitHub; run gh issue list yourself)"
echo

echo "-- Latest on main --"
git fetch -q origin main 2>/dev/null
git log --oneline -5 origin/main 2>/dev/null
echo
echo "Read an item with: gh pr view <n> / gh issue view <n>"
