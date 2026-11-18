# Implementation plan — SEO and conversion

Living status of the SEO and conversion work for cookandcollect.eu, based on the Search Console
export of 30 Sep – 11 Nov 2026 (119 clicks, 3,533 impressions, CTR 3.4%, average position 12.2,
77 of 119 clicks on mobile). **Keep this file up to date** (see AGENTS.md).

Status keys: ✅ done (tested locally) · 🟡 done in code, waiting for external setup · ⬜ to do

Last updated: 2026-11-18

**Live acceptance:** owner confirmed on 2026-11-16 that both "Enquire to Purchase"
and "Make an Offer" work and their emails arrive. Website commit `5b345f1`,
backend commit `25f6fa5`. This enquiry rollout did not change identification
logic or prompts.

## Ground rules

- Catalog only: no cart, checkout, payment or customer accounts.
- Keep working URLs, EN and FR, existing research and photos. Never redirect to the home page.
- Never invent prices, dates, specifications, attributions, ratings or reviews.
- Catawiki pieces must never look directly purchasable (`directSale: false` in `info.json`).
- Do not claim something works until it has been tested.

## P0 — Technical SEO, premium inventory, enquiry forms, conversion events

| Status | Item | Where |
|---|---|---|
| ✅ | Permanent product pages in English **and French** (`/{en,fr}/collection/<id>.html`), self-canonical, reciprocal hreflang + x-default | `build.js` (`renderCollectionPage`) |
| ✅ | Legacy `item.html?id=` (root, `en/`, `fr/`) → same-language permanent page in JS, UTM and hash kept, unknown ids still "not found" | `js/app.js` |
| ✅ | Server 301 for legacy URLs from `legacy-redirects.json` | Worker deployed and route active; live EN product redirect verified 2026-11-16 |
| ✅ | Mapping report of every Search Console product URL (60 URLs, all mapped, none removed) | `docs/seo/search-console-url-mapping.md` |
| ✅ | Home canonical `/`; `/en/index.html` canonicalised to `/` | `build.js` |
| ✅ | Sitemap: canonical indexable pages only, FR pages, shop pages and curated product pages (230 URLs) | `build.js` |
| ✅ | JSON-LD: Product/Offer (real price, sku, seller, `SoldOut` when sold, no reviews), BreadcrumbList, Organization, WebSite | `build.js` |
| ✅ | `directSale` flag separates premium inventory from Catawiki pieces | `build.js`, `info.json` |
| ✅ | "Enquire to Purchase" / "Make an Offer" on available direct-sale pieces only; WhatsApp fallback | `build.js`, `js/enquiry.js`, `css/style.css` |
| ✅ | Enquiry / offer form (EN/FR, validation, honeypot, Turnstile, idempotent retry, clear errors) posting to `POST /enquiry` | Both flows confirmed live by owner 2026-11-16; EN/FR behaviour covered locally, live test languages not recorded |
| ✅ | Owner email notification via Cloudflare Email Routing | Owner received both purchase enquiry and offer emails 2026-11-16 |
| ✅ | Cookieless first-party events (`view_item`, `select_item`, begin/submit enquiry and offer) with source attribution (google, guide, category, pinterest, UTM…) | Real events read back from live D1 on 2026-11-18 (all six event types, sources google/direct/other/guide/category) |
| ✅ | Owner events report: `npm run report:events [-- --days 30 --json]` calls `GET /events/summary` | `scripts/events-report.js`, `tests/events-report.test.js`; live run needs `EVENTS_ADMIN_KEY` |
| ✅ | Curated selection pieces (Available/Sold) get permanent EN/FR product pages with documented details, Product JSON-LD (brand, `additionalProperty`), per-photo alt text, purchase actions | `build.js` (`curatedItemFrom`), `manifest.items` with `curated: true` so the enquiry Worker accepts them unchanged |
| ✅ | Curated landing cards: "View details", "Enquire to Purchase", "Make an Offer" deep links (`#enquire` / `#offer` open the form); `select_item` tracked with list `curated` | `js/selection.js`, `js/enquiry.js`, `js/track.js` |
| ✅ | `directSale: false` pieces: no Offer JSON-LD, no price, "Not for sale here" badge, no shop breadcrumb, excluded from home grid, identify sidebar, archive "available now" | `build.js`, `build-archive.js`, `tests/seo.test.js` (no such items today) |
| ✅ | Privacy page: statistics and enquiry data handling | `i18n.js`, `templates/privacy.html` |

## P1 — Categories, guides → products, homepage, product metadata

