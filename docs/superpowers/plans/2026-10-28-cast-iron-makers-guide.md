# European enamelled cast iron makers guide — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A bilingual (EN/FR) collector's guide profiling seven European enamelled cast iron makers and how they connect, every fact sourced and owner-confirmed.

**Architecture:** A normal top-level guide in the existing `build-guides.js` pipeline (registry entry, template in `templates/guides/`, `guideCastIron*` strings in `i18n.js`), plus its file name in `GUIDE_FILES` in `build.js` for the sitemap. Facts come from a research checklist the owner approves before the page text is written.

**Tech Stack:** Plain Node build scripts, HTML templates with `{{i18n}}` tokens, `node --test`, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-28-cast-iron-makers-guide-design.md`

## Global Constraints

- Makers, in this order: Le Creuset, Cousances, Staub, Invicta, Fontignac (France); Descoware (Belgium); DRU (the Netherlands). Countries confirmed by the research.
- Profiles about 80–120 words each; page about 1,000–1,400 words per language.
- Only sources actually consulted; no marketplace listings, forums or auction lots as sources; "Research & References" ordered by evidential weight.
- No date without evidence; disagreement between good sources is stated or the fact is omitted.
- No identification aids (marking, handle, lid or size charts); no dating of individual pieces.
- Do not repeat the Le Creuset guides; link to `vintage-le-creuset.html` and `le-creuset-dating-guide.html`.
- No archive hub link yet (`/en/archive/` does not exist until the first piece is published).
- Photos: `<g-figure>` placeholders only; original Cook & Collect photography later.
- File name: `european-enamelled-cast-iron-makers.html` in `en/guides/` and `fr/guides/`.
- Every string in both `en` and `fr` of `i18n.js`; no text copied from a source.

## Review Focus

- A source that only repeats another (e.g. a retailer copying a brand history) is counted as one source, not corroboration. Task 1 marks such facts "single source".
- A maker history known mainly from collector folklore: the fact is flagged weak or left out, never stated as settled. Task 1.
- French typography in the FR strings (non-breaking space before `:` `;` `?` `!`, guillemets): Task 3 checks it in the rendered FR page.
- A guide link or reference URL that 404s: Task 3 checks every outbound reference URL responds before handover.
- Placeholder photos must not break the e2e "no same-origin 4xx" rule: `<g-figure>` placeholders load no file; Task 3 runs the full e2e suite.

---

### Task 1: Research checklist

**Files:**
- Create: `docs/superpowers/specs/2026-10-28-cast-iron-makers-guide-facts.md`

- [ ] **Step 1:** For each maker, search the web (manufacturer history pages, museum/institutional records, company registers, reputable reference works) and read the sources.
- [ ] **Step 2:** Write the checklist: one table per maker with columns `Fact | Source (title + URL) | Strength (strong / single source / conflicting / weak)`; a "How they connect" table the same way; a "Left out" list of claims found but not supported. Every row has a URL that was actually opened.
- [ ] **Step 3:** Verify: no row without a URL; no marketplace/forum URL; each maker has at least country and period, or the gap is stated.
- [ ] **Step 4:** Hand the checklist to the owner. **Gate:** Task 2 starts only after the owner has ticked or struck the facts.

### Task 2: Apply the owner's review

**Files:**
- Modify: `docs/superpowers/specs/2026-10-28-cast-iron-makers-guide-facts.md`

- [ ] **Step 1:** Remove struck facts; record the owner's corrections with "owner, <date>" as their source.
- [ ] **Step 2:** Confirm with the owner that the remaining list is what the page may say.

### Task 3: The guide page

**Files:**
- Create: `templates/guides/european-enamelled-cast-iron-makers.html`
- Modify: `build-guides.js` (GUIDES registry), `build.js` (`GUIDE_FILES`), `i18n.js` (`guideCastIron*`, EN and FR), `tests/navigation.test.js`

**Interfaces:**
- Consumes: approved facts from Task 2.
- Produces: registry entry `{strKey: 'guideCastIron', template: 'guides/european-enamelled-cast-iron-makers.html', file: 'european-enamelled-cast-iron-makers.html', ogImage, card: {image}, datePublished: <publish date>, dateModified: <publish date>}`; `{{guideCastIronHref}}` available to other guides.

- [ ] **Step 1: Write the failing test** in `tests/navigation.test.js`: `test('the cast iron makers guide is built in both languages and listed in the sitemap')` asserting that after the build `en/guides/european-enamelled-cast-iron-makers.html` and `fr/guides/…` exist, contain no `{{\w+}}`, contain `href="vintage-le-creuset.html"` and `href="le-creuset-dating-guide.html"`, contain a `guide-references` section, contain one `<h2>` per maker with ids `maker-le-creuset`, `maker-cousances`, `maker-staub`, `maker-invicta`, `maker-fontignac`, `maker-descoware`, `maker-dru` in that order, and that `sitemap.xml` contains both URLs.
- [ ] **Step 2:** Run `npm run test:unit`; expected FAIL (files missing).
- [ ] **Step 3:** Add the registry entry, the template (sections: intro, "How they connect", one profile per maker, Le Creuset guides link block, collection CTA, Research & References; `<g-figure>` placeholders under `img/guides/cast-iron-makers/`, with file names and alt text describing the photo still needed), the EN and FR strings, and the `GUIDE_FILES` line.
- [ ] **Step 4:** Run `npm run test:unit`; expected PASS. Then `npm test` (unit + e2e); expected all pass, the e2e suite visits the new guide in both languages.
- [ ] **Step 5:** Check every reference URL responds (HTTP < 400) and the FR page's typography; screenshot EN and FR on desktop and mobile and look at them.
- [ ] **Step 6:** Hand over for owner review; the owner commits and pushes.
