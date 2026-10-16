@AGENT.md

<!-- worktree-harness:begin -->
## Worktree development (required)

**HARD RULE — never edit the main checkout's working tree for code.** Every task
that touches files, however small, starts in its own worktree. The main checkout
stays on `main`, always; only docs edits may happen there, and its branch must
never change. Uncommitted changes in the main checkout may belong to sibling
agents: never commit, stash or revert them.

- **Start** — `wt="$(scripts/worktree.sh create <branch>)" && cd "$wt"`. It prints
  only the worktree path (folder names are slugified: never guess
  `.worktrees/<branch>`) and starts or rebases the branch on `main`. If the
  current checkout has no `scripts/worktree.sh`, run the main checkout's copy by
  its absolute path.
- **Dev server** — `scripts/worktree.sh up <branch> --bg` (prints log path and
  pid); URL `https://hijri-birthday-<branch-leaf>.dev.sageplex.com`. Pick a leaf
  no other open branch uses — `feat/foo` and `fix/foo` share one URL.
- **Work** — edit, run and commit only inside that path.
- **Finish** — once you (or the user) have checked the preview, commit, then
  `scripts/worktree.sh finish <branch>` (merges `--no-ff` into `main`, pushes,
  runs `bun run deploy` from the main checkout, then checks
  `https://hijri-birthday.h2.limited` returns 200). On success it removes the
  worktree and the merged branch; on failure it keeps them, so fix there and
  re-run.
- **Verify deploy** — finish deploys and verifies; a task is **not done until the
  deploy is verified**. If finish reports DEPLOY/VERIFY FAILED, the merge is
  already pushed: fix forward.
- **Clean up (mandatory)** — never leave your worktree behind.
  `scripts/worktree.sh list` shows each worktree's merged/dirty state and stray
  processes. Never remove a worktree another agent owns.
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