| Status | Item | Where |
|---|---|---|
| ✅ | Shop pages EN/FR: Vintage Le Creuset, Cousances, Designer cookware (Loewy, Enzo Mari) — built only with ≥ `MIN_SHOP_ITEMS` pieces | `build.js` (`SHOP_CATEGORIES`), `i18n.js` `shop*` |
| ⬜ | Shop pages for French copper and champagne buckets/barware — wait until enough available pieces (now 1 and 0) | `SHOP_CATEGORIES` |
| ✅ | Guides show up to 4 matching available pieces, or a collection link (never unrelated items) | `build-guides.js` (`GUIDE_SHOP`) |
| ✅ | In-text guide links (EN+FR) to the 8 curated pieces the guides study (Veuve Clicquot, Jean Couzon, Dehillerin, Lecellier, 2 Limoges Castel, Longwy, Dior); test checks every guide → collection link resolves | `i18n.js`, `tests/seo.test.js` |
| ✅ | H1 audit: Le Creuset shop H1 differentiated from the guide H1 ("…Cast Iron for Sale"); no other duplicate indexable title/H1 | `i18n.js` |
| ✅ | Curated pieces stay off the home grid (owner decision 2026-11-18); FR curated breadcrumb reads "Notre sélection" | `build.js` `isHomeGridItem`, `i18n.js` `curatedBreadcrumb` |
| ✅ | Homepage title, meta description, H1 | `i18n.js`, `templates/home.html` |
| ✅ | Product breadcrumbs point to the shop category; related available pieces; sold note | `build.js` |
| ✅ | Item text language declared: `info.json` `"language": "fr"` (default `en`) sets the `lang` attribute of title/description on both locales; Fontignac cocotte is the only French-written item | `build.js`, `tests/seo.test.js` |
| ⬜ | Shop item text is single-language: 0 of 82 have a translation (81 written in English, 1 in French). Needs owner-verified translations | `items/<id>/info.json` |
| ✅ | `le-creuset-cocotte-ovale-vintage-fonte-maille-oran`: French title over an English description renamed to English ("Vintage Le Creuset Oval Cocotte – Enameled Cast Iron – Iconic Orange"); URL unchanged | `items/<id>/info.json` |
| ⬜ | Add a language choice to the add-item issue form so new French-written items are declared | `.github/ISSUE_TEMPLATE/add-item.yml`, `.github/scripts/add-item.js` |
| ⬜ | More descriptive image alt text per photo for shop items (curated pieces done via `imageAlts`; shop items need owner-provided descriptions) | `build.js`, `info.json` |

## P2 — Content and performance

| Status | Item | Notes |
|---|---|---|
| ⬜ | Cousances content: history, markings, Doufeu, sizes, "Made in France" marks, value | Improve the cast-iron makers guide first; only verified facts and own catalog photos |
| ⬜ | Designer cookware pages: La Mama (Enzo Mari), Raymond Loewy Coquelle | Product-specific titles; keep researched claims |
| ⬜ | Responsive images: grid cards and gallery thumbnails load full photos (~215 KB average, 1280×1600; 5 files > 500 KB). Needs generated thumbnail/WebP variants + `srcset` | Main image already eager + `fetchpriority="high"` with width/height; thumbnails lazy |
| ⬜ | Google Merchant `shippingDetails` / return policy | Only once real terms are decided; never invent |
| ✅ | Stale `collection/` page detection: build warns about pages with no published item (report only, never deletes); none today | `build.js` |
| ⬜ | Decide redirect/removal for any stale page the build reports | Check Search Console traffic first |

## Rollout and remaining acceptance

- ✅ Cloudflare Email Routing delivers to vintagetreasurecontact@gmail.com.
- ✅ D1 backup taken at `~/perso/backups/identify-agent-db-2026-11-16.sql`,
  then migration `0012_enquiries.sql` applied and Worker deployed.
- ✅ Website pushed/deployed. Live product pages load the enquiry and tracking
  scripts with `https://api.cookandcollect.eu`; the enquiry widget has a
  configured Turnstile site key. Legacy HTTP 301 is active.
- ✅ Owner tested both purchase enquiry and offer; emails received.
- ✅ Real conversion events confirmed in live D1 (2026-11-18).
- ⬜ Record language-specific EN and FR live acceptance if both languages were
  not included in the owner's test.

The identification chat is also published, but its real-Gemini quality
acceptance remains separate. It is not required for enquiries and this rollout
did not modify its logic or prompts.

## Tests

- `npm test`: build + 46 unit tests + 118 Playwright tests (desktop and mobile) — passing on 2026-11-18.
- identify-agent: 500 tests passing, typecheck clean.
- Key files: `tests/seo.test.js`, `tests/e2e/shop.spec.js`, `tests/e2e/site.spec.js`.

## Search Console checks after deploy

- Legacy `item.html?id=` URLs reported as redirects; their targets indexed.
- French product pages and shop pages indexed; sitemap resubmitted and read without errors.
- Product snippets kept; sold items shown as out of stock.
- The 13 curated product pages (`/{en,fr}/collection/<curated id>.html`) discovered and indexed via the sitemap.
- Google-selected canonical for the home page is `/`.
- Positions/CTR for "cousances", "doufeu cousances", "le creuset enzo mari", "le creuset fondue set vintage".
