# AGENTS.md

Guidance for AI agents (and humans) working in this repository.

## What this project is

A static, bilingual (English / French) showcase website for a small vintage
French cookware business trading as **Cook & Collect** (legal name "Vintage
French"). It presents a curated collection of vintage items (mostly Le Creuset,
Cousances, Staub, Fontignac cast iron and similar). Buyers contact the seller
directly via WhatsApp / Messenger; there is **no cart, checkout, or payment** —
it is a catalog, not a store.

- Live site: https://cookandcollect.eu (see `CNAME`)
- Hosting: GitHub Pages
- Custom domain: `cookandcollect.eu`

## Tech stack

- **No framework.** Plain HTML, CSS, and vanilla JavaScript.
- **Node.js** is used only for the build script and a tiny dev server. The only
  dependency is `sharp` (image compression, used in CI when adding items).
- Everything is static output deployable to GitHub Pages.

## How it works (architecture)

The site is generated from **templates + item data** by `build.js`.

### Source of truth
- `templates/*.html` — page templates with `{{placeholder}}` tokens and shared
  partials (nav, footer, contact buttons) injected by `build.js`.
- `i18n.js` — all translated strings for the templates (`en` and `fr` objects).
  Static page text lives here.
- `js/app.js` — the single client-side script. Its own `STRINGS` map holds the
  runtime strings (grid, item detail, lightbox). **Template strings live in
  `i18n.js`; runtime/dynamic strings live in `js/app.js`.** Keep them in sync.
- `items/<slug>/` — one folder per item, each containing:
  - `info.json` — `{ title, price, description, sold?, category?, issueNumber?, sortPriority? }`
  - `cover.jpg` — the grid thumbnail (any image ext; filename stem must be `cover`)
  - `2.jpg`, `3.jpg`, … — gallery images (sorted by filename)
- `css/style.css` — all styling.

### The build (`node build.js` / `npm run build`)
1. Scans `items/*/`, reads each `info.json`, collects images (cover first, rest
   sorted), auto-detects a category from title/id (or uses `info.json.category`),
   and sorts items into buckets (featured → Le Creuset cocottes → cocottes →
   Le Creuset → other).
2. Writes `manifest.json` (`{ items, categories }`). **`manifest.json` is
   gitignored** — it is generated at build/deploy time, never committed.
3. Renders every page for each locale target into:
   - root (`index.html`, `item.html`, …) — English, canonical
   - `en/` — English duplicate
   - `fr/` — French
   The manifest is inlined into a `<script>window.__MANIFEST__=…</script>` on the
   home, item, and sold pages so the site works even from `file://` (no fetch
   needed). `js/app.js` falls back to fetching `manifest.json` if not inlined.

Generated HTML (`index.html`, `en/*.html`, `fr/*.html`, etc.) **is committed**;
only `manifest.json` and `node_modules/` are ignored.

### Notable build flags (top of `build.js`)
- `VISIBLE_ONLY` — a temporary allowlist. When non-empty, only those item ids are
  published (currently set for a "Préfecture / reseller registration" reason).
  Set back to `[]` to publish the full collection.
- `FEATURED_ITEM_ORDER` — item ids pinned to the top of the grid.
- `SHIPPING_DETAILS_VISIBLE` — when `false`, the Shipping page shows only a
  "contact us for a quote" message instead of the price tables.

## Content management via GitHub Issues (no local edits needed)

Non-technical item management runs through GitHub Issue Forms + Actions:
- `.github/ISSUE_TEMPLATE/` — forms for add / mark-sold / remove.
- `.github/scripts/{add-item,mark-sold,remove-item}.js` — parse the issue body,
  create/update/delete the `items/<slug>/` folder (add-item downloads and
  compresses attached photos via `sharp`), then commit.
- `.github/workflows/manage-items.yml` — runs the matching script based on the
  issue label (`add-item` / `mark-sold` / `remove-item`), commits, rebuilds, and
  deploys to Pages, then closes the issue with a confirmation comment.
- `.github/workflows/deploy.yml` — builds and deploys on every push to `main`.

Item slugs are derived from the title (lowercased, non-alphanumerics stripped,
truncated to 50 chars). "Mark sold" sets `sold: true` in `info.json`; sold items
disappear from the home grid and show on the hidden `sold.html` page.

See `.github/AGENTS.md` for a detailed breakdown of the issue forms, scripts, and
workflows that drive this automation.

## Local development

```bash
npm install        # only needed for image compression (sharp)
npm run build      # regenerate manifest.json + all locale pages
node server.js     # static server at http://localhost:8080
```

`server.js` is a minimal static file server (port 8080) with basic
path-traversal protection. There is no watch mode — re-run `npm run build`
after changing templates, `i18n.js`, or item data.

## Conventions and gotchas for agents

- **Do not hand-edit generated pages** (`index.html`, `en/*.html`, `fr/*.html`,
  root `item.html`/`about.html`/`shipping.html`/`sold.html`/`legal-notice.html`).
  Edit `templates/*.html` and `i18n.js`, then run `npm run build`. The generated
  files will be overwritten.
- **`item.html` at the repo root is generated**; `templates/item.html` is the
  source. Same for the other top-level HTML pages.
- **Two string systems:** template strings → `i18n.js`; runtime strings →
  `STRINGS` in `js/app.js`. Add new UI text to the correct one, in both `en` and
  `fr`.
- **Categories** are stored in English in the manifest; French display labels
  live in `CATEGORY_LABELS` in `js/app.js`. If you add a category, update the
  `CATEGORIES` list in `build.js`, the issue form dropdown in
  `.github/ISSUE_TEMPLATE/add-item.yml`, and `CATEGORY_LABELS`.
- **Asset paths** are manifest-relative (`items/…`); pages resolve them with a
  per-locale base (`""` at root, `"../"` in `en/`+`fr/`) via `window.__BASE__`.
- **After any change to templates, `i18n.js`, `js/app.js`, or items, run
  `npm run build`** so the committed pages stay in sync. CI also rebuilds on
  deploy, but committing stale pages is confusing.
- Prices are free-text strings including the currency symbol (e.g. `"120€"`).
- Contact links are hardcoded (WhatsApp `+33 6 27 33 54 34`, Messenger
  `m.me/cookncollect`). Legal/owner details live in `i18n.js` under `legal`.
