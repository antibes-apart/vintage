# Implementation plan — SEO and conversion

Living status of the SEO and conversion work for cookandcollect.eu, based on the Search Console
export of 30 Sep – 11 Nov 2026 (119 clicks, 3,533 impressions, CTR 3.4%, average position 12.2,
77 of 119 clicks on mobile). **Keep this file up to date** (see AGENTS.md).

Status keys: ✅ done (tested locally) · 🟡 done in code, waiting for external setup · ⬜ to do

Last updated: 2026-11-16

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
| 🟡 | Server 301 for legacy URLs from `legacy-redirects.json` | identify-agent `src/site/legacy-redirects.ts`; needs Worker deploy + zone route |
| ✅ | Mapping report of every Search Console product URL (60 URLs, all mapped, none removed) | `docs/seo/search-console-url-mapping.md` |
| ✅ | Home canonical `/`; `/en/index.html` canonicalised to `/` | `build.js` |
| ✅ | Sitemap: canonical indexable pages only, FR pages and shop pages added (204 URLs) | `build.js` |
| ✅ | JSON-LD: Product/Offer (real price, sku, seller, `SoldOut` when sold, no reviews), BreadcrumbList, Organization, WebSite | `build.js` |
| ✅ | `directSale` flag separates premium inventory from Catawiki pieces | `build.js`, `info.json` |
| ✅ | "Enquire to Purchase" / "Make an Offer" on available direct-sale pieces only; WhatsApp fallback | `build.js`, `js/enquiry.js`, `css/style.css` |
| 🟡 | Enquiry / offer form (EN/FR, validation, honeypot, Turnstile, idempotent retry, clear errors) posting to `POST /enquiry` | `js/enquiry.js`; Worker `src/enquiry/` — needs setup below |
| 🟡 | Owner email notification via Cloudflare Email Routing | Worker `src/enquiry/email.ts` — not tested live |
| 🟡 | Cookieless first-party events (`view_item`, `select_item`, begin/submit enquiry and offer) with source attribution (google, guide, category, pinterest, UTM…) | `js/track.js`; Worker `src/events/` — needs `ANALYTICS_API_BASE` |
| ✅ | Privacy page: statistics and enquiry data handling | `i18n.js`, `templates/privacy.html` |

## P1 — Categories, guides → products, homepage, product metadata

| Status | Item | Where |
|---|---|---|
| ✅ | Shop pages EN/FR: Vintage Le Creuset, Cousances, Designer cookware (Loewy, Enzo Mari) — built only with ≥ `MIN_SHOP_ITEMS` pieces | `build.js` (`SHOP_CATEGORIES`), `i18n.js` `shop*` |
| ⬜ | Shop pages for French copper and champagne buckets/barware — wait until enough available pieces (now 1 and 0) | `SHOP_CATEGORIES` |
| ✅ | Guides show up to 4 matching available pieces, or a collection link (never unrelated items) | `build-guides.js` (`GUIDE_SHOP`) |
| ⬜ | More natural in-text links from guide paragraphs to shop pages | `templates/guides/*` |
| ✅ | Homepage title, meta description, H1 | `i18n.js`, `templates/home.html` |
| ✅ | Product breadcrumbs point to the shop category; related available pieces; sold note | `build.js` |
| ⬜ | Verified French titles/descriptions for products (`fr` field supported, none filled) | `items/<id>/info.json` |
| ⬜ | More descriptive image alt text per photo (needs owner-provided descriptions) | `build.js`, `info.json` |

## P2 — Content and performance

| Status | Item | Notes |
|---|---|---|
| ⬜ | Cousances content: history, markings, Doufeu, sizes, "Made in France" marks, value | Improve the cast-iron makers guide first; only verified facts and own catalog photos |
| ⬜ | Designer cookware pages: La Mama (Enzo Mari), Raymond Loewy Coquelle | Product-specific titles; keep researched claims |
| ⬜ | Responsive images (`srcset`, smaller covers; average cover ~236 KB) | Do not lazy-load the main product image |
| ⬜ | Google Merchant `shippingDetails` / return policy | Only once real terms are decided; never invent |
| ⬜ | Delete stale `collection/` pages of removed or hidden items | Build never deletes them; check Search Console traffic first |

## External setup still required (owner)

1. Cloudflare Email Routing with vintagetreasurecontact@gmail.com verified.
2. Turnstile widget; `wrangler secret put ENQUIRY_TURNSTILE_SECRET_KEY` (optional `ENQUIRY_HASH_SECRET`).
3. Back up D1, then `wrangler d1 migrations apply identify-agent-db --remote` (migration `0012_enquiries.sql`).
4. Deploy the Worker (`npm run deploy` in identify-agent) and add zone routes for `item.html`, `en/item.html`, `fr/item.html`.
5. GitHub repository variables: `ENQUIRY_API_BASE`, `ENQUIRY_TURNSTILE_SITE_KEY`, `ANALYTICS_API_BASE`.
6. Send one real EN and one FR enquiry and one offer; confirm the emails arrive, then mark the 🟡 rows ✅.

Nothing from this work is committed or deployed yet (site repo and identify-agent repo).

## Tests

- `npm test`: build + 38 unit tests + 110 Playwright tests (desktop and mobile) — passing on 2026-11-15.
- identify-agent: 500 tests passing, typecheck clean.
- Key files: `tests/seo.test.js`, `tests/e2e/shop.spec.js`, `tests/e2e/site.spec.js`.

## Search Console checks after deploy

- Legacy `item.html?id=` URLs reported as redirects; their targets indexed.
- French product pages and shop pages indexed; sitemap resubmitted and read without errors.
- Product snippets kept; sold items shown as out of stock.
- Google-selected canonical for the home page is `/`.
- Positions/CTR for "cousances", "doufeu cousances", "le creuset enzo mari", "le creuset fondue set vintage".
