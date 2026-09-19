#!/usr/bin/env bash
#
# Start the Vite dev server for the current checkout (run it from the worktree
# root), registered with the shared portless proxy:
#
#   https://hijri-birthday-<branch-leaf>.dev.sageplex.com  (feat/foo -> hijri-birthday-foo.…)
#
# Run it directly, not via `bun run`/`pnpm run`, which would re-add the package
# manager env this script strips. `scripts/worktree.sh up <branch>` calls it.
set -euo pipefail

# portless refuses to start ("don't run via npx/pnpm dlx") when npm_*/PNPM_*
# variables are present in the environment.
while IFS='=' read -r _name _; do
  case "$_name" in
    npm_* | PNPM_* | pnpm_* | COREPACK_*) unset "$_name" ;;
  esac
done < <(env)

# The shared dev proxy keeps its state outside portless's default ~/.portless.
export PORTLESS_STATE_DIR="${PORTLESS_STATE_DIR:-$HOME/.portless-dev}"
PORTLESS_BIN="${PORTLESS_BIN:-portless}"

# IPv4 on purpose: the proxy dials 127.0.0.1, and Vite would otherwise bind [::1].
# shellcheck disable=SC2016
exec "$PORTLESS_BIN" run \
  sh -c './node_modules/.bin/vite --port "$PORT" --strictPort --host 127.0.0.1'
