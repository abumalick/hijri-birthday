@AGENT.md

<!-- worktree-harness:begin -->
## Worktree development (required)

**HARD RULE — never edit `master`'s working tree for code.** Every task that
touches files, however small, starts by creating a worktree. The top-level
checkout stays on `master`, always. Only `*.md`/docs edits may happen on `master`,
and even then its branch must not change. If you catch yourself having edited
`master`, stop and move the change into a worktree
(`git stash push` → `scripts/worktree.sh create <branch>` → `git stash pop`).

**Lifecycle (one line per phase):**
1. **Start** — `scripts/worktree.sh create <branch>`; it prints the worktree path and
   dev URL (`https://hijri-birthday-<branch-leaf>.dev.sageplex.com`). Pick a leaf no
   other open branch uses — `feat/foo` and `fix/foo` share one URL.
2. **Work** — edit only inside `.worktrees/<branch>`; start its dev server with
   `scripts/worktree.sh up <branch>` (runs `bun install`, then Vite through portless;
   the printed port is informational — portless assigns the real one).
3. **Finish** — after you (or the user) verify the preview, run
   `scripts/worktree.sh finish <branch>`: merges `--no-ff` into `master`, pushes,
   runs `bun run deploy` from the top checkout, then checks
   `https://hijri-birthday.h2.limited` returns 200.
4. **Verify deploy** — a task is **not done until the deploy is verified**. If
   `finish` reports DEPLOY/VERIFY FAILED, the merge is already pushed: fix forward,
   and do not tear down the worktree until the site is healthy.
5. **Clean up** — `scripts/worktree.sh remove <branch>` (only worktrees this
   session created and whose work is merged), then `git worktree list` to surface
   any worktrees other agents left open — **do not touch those**.
<!-- worktree-harness:end -->

<!-- superpowers-usage:begin -->
## Use superpowers for the work (when installed)

The `superpowers` skills auto-load at session start; this reinforces them and covers
hosts/clones where the plugin is absent. **Inside the worktree, use them for the craft:**
- **Before building a feature** → `superpowers:brainstorming`, then `superpowers:writing-plans`.
- **Fixing a bug** → `superpowers:systematic-debugging` first.
- **While implementing** → `superpowers:test-driven-development`.
- **Before finishing** → `superpowers:requesting-code-review` + `superpowers:verification-before-completion`.

**The worktree lifecycle stays with this harness, not superpowers:**
- Create / run / clean up worktrees with `scripts/worktree.sh` — **never
  `superpowers:using-git-worktrees`**, which makes a plain, unwired worktree that does
  not run this project's server/DB/env.
- Integrate with `scripts/worktree.sh finish` (the finish-model is already configured) —
  do **not** use `superpowers:finishing-a-development-branch`, which would re-offer
  merge/PR choices that fight the configured flow.
<!-- superpowers-usage:end -->
