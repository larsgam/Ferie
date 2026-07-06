---
name: deploy-pages
description: How to publish/update the live GitHub Pages site for the Ferie project (larsgam.github.io/Ferie). Use whenever changes under docs/ need to go live, or when Lars says "opdater hjemmesiden", "deploy", "push til github pages", "gør den live", or asks to verify a deploy. Explains that Pages serves from the gh-pages branch, built by the deploy.yml Action on push to main.
---

# Deploy the Ferie site to GitHub Pages

## How it works (know this before touching anything)

- **Repo:** `larsgam/Ferie` (remote `git@github.com:larsgam/Ferie.git`). GitHub user is `larsgam`.
- **Live site:** https://larsgam.github.io/Ferie/ — front page is `home.html`; per-trip hubs live at `docs/<tripcode>/overview.html`.
- **Pages serves from the `gh-pages` branch (root), NOT from `main`.**
- `.github/workflows/deploy.yml` runs **on every push to `main`** and publishes the **`docs/`** folder to `gh-pages` via `peaceiris/actions-gh-pages` (`force_orphan: true`).
- **Never edit or push `gh-pages` directly.** It is machine-generated. You only edit files under `docs/` and get them onto `main`.

## To publish changes

1. Make edits under `docs/`.
2. Get the commit onto `main`:
   - **On a feature branch** (e.g. `ferie-app-foundation`): commit on the branch, then
     ```
     git push origin <branch>
     git checkout main && git merge --ff-only <branch> && git push origin main
     git checkout <branch>        # return to where Lars was working
     ```
   - **Already on main:** `git commit` then `git push origin main`.
3. The push to `main` triggers `deploy.yml` → rebuilds `gh-pages` → live in ~1 minute.

Commit/push only when Lars asks (saying "deploy"/"opdater hjemmesiden" counts). End commit messages with the `Co-Authored-By: Claude ...` line per the harness rules.

## Verify the deploy actually went live

```bash
gh run list --workflow=deploy.yml --limit 3        # newest run should be your commit → "success"
git fetch origin gh-pages && git log -1 --oneline origin/gh-pages   # subject = "deploy: <your main sha>"
curl -s -o /dev/null -w "%{http_code}\n" https://larsgam.github.io/Ferie/<path>   # expect 200
```
Also spot-check content is really updated, e.g. `curl -s <url> | grep "<expected text>"`.

## Gotchas

- **Auto-commit hook:** an `Auto-commit: Claude-session` hook commits working-tree changes during a session, so your files may already be committed on the current branch. Always run `git log`/`git status` before assuming nothing is committed — then still make a proper final commit with a real message.
- **`main` can lag far behind the working branch.** The live site reflects only what is on `main` (via gh-pages). If the site looks stale, check `git rev-list --left-right --count main...<branch>` — merging the branch into `main` is what makes work live.
- **CDN propagation:** after the Action succeeds, Pages may take ~1–2 min to serve the new content.
- Changing the master travel plan also has content rules — see the `opdater-plan` skill and the `feedback-plan-updates` memory (update overview.html + kort.html + planer.html together).
