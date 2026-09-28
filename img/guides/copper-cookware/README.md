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

## E. Dehillerin sauté pan — 29 cm, 4.685 kg, approx. 3 mm

`dehillerin-saute/`

| File | Subject |
| --- | --- |
| `1-full.jpeg` | Complete pan, main view (also the hero / Open Graph image for the pillar and Dehillerin guides) |
| `2-mark.jpeg` | `E. DEHILLERIN / PARIS` mark |
| `3-dimensions.jpeg` | Measuring tape across the rim, documenting the approx. 29 cm diameter |
| `4-handle.jpeg` | Massive iron handle |
| `5-rivets.jpeg` | The three rivets — ideally showing the `18` stamped on the interior rivet heads |
| `6-interior.jpeg` | Tinned interior |

Published from the original documentary photography of the object. The only
processing applied is a proportional downscale to a 1600 px long edge; no crop,
no rotation, no colour, exposure or white-balance change, no sharpening and no
retouching of the copper, the tin lining, the patina or the background — the
surface condition and the markings are the evidence.

Every figure on the Dehillerin guide uses `<g-figure frame="full">` for the same
reason: the shared fixed card height crops with `object-fit: cover`, which would
cut documentary detail out of frame (the handle's hanging hole, the ends of the
tape, the outer rivets).

Still unpublished, because the guides have no figure position for them and
neither page should be redesigned to create one:

| Source file | Subject |
| --- | --- |
| `1000096998.jpg` | The pan on a digital scale reading `4685 g` — the source for the 4.685 kg specification |
| `1000096996.jpg` | Exterior copper base, base wear, handle attachment and riveted construction |

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
| `2-mark.jpeg` | `L. Lecellier / Cuivralec / Villedieu` mark — on the **20 cm** saucepan, the only maker-stamped piece; the `20` size stamp beside it is in the same frame |
| `3-label.jpeg` | Original Cuivralec paper label — also the one Lecellier photograph used on the pillar guide |
| `4-detail.jpeg` | The five saucepans from above: shared construction, handles, rivets, surviving labels |

Published from the original documentary photography of the set. The only
processing applied is the file's own EXIF orientation (`3-label` and `4-detail`
are portrait photographs recorded sideways with an orientation flag, and the
build strips EXIF) plus a proportional downscale to a 1600 px long edge. No
crop, no colour, exposure or white-balance change, no sharpening, and no
retouching of the copper, the patina, the wear or the paper labels.

Every figure on the Lecellier guide uses `<g-figure frame="full">` so the shared
fixed card height cannot crop the evidence out of frame (handle hanging holes,
the `20` stamp, the outer saucepans, the printed edge of the label). The pillar
guide keeps `3-label` in the standard card frame, where the crop leaves the
complete label visible.

**Do not caption or alt-text the silver-coloured interior surface as tinned,
stainless, nickel or any other material.** The label reads "sans étamage" and the
guide states explicitly that the interior material has not been identified.

Still unpublished, because the guides have no figure position for them and
neither page should be redesigned to create one:

| Source file | Subject |
| --- | --- |
| `IMG_8970.jpeg` | Exterior copper bases of the five saucepans — patina, heat colouring, wear |
| `IMG_8971.jpeg` | Second view of the same bases; substantially overlaps the above |

## Framing notes

CSS crops every guide figure to a fixed height (`--guide-card-h`) with
`object-fit: cover`, so portrait and landscape originals both sit correctly.
Keep the subject centred; for mark and label close-ups, fill the frame with the
marking so it stays legible after cropping.

## Sold objects

The Mauviel pan and the confiturier have been sold. Their captions describe them
as being from the Cook & Collect archive and must not suggest current
availability — keep that wording when replacing the photographs.
