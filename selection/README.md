# Selected Collection data

This folder holds the **Curated Selection** shown on `curated-selection.html`
(`/en/curatedselection`). The folders are separate from the shop in `items/`.

How the build uses these records:

- Entries with status `Available` or `Sold` get a permanent product page at
  `/{en,fr}/collection/<slug>.html`, and they're added to `manifest.items` with
  `curated: true`. That's the list the enquiry Worker accepts.
- Available entries show their `price`, written as "€475" and displayed as
  "475€". They get "Enquire to Purchase" / "Make an Offer"; there is no cart
  or payment.
- Curated pieces appear in shop category pages, guide recommendations and
  related pieces. They don't appear on the home grid.
- A slug must not also exist in `items/`, or the build stops.

## One folder per object

```
selection/
  <slug>/
    info.json
    cover.jpg      # main / overall photograph (filename stem must be "cover")
    2.jpg          # alternate views, details, maker's marks, condition …
    3.jpg
    …
```

Images are optional during development — if there is no `cover`, the page
shows a neutral placeholder. Do **not** commit stock or placeholder photos to
the final public version; provide real object photography.

## `info.json` schema

Every field except `title` is **optional**. Unknown fields are simply omitted
from the page — empty fields are never displayed.

```jsonc
{
  "title":      "E. Dehillerin Copper Sauté Pan, Paris, France, 20th Century",
  "category":   "French Copperware",   // one of the 4 categories below (optional)
  "maker":      "E. Dehillerin",
  "designer":   "",                     // when known
  "origin":     "Paris, France",
  "period":     "20th Century",         // approximate period or date
  "materials":  "Copper, cast iron handle, tin lining",
  "dimensions": "Ø 24 cm, height 8 cm",
  "marks":      "Stamped 'E. Dehillerin Paris' on the handle",
  "description":"Short curatorial description of the piece.",
  "condition":  "Very good vintage condition, retinned interior.",
  "status":     "Available",            // "Available" or "Collection Archive"
  "sortPriority": 10,                    // lower = shown earlier (optional)
  "fr": {                                // French translations (optional, per field)
    "title":       "Sauteuse en cuivre E. Dehillerin, Paris, France, XXe siècle",
    "description": "…",
    "condition":   "…"
  }
}
```

### French translations (`fr`)

The French page (`fr/curated-selection.html`) uses `fr.<field>` when present and
falls back to the English value otherwise. Translatable fields: `title`,
`maker`, `designer`, `origin`, `period`, `materials`, `dimensions`, `marks`,
`description`, `condition`, `status`. Keep English and French in sync: every
object should have at least `title`, `description`, `materials`,
`dimensions`, `marks` and `condition` translated. `status` values
`Available` / `Collection Archive` and categories are translated automatically.

### Categories (`category`)

The gallery is grouped by category, in this order (set by `SELECTION_CATEGORIES`
in `build.js`); empty categories are not shown. Within a group, objects are
ordered by `sortPriority`, then title.

- `French Copperware`
- `Rare Cast Iron`
- `Champagne & Wine Objects`
- `French Design & Decorative Objects`

If `category` is omitted, the object still appears in the gallery under
"Other pieces".

## Adding / removing objects

- **Add:** create a new `selection/<slug>/` folder with `info.json` (+ photos),
  then run `npm run build`.
- **Remove:** delete the folder and rebuild.

A dedicated GitHub Issue Form for collectible items will be added later to
automate this the same way `items/` is managed.
