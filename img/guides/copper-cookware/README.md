# Copper guide photography — `img/guides/copper-cookware/`

Original Cook & Collect object photography only. No stock images.

The guide (`templates/guides/vintage-french-copper-cookware.html`) references the
paths below through the shared `<g-figure>` component. **While a file is
missing, the build renders a same-sized placeholder carrying the caption.** To
publish a photograph, drop the file in at the exact path below — nothing else
changes (no HTML, no CSS, no layout shift). `npm run build` prints every path
still missing.

Any image extension works only if you keep the filename exactly as listed
(`.jpeg`), because the path is referenced literally.

## E. Dehillerin sauté pan — 29 cm, 4.655 kg, approx. 3 mm (principal case study)

`dehillerin-saute/`

| File | Subject |
| --- | --- |
| `1-full.jpeg` | Complete pan, main view (also used as the hero / Open Graph image) |
| `2-mark.jpeg` | `E. DEHILLERIN / PARIS` mark |
| `3-wall.jpeg` | Approx. 3 mm copper wall (rim or cut edge showing gauge) |
| `4-handle.jpeg` | Massive iron handle |
| `5-rivets.jpeg` | The three rivets — ideally showing the `18` stamped on the interior rivet heads |
| `6-interior.jpeg` | Tinned interior |

## Mauviel copper saucepan

`mauviel-saucepan/`

| File | Subject |
| --- | --- |
| `1-full.jpeg` | Complete saucepan |
| `2-mark.jpeg` | `Mauviel / Made in France` mark |

## Mauviel / E. Dehillerin confiturier (research in progress)

`mauviel-dehillerin-confiturier/`

| File | Subject |
| --- | --- |
| `1-full.jpeg` | Complete confiturier |
| `2-mark.jpeg` | The markings, photographed for examination |

## L. Lecellier "Cuivralec" graduated saucepan set — 12/14/16/18/20 cm, approx. 1.5 mm

`lecellier-cuivralec/`

| File | Subject |
| --- | --- |
| `1-set.jpeg` | The five graduated saucepans together |
| `2-mark.jpeg` | `L. Lecellier / Cuivralec / Villedieu` mark on the largest saucepan |
| `3-label.jpeg` | Original Cuivralec paper label |
| `4-detail.jpeg` | Construction detail (rivets / handle / gauge) |

## Framing notes

CSS crops every guide figure to a fixed height (`--guide-card-h`) with
`object-fit: cover`, so both portrait and landscape originals sit correctly.
Keep the subject centred; for mark and label close-ups, fill the frame with the
marking so it stays legible after cropping.
