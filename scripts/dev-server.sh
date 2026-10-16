#!/usr/bin/env bash
#
# Start the Vite dev server for the checkout this script lives in, registered with
# the shared portless proxy:
#
#   https://hijri-birthday-<branch-leaf>.dev.sageplex.com  (feat/foo -> hijri-birthday-foo.…)
#
# `scripts/worktree.sh up <branch>` calls it from the worktree.
#
# SC2016: WH_DEV_CMD is single-quoted on purpose, so $PORT expands when it runs.
# shellcheck disable=SC2016
set -euo pipefail

# ── Config (filled by the worktree-harness builder) ──
WH_LABEL="hijri-birthday"                       # empty -> no URL, no portless
WH_TLD="dev.sageplex.com"
# The shared dev proxy keeps its state outside portless's default ~/.portless.
# shellcheck disable=SC2034 # read by wh_portless
WH_PORTLESS_STATE_DIR="${PORTLESS_STATE_DIR:-$HOME/.portless-dev}"
# Under portless the server must listen on $PORT, refuse any other port and bind
# IPv4: the proxy dials 127.0.0.1, and Vite would otherwise bind [::1] (502).
WH_DEV_CMD='./node_modules/.bin/vite --port "$PORT" --strictPort --host 127.0.0.1'
# ─────────────────────────────────────────────────────

here="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=/dev/null
. "$here/lib/worktree-common.sh"
# The server's cwd is how `worktree.sh remove` finds and stops it.
cd "$here/.."

branch="$(git rev-parse --abbrev-ref HEAD)"
if [ -n "$WH_LABEL" ] && command -v portless >/dev/null 2>&1; then
  echo "dev URL: $(wh_url "$WH_LABEL" "$(wh_leaf "$branch")" "$WH_TLD")"
  wh_portless run --name "$WH_LABEL" bash -c "$WH_DEV_CMD"
else
  eval "$WH_DEV_CMD"
fi
