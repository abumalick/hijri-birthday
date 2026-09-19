#!/usr/bin/env bash
# The *_CMD vars are eval-ed later, so their $vars are single-quoted on purpose.
# shellcheck disable=SC2016
set -euo pipefail

# ── Config (filled by the worktree-harness builder) ──────────────────────────
WH_LABEL="hijri-birthday"            # portless/base label (package.json "name")
WH_TLD="dev.sageplex.com"            # dev-host TLD; empty -> localhost
# Informational only: `up` runs the server through `portless run`, which assigns
# the real $PORT itself.
WH_PORT_BAND_START="4100"
WH_PORT_BAND_SIZE="100"
WH_WT_DIR=".worktrees"
WH_ENV_FILES=""                                 # space-separated gitignored files to copy main->worktree
# The *-cmd vars below are SINGLE-quoted so any $WH_PORT/$WH_SLUG/... they contain
# expand at eval time, not at assignment. Keep them free of literal single quotes.
# $here points at this script's scripts/ dir, so `up` works on branches created
# before the harness was committed.
WH_UP_CMD='bun install --frozen-lockfile && bash "$here/dev-server.sh"'
WH_FINISH_MODEL="merge-branch"                  # pr | merge-main | merge-branch
WH_INTEGRATION_BRANCH="main"
WH_DEPLOY_CMD='cd "$main_root" && bun install --frozen-lockfile && bun run deploy'
WH_DEPLOY_VERIFY='[ "$(curl -fsS -o /dev/null -w "%{http_code}" https://hijri-birthday.h2.limited)" = 200 ]'
# ─────────────────────────────────────────────────────────────────────────────

here="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=/dev/null
. "$here/lib/worktree-common.sh"

# Run from the main checkout even when invoked inside a worktree.
main_root="$(git rev-parse --path-format=absolute --git-common-dir)"
main_root="$(cd "$main_root/.." && pwd)"

wt_path()  { printf '%s/%s/%s' "$main_root" "$WH_WT_DIR" "$(wh_slugify "$1")"; }
wt_port()  { wh_hash_to_port "$(wh_slugify "$1")" "$WH_PORT_BAND_START" "$WH_PORT_BAND_SIZE"; }
wt_url()   { wh_url "$WH_LABEL" "$(wh_leaf "$1")" "$WH_TLD"; }

# Copy gitignored env/secret files from the main checkout into the worktree, so the
# worktree's server has its config without those files being tracked. Missing files
# are skipped. Word-splitting on WH_ENV_FILES is intentional (space-separated list).
_copy_env_files() {
  local wt="$1" f
  # shellcheck disable=SC2086
  for f in $WH_ENV_FILES; do
    [ -f "$main_root/$f" ] || continue
    mkdir -p "$wt/$(dirname "$f")"
    cp "$main_root/$f" "$wt/$f"
    echo "copied $f -> worktree"
  done
}

cmd_create() {
  local branch="$1" wt; wt="$(wt_path "$branch")"
  if git -C "$main_root" show-ref --verify --quiet "refs/heads/$branch"; then
    git -C "$main_root" worktree add "$wt" "$branch"
  else
    git -C "$main_root" worktree add -b "$branch" "$wt"
  fi
  _copy_env_files "$wt"
  printf 'worktree: %s\nurl:      %s\nport:     %s\n' "$wt" "$(wt_url "$branch")" "$(wt_port "$branch")"
}

