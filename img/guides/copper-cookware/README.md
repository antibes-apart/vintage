# Copper guide photography — `img/guides/copper-cookware/`

Original Cook & Collect object photography only. No stock images, no other
dealers' or marketplace photographs, no AI-generated object images.

These files are shared by the copper pillar guide and the three specialist
guides. Every illustration is rendered through the `<g-figure>` component
(`build-guides.js`), which means:

- **while a file is missing**, the build renders a same-sized placeholder frame
  carrying the caption — no broken images, no layout shift;
- **to publish or replace a photograph**, drop the file in at the exact path
  below. Nothing else changes: no HTML, no CSS, no captions, no alt-text
  structure, no internal links, no structured data;
- `npm run build` prints every path still missing.

That is also the upgrade path for the professional photo-box images: overwrite
the working file at the same path and rebuild. Keep the filenames exactly as
listed (including the `.jpeg` extension), because the paths are referenced
literally in the templates.

## Which guide uses which folder

| Folder | Used by |
| --- | --- |
| `dehillerin-saute/` | **E. Dehillerin guide** (full case study) · pillar guide uses `1-full` only |
| `mauviel-saute/` | **Mauviel guide** (case study 1) · pillar guide uses `2-mark` only |
| `mauviel-dehillerin-confiturier/` | **Mauviel guide** (case study 2) |
| `lecellier-cuivralec/` | **L. Lecellier guide** (full case study) · pillar guide uses `3-label` only |

## E. Dehillerin sauté pan — 29 cm, 4.655 kg, approx. 3 mm

`dehillerin-saute/`

| File | Subject |
| --- | --- |
| `1-full.jpeg` | Complete pan, main view (also the hero / Open Graph image for the pillar and Dehillerin guides) |
| `2-mark.jpeg` | `E. DEHILLERIN / PARIS` mark |
| `3-wall.jpeg` | Approx. 3 mm copper wall (rim or edge showing the gauge) |
| `4-handle.jpeg` | Massive iron handle |
| `5-rivets.jpeg` | The three rivets — ideally showing the `18` stamped on the interior rivet heads |
| `6-interior.jpeg` | Tinned interior |

## Mauviel sauté pan (sauteuse) — Cook & Collect archive, sold

`mauviel-saute/`

| File | Subject |
| --- | --- |
| `1-full.jpeg` | Complete pan (hero / Open Graph image for the Mauviel guide) |
| `2-mark.jpeg` | `Mauviel / Made in France` mark |
| `3-detail.jpeg` | Handle and rivet detail |

## Mauviel / E. Dehillerin confiturier — research in progress

`mauviel-dehillerin-confiturier/`

| File | Subject |
| --- | --- |
| `1-full.jpeg` | Complete confiturier |
| `2-mark.jpeg` | Both markings, photographed for examination |

## L. Lecellier "Cuivralec" graduated saucepan set — 12/14/16/18/20 cm, approx. 1.5 mm

`lecellier-cuivralec/`

| File | Subject |
| --- | --- |
| `1-set.jpeg` | The five graduated saucepans together (hero / Open Graph image for the Lecellier guide) |
| `2-mark.jpeg` | `L. Lecellier / Cuivralec / Villedieu` mark — on the **20 cm** saucepan, the only maker-stamped piece |
| `3-label.jpeg` | Original Cuivralec paper label |
| `4-detail.jpeg` | Construction detail (rivets / handle / gauge) |

## Framing notes

CSS crops every guide figure to a fixed height (`--guide-card-h`) with
`object-fit: cover`, so portrait and landscape originals both sit correctly.
Keep the subject centred; for mark and label close-ups, fill the frame with the
marking so it stays legible after cropping.

## Sold objects

The Mauviel pan and the confiturier have been sold. Their captions describe them
as being from the Cook & Collect archive and must not suggest current
availability — keep that wording when replacing the photographs.
