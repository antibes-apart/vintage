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
- **Node.js** runs the builds, dev server, and tests. Development dependencies
  are `sharp` (image compression) and `@playwright/test` (browser regression tests);
  the deployed site has no runtime dependencies.
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
  - `info.json` — `{ title, price, description, sold?, hidden?, category?, issueNumber?, sortPriority? }`
    (`hidden: true` unpublishes the item entirely — not in the grid, sold page or
    manifest — while keeping its folder, e.g. when a piece moves to the curated selection)
  - `cover.jpg` — the grid thumbnail (any image ext; filename stem must be `cover`)
  - `2.jpg`, `3.jpg`, … — gallery images (sorted by filename)
- `css/style.css` — all styling.
- `en/collection/<slug>.html` — generated permanent item pages. Their gallery
  is rendered by `build.js` and enhanced by the same `js/app.js` controls as
  the legacy item pages, without fetching the manifest.
- `templates/lightbox.html` — shared lightbox partial for permanent and
  legacy item pages.

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
- `.github/workflows/tests.yml` — unit and Playwright tests on pull requests and
  non-main pushes. Also called by `deploy.yml` to gate regular Pages deployments.

Item slugs are derived from the title (lowercased, non-alphanumerics stripped,
truncated to 50 chars). "Mark sold" sets `sold: true` in `info.json`; sold items
disappear from the home grid and show on the hidden `sold.html` page.

See `.github/AGENTS.md` for a detailed breakdown of the issue forms, scripts, and
workflows that drive this automation.

## Local development

```bash
npm ci             # install locked build/test dependencies
npx playwright install chromium  # once, for browser tests
npm run build      # regenerate manifest.json + all locale pages
npm test           # rebuild, then unit + desktop/mobile browser tests
npm run test:e2e    # browser tests only; automatically builds and starts the server
node server.js     # static server at http://localhost:8080
```

`server.js` is a minimal static file server (port 8080) with basic
path-traversal protection. There is no watch mode — re-run `npm run build`
after changing templates, `i18n.js`, or item data.

Browser tests live in `tests/e2e/` and use `playwright.config.js`. They cover
item/curated galleries, image bounds, thumbnail and lightbox navigation, zoom,
modal scroll locking, breadcrumb styling and scrolling, guide navigation,
category filters, and the no-JavaScript item fallback. They choose representative
items from the built catalog rather than depending on a particular item's slug.
Port 8081 must be free: tests start their own freshly built server and stop it
afterward. External font CSS is stubbed so tests do not require Google Fonts.
Failure screenshots and traces are saved in `test-results/`; the HTML report is
in `playwright-report/` (`npx playwright show-report`). CI uploads both for seven
days. These generated test artifacts are gitignored. The normal dev server
still defaults to port 8080; `PORT` overrides it when needed.

## Listing studio (`studio.html`)

- Unlinked, `noindex` page (not in the nav or sitemap) where photos and notes become a
  Catawiki description, adjustable by chat. Template `templates/studio.html`, strings
  `studio*` in `i18n.js`, runtime strings and logic in `js/studio.js`, styles under
  "Listing studio" in `css/style.css`.
- It calls the separate **identify-agent** Worker API (`POST /listing`,
  `POST /listing/revise`). The address comes from `STUDIO_API_BASE` in `build.js`
  (environment variable at build time). While it is empty, the page shows "not available
  yet". The GitHub Pages deploy (`.github/workflows/deploy.yml`) sets it to
  `https://api.cookandcollect.eu`; local builds and the test job leave it empty, so the
  committed `studio.html` files keep `data-api=""` and the e2e tests still see "not available".
- `STUDIO_TURNSTILE_SITE_KEY` is Cloudflare Turnstile's public site key; the secret key
  stays on the Worker. Photos are resized in the browser to JPEG at most 1 MiB.
- Local testing only: on `localhost`/`127.0.0.1` the page accepts `?api=<url>`, e.g.
  `http://127.0.0.1:8080/en/studio.html?api=http://127.0.0.1:8787`.
- Owner-only studio: the identify-agent Worker requires the admin key (`Authorization: Bearer
  <LISTING_ADMIN_KEY>`) on both routes and refuses everyone else with `403 OWNER_ONLY`. The page
  therefore shows the photo/notes form only when this browser holds a saved owner key; without a
  key the owner panel is always visible and prompts for it. `studio.js` attaches the saved key to
  every request. (Server-side this is gated by `LISTING_OWNER_ONLY`, default on; the visitor
  quotas/Turnstile/budget code remains for a future public identification page.)
- E2E tests (`tests/e2e/studio.spec.js`) mock the API and never call a real service.

## Archive of documented pieces (`build-archive.js`)

- SEO pages for pieces the owner documented (sold on Catawiki), **not for sale here**: one page per
  piece in English and French (`en/archive/<slug>.html`, `fr/archive/<slug>.html`), a hub per
  language grouped by brand (`en/archive/`, `fr/archive/`) and `sitemap-archive.xml`, which is also
  added to `robots.txt`.
- Source: `archive/<slug>/info.json`, one folder per piece. The contract is `validateObject()` in
  `build-archive.js`; an invalid record stops the build and names the file and field. Photos are
  not in the repo: each is a key on `https://images.cookandcollect.eu/` with its pixel size.
- Runs after `build.js` (it reads `manifest.json` for the "Available now" block: up to four shop
  items for sale, same brand first). It deletes and regenerates everything it owns on each run,
  so a removed record loses its pages. Its outputs are gitignored and built at deploy time
  (`deploy.yml` and every job in `manage-items.yml`); no `archive/` folder means no pages.
- A record with `shop_item` naming an existing shop item gets no archive page: the hub links to
  the shop page instead (one page per object).
- Text strings: `archive*` in `i18n.js`. Styles: "Archive of documented pieces" at the end of
  `css/style.css` (archive pages load `style.css?v=18`, `app.js?v=3`).
- Local preview with the sample records in `tests/fixtures/archive/`: `npm run preview:archive`,
  then `node server.js` and open `http://127.0.0.1:8080/en/archive/index.html`. Run
  `npm run build` afterwards to remove the sample pages. Tests: `tests/archive.test.js`.

## Conventions and gotchas for agents

- **Do not hand-edit generated pages** (`index.html`, `en/*.html`, `fr/*.html`,
  root `item.html`/`about.html`/`shipping.html`/`sold.html`/`legal-notice.html`/`studio.html`).
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
- **Navigation:** sticky menu styling is scoped to `body > nav`. Breadcrumbs
  and other in-page navigation stay in normal flow; item and guide breadcrumbs
  share ordered-list styling in `css/style.css`.
- **After any change to templates, `i18n.js`, `js/app.js`, or items, run
  `npm run build`** so the committed pages stay in sync. CI also rebuilds on
  deploy, but committing stale pages is confusing.
- Prices are free-text strings including the currency symbol (e.g. `"120€"`).
- Contact links are hardcoded (WhatsApp `+33 6 27 33 54 34`, Messenger
  `m.me/cookncollect`). Legal/owner details live in `i18n.js` under `legal`.