cmd_up() {
  local branch="$1" wt url port slug
  wt="$(wt_path "$branch")"; url="$(wt_url "$branch")"; port="$(wt_port "$branch")"
  slug="$(wh_slugify "$branch")"
  if [ -n "$WH_UP_CMD" ]; then
    echo "starting: $WH_UP_CMD  (cwd=$wt, url=$url, port=$port)"
    # WH_SLUG/WH_PORT let the up-cmd namespace DB / COMPOSE_PROJECT_NAME per worktree.
    ( cd "$wt" && WH_URL="$url" WH_PORT="$port" WH_SLUG="$slug" PORT="$port" eval "$WH_UP_CMD" )
  else
    echo "Start the dev server from $wt at $url (port $port)."
  fi
}
cmd_list()   { git -C "$main_root" worktree list; }
cmd_remove() {
  local branch="$1" wt; wt="$(wt_path "$branch")"
  if [ -d "$wt" ]; then
    git -C "$main_root" worktree remove --force "$wt" 2>/dev/null || true
    echo "removed $wt"
  else
    echo "no worktree at $wt"
  fi
  if git -C "$main_root" branch -D "$branch" 2>/dev/null; then
    echo "deleted branch $branch (recover if needed: git branch $branch \$(git reflog | grep $branch | head -1 | cut -d' ' -f1))"
  fi
  cmd_list
}

# _run_deploy: returns non-zero (does NOT exit) if a deploy/verify step fails, so
# the caller can restore the checkout before exiting.
_run_deploy() {
  [ -n "$WH_DEPLOY_CMD" ] && { echo "+ deploy: $WH_DEPLOY_CMD"; eval "$WH_DEPLOY_CMD" || return 1; }
  if [ -n "$WH_DEPLOY_VERIFY" ]; then
    echo "+ verify: $WH_DEPLOY_VERIFY"
    eval "$WH_DEPLOY_VERIFY" || return 1
  fi
  return 0
}

cmd_finish() {
  local branch="$1" target="$WH_INTEGRATION_BRANCH" orig
  case "$WH_FINISH_MODEL" in
    pr)
      command -v gh >/dev/null || { echo "gh not found"; exit 1; }
      ( cd "$(wt_path "$branch")" && git push -u origin "$branch" && gh pr create --fill )
      echo "PR opened for $branch — move ticket to In Review; merge after CI is green."
      ;;
    merge-main|merge-branch)
      # The top checkout must always end back on the branch it started on (the
      # harness invariant: it stays on main). Capture it and restore on every path.
      orig="$(git -C "$main_root" rev-parse --abbrev-ref HEAD)"
      git -C "$main_root" fetch origin --quiet
      git -C "$main_root" checkout "$target" --quiet
      git -C "$main_root" merge --ff-only "origin/$target" --quiet 2>/dev/null || true
      if ! git -C "$main_root" merge --no-ff "$branch" -m "merge $branch into $target" --quiet; then
        git -C "$main_root" merge --abort 2>/dev/null || true
        git -C "$main_root" checkout "$orig" --quiet 2>/dev/null || true
        echo "MERGE CONFLICT ($branch -> $target) — aborted; top checkout restored to $orig. Resolve in the worktree, then retry."
        exit 1
      fi
      git -C "$main_root" push origin "$target" --quiet
      if ! _run_deploy; then
        git -C "$main_root" checkout "$orig" --quiet 2>/dev/null || true
        echo "DEPLOY/VERIFY FAILED — pushed, but worktree kept and top checkout restored to $orig; ticket NOT advanced."
        exit 1
      fi
      git -C "$main_root" checkout "$orig" --quiet
      echo "merged $branch -> $target, pushed${WH_DEPLOY_CMD:+, deployed}${WH_DEPLOY_VERIFY:+ + verified}; top checkout on $orig"
      ;;
    *) echo "unknown WH_FINISH_MODEL: $WH_FINISH_MODEL"; exit 1 ;;
  esac
}

usage() { echo "usage: worktree.sh {create|up|remove|list|finish} [branch]"; exit 2; }
case "${1:-}" in
  create) shift; cmd_create "${1:?branch required}" ;;
  up)     shift; cmd_up     "${1:?branch required}" ;;
  remove) shift; cmd_remove "${1:?branch required}" ;;
  list)   cmd_list ;;
  finish) shift; cmd_finish "${1:?branch required}" ;;
  *)      usage ;;
esac
