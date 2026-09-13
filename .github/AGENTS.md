# AGENTS.md — `.github/` (issue-driven item automation)

This folder implements **content management through GitHub Issues** so a
non-technical operator can add, sell, and remove catalog items without touching
code or running a build locally. See the repo-root `AGENTS.md` for the overall
project (a static bilingual vintage-cookware showcase built by `build.js`).

## How it fits together

An operator opens an Issue using one of the forms → the form applies a label →
`manage-items.yml` runs the job matching that label → a script mutates the
`items/` folder → the workflow commits, rebuilds (`node build.js`), deploys to
GitHub Pages, and closes the issue with a confirmation comment.

```
ISSUE_TEMPLATE/*.yml   →  label      →  workflow job   →  scripts/*.js
add-item.yml           →  add-item   →  add-item       →  scripts/add-item.js
mark-sold.yml          →  mark-sold  →  mark-sold      →  scripts/mark-sold.js
remove-item.yml        →  remove-item→  remove-item    →  scripts/remove-item.js
```

## Files

### `ISSUE_TEMPLATE/`
- `add-item.yml` — form: Title (req), Price (req), Category (dropdown), Description,
  Cover Photo (req), Gallery Photos. Applies label `add-item`, title prefix `[Add Item]`.
- `mark-sold.yml` — form: Item Folder Name (req). Label `mark-sold`, prefix `[Sold]`.
- `remove-item.yml` — form: Item Folder Name (req) + a confirmation checkbox.
  Label `remove-item`, prefix `[Remove]`.
- `config.yml` — `blank_issues_enabled: false` (forces use of the forms).

The **Category dropdown options must stay in sync** with the `CATEGORIES` list in
`build.js` and the `CATEGORY_LABELS` in `js/app.js`.

### `scripts/` (invoked from workflows via `actions/github-script`)
All three parse the issue body with a shared `getField('### Label Name')` helper
(regex against the rendered issue markdown — field labels must match the form).

- `add-item.js`
  - Derives a slug from the title (lowercase, strip non-alphanumerics, collapse
    dashes, truncate to 50 chars).
  - On reopened issues, first deletes any prior folder whose `info.json.issueNumber`
    matches this issue (idempotent re-runs).
  - Writes `items/<slug>/info.json` = `{ title, price, issueNumber, category?, description? }`.
  - Extracts image URLs from the Cover/Gallery fields (handles `![](…)` markdown,
    `user-attachments`, `private-user-images`, and general `githubusercontent.com`
    URLs). **Fails if no cover URL is found** and cleans up the folder.
  - Downloads images (GitHub URLs need the `GITHUB_TOKEN` auth header), names the
    cover `cover.<ext>` and gallery images `2`, `3`, … with extension detected
    from `Content-Type`.
  - Compresses via `sharp` (resize ≤1600px, JPEG q85); skips gracefully if `sharp`
    is unavailable.
  - Exports `ITEM_SLUG`, `ITEM_TITLE`, `DOWNLOAD_COUNT` for later workflow steps.
- `mark-sold.js` — sanitizes folder name, sets `sold: true` in that item's
  `info.json`. Fails if the folder doesn't exist. Exports `ITEM_FOLDER`, `ITEM_TITLE`.
- `remove-item.js` — sanitizes folder name, reads the title, then
  `fs.rmSync(itemDir, { recursive: true, force: true })`. Exports `ITEM_TITLE`.

### `workflows/`
- `manage-items.yml` — triggered on issues `opened`/`reopened`. Three jobs gated
  by `contains(github.event.issue.labels.*.name, '<label>')`. Each job: checkout →
  (add only: setup Node + `npm install`) → run its script → configure git bot
  identity → `git add` + commit + push → `node build.js` → configure Pages →
  upload artifact → deploy → comment + close issue.
  Permissions: `contents: write`, `issues: write`, `pages: write`, `id-token: write`.
- `deploy.yml` — builds and deploys to GitHub Pages on push to `main` (and manual
  `workflow_dispatch`). This is what publishes ordinary commits.

## Gotchas for agents

- **`getField` regex depends on exact form labels.** If you rename a field label in
  an `ISSUE_TEMPLATE/*.yml`, update the matching `getField('### …')` call in the
  corresponding script (note `add-item.js` escapes parentheses in the photo labels).
- **Labels are the routing key.** The `labels:` in each form must match the
  `if: contains(... '<label>')` guards in `manage-items.yml`.
- **`npm install` only runs in the add-item job** because that's the only path that
  needs `sharp`. mark-sold/remove don't install deps.
- **`manifest.json` is not committed** — the workflows regenerate it during build
  before deploying, and `deploy.yml` does the same for normal pushes.
- Slugs are truncated to 50 chars; two titles that collide after slugging will fail
  with "already exists". `mark-sold`/`remove` take the **folder name** (the `?id=`
  value from the item URL), not the title.
- These scripts run in the GitHub Actions runner (Node 20), not the browser. Keep
  them dependency-light (only `fs`, `path`, and optionally `sharp`).
