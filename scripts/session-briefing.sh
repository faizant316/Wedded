#!/usr/bin/env bash
# What each founder's tabs are building, printed when a Claude Code session
# starts in this repo (the SessionStart hook in .claude/settings.json), so
# neither founder's Claude starts on something the other is already doing.
# Read-only: it only asks GitHub and git. Never fails the session.

cd "$(dirname "$0")/.." || exit 0

BOARD_URL="BOARD_URL_PENDING"

echo "== Wedded App: work in flight (from GitHub, $(date '+%a %b %-d, %-I:%M %p')) =="
echo "Both founders build with Claude Code. The founder names your tab (\"You're Fezy Tab 1\");"
echo "work only on that tab's tasks below, and ask before touching anything else."
echo

git fetch -q origin main 2>/dev/null

# The Tabs section of PROJECT_BRIEF.md as it is on main, so a session on an
# older branch still sees the latest
echo "-- Tabs: who's working on what (PROJECT_BRIEF.md on main) --"
echo "This session is on branch: $(git branch --show-current 2>/dev/null)"
echo
tabs=$(git show origin/main:PROJECT_BRIEF.md 2>/dev/null | awk '/^## Tabs/ { on = 1; next } on && /^## / { exit } on')
if [ -n "$tabs" ]; then
  echo "$tabs"
else
  echo "(couldn't read the Tabs section of PROJECT_BRIEF.md on main; read it yourself)"
fi
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

# The build plan: every open issue, grouped by founder and tab (labels tab-1,
# tab-2, founders), now before next before later, with what each is waiting on
# and any open PR that will close it
echo "-- Build plan: open tasks by founder and tab (the board: $BOARD_URL) --"
repo=$(gh repo view --json owner,name --jq '.owner.login + " " + .name' 2>/dev/null)
gh api graphql -F owner="${repo% *}" -F name="${repo#* }" -f query='
query($owner: String!, $name: String!) { repository(owner: $owner, name: $name) {
  issues(first: 100, states: OPEN, orderBy: {field: CREATED_AT, direction: ASC}) { nodes {
    number title
    assignees(first: 1) { nodes { login } }
    labels(first: 10) { nodes { name } }
    blockedBy(first: 10) { nodes { number state } }
    closedByPullRequestsReferences(first: 3, includeClosedPrs: false) { nodes { number } }
  } } } }' --jq '
  def founder: {"faizant316": "Fezy", "gurkiratbagri13-netizen": "Kirat"}[.] // .;
  def tab: if index("tab-1") then "1" elif index("tab-2") then "2" elif index("founders") then "3" else null end;
  def tabname: {"1": "Tab 1 (server and database)", "2": "Tab 2 (app screens)", "3": "Founders (a founder does these, not an agent)"}[.];
  def when: if index("now") then "now" elif index("next") then "next" elif index("later") then "later" else "" end;
  def rank: {"now": 0, "next": 1, "later": 2, "": 3}[.];
  def nums: map("#\(.)") | join(" ");
  [.data.repository.issues.nodes[] | (.labels.nodes | map(.name)) as $l | {
    n: .number, t: .title, tab: ($l | tab), when: ($l | when),
    who: ((.assignees.nodes[0].login // "nobody") | founder),
    waiting: [.blockedBy.nodes[] | select(.state == "OPEN") | .number],
    prs: [.closedByPullRequestsReferences.nodes[].number]
  }] as $all
  | ($all | map(select(.tab != null)) | group_by(.who + .tab)[]
      | "\(.[0].who) · \(.[0].tab | tabname)",
        (sort_by((.when | rank), .n)[]
          | "  \((.when + "      ")[0:6])#\(.n) \(.t)"
            + (if (.prs | length) > 0 then "  [in progress: PR \(.prs | nums)]"
               elif (.waiting | length) > 0 then "  [waiting on \(.waiting | nums)]"
               else "" end)),
        ""),
    "Other open issues:",
    ($all | map(select(.tab == null))[] | "  #\(.n) \(.t) (\(.who))")
' 2>/dev/null || echo "(couldn't reach GitHub; run gh issue list yourself)"
echo

echo "-- Latest on main --"
git log --oneline -5 origin/main 2>/dev/null
echo
echo "Read an item with: gh pr view <n> / gh issue view <n>"
