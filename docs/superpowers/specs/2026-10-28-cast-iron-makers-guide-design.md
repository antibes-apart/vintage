# European enamelled cast iron makers guide (H1) — design

## Intent

A collector's guide that tells readers who the European enamelled cast iron makers were, where and
roughly when they worked, and how they relate to each other. It is an overview, not an
identification manual. It ranks for "vintage enamelled cast iron makers"-type searches and leads
readers to the archive of documented pieces (H2) and to the shop.

## Goals

- One profile per maker, about 80–120 words: Le Creuset, Cousances, Staub, Invicta, Fontignac
  (France); Descoware (Belgium); DRU (the Netherlands). Countries to be confirmed by the research.
  Godin, Chasseur and Copco were removed by the owner on 2026-10-28.
- A short "How they connect" section: acquisitions, makers producing for other brands, designers.
- Links: the two Le Creuset guides (no repetition of their content) and the collection. The
  archive hub link is added later, once the archive has published pieces: today
  `/en/archive/` does not exist yet, and a guide must not ship a dead link.
- English and French, about 1,000–1,400 words each.

## Non-goals

- No identification aids: no marking, handle, lid or size charts.
- No dating of individual pieces.

## Anti-goals

- An unsourced or marketplace-sourced fact on the page.
- Repeating the Le Creuset guides, or copying text from any source.

## Constraints

- House rules of the existing guides: only sources actually consulted, listed in a
  "Research & References" section ordered by evidential weight; no date without evidence;
  disagreements between good sources stated or the fact omitted; original Cook & Collect
  photography only.
- Photos: placeholders for now (`<g-figure>` renders same-size placeholders and lists them).
- The owner confirms every historical fact before publishing; the owner decides when to push.

## Approaches (chosen: A, and research-first)

- **A. Top-level guide in `build-guides.js`** (chosen): registry entry, template in
  `templates/guides/`, `guideCastIron*` strings in `i18n.js`, file name added to `GUIDE_FILES` in
  `build.js` for the sitemap. Gets the guide layout, breadcrumbs, hreflang, Article/Breadcrumb
  JSON-LD and a Guides index card with no new code.
- B. Child of the Le Creuset guide: rejected, it covers ten makers.
- C. Merged with the archive hub: rejected, the hub is regenerated from records, the guide is
  hand-checked text.
- Facts: **research-first** (chosen): the assistant researches each maker on the web
  (manufacturer histories, museum and company records, reputable references; not marketplaces),
  drafts from those sources and hands over a checklist of each fact with its source, weak or
  conflicting ones flagged. Alternative (owner supplies sources) not chosen.

## Decided

- File: `european-enamelled-cast-iron-makers.html` in `en/guides/` and `fr/guides/`.
- Order of profiles: by country, France first, then Belgium and the Netherlands.

## Left to the builder

- Section headings, exact wording, which facts make each profile.
- Fact checklist format and location (proposal: next to this spec, `…-facts.md`).
