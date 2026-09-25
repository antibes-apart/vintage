# Vintage Le Creuset pillar guide photography — `img/guides/le-creuset/archive/`

Original Cook & Collect object photography only. No manufacturer, museum,
auction or marketplace images, no stock photography, no AI-generated object
images. In particular, **Le Creuset's own Archive Series photographs are cited
as a documentary reference in the text and are never reproduced here.**

All files are rendered through the `<g-figure>` component (`build-guides.js`),
except the three archive-record cards in *Selected Vintage Le Creuset Designs*,
which use hand-written `<figure>` markup because a record carries an eyebrow,
heading and provenance line rather than a figcaption. `npm run build` prints
every `<g-figure>` path still missing.

## Published files

Published files are **framing-only** derivatives of the originals: crop and
recompression (mozjpeg, q86, 4:4:4). **No colour, tone, exposure, white balance,
sharpening, background or content change is applied.** Chips, scratches, rim
wear, patina, the studio sweep's own shading and — for the Futura — the kitchen
setting it was photographed in are all exactly as photographed.

| File | Subject | Source original | Crop (left, top, w×h) | Used in |
| --- | --- | --- | --- | --- |
| `vintage-le-creuset-collection-cook-collect.jpeg` | Group of contrasting vintage Le Creuset forms | `IMG_8834` | 0, 300, 1152×1200 | Hero / Open Graph / Collector's Guides index card |
| `le-creuset-raymond-loewy-coquelle-turquoise.jpeg` | Coquelle, Raymond Loewy for Le Creuset, turquoise enamel, from above | `IMG_8816(2)` | 35, 485, 1080×810 | Designer Le Creuset · archive record card |
| `le-creuset-enzo-mari-la-mama-brown.jpeg` | La Mama, Enzo Mari for Le Creuset, brown enamel with contrasting light side handles | `IMG_8840` | 0, 400, 1120×840 | Designer Le Creuset · archive record card |
| `le-creuset-jean-louis-barrault-futura.jpeg` | Futura, Jean-Louis Barrault for Le Creuset, brown/copper enamel, ribbed body | `a182b102-bed2-405f-896e-bb84135812c1` | 37, 575, 1080×810 | Designer Le Creuset · archive record card |
| `vintage-le-creuset-lid-handle-comparison-01.jpeg` | Round cocotte, pale yellow enamel, arched cast lid handle | `IMG_8845` | 0, 70, 1400×1050 | Recognising Vintage Le Creuset |
| `vintage-le-creuset-lid-handle-comparison-02.jpeg` | Round cocotte, orange enamel, black disc lid knob | `IMG_8848` | 48, 200, 1440×1080 | Recognising Vintage Le Creuset |

Originals are held outside the repository with the rest of the Cook & Collect
photography; only these web-delivery derivatives are committed, as in the other
guide asset folders.

## Framing notes

- Every object figure is **4:3**, so the three designer figures, the two
  comparison figures and the three archive-record cards share one ratio. The
  card CSS reserves `aspect-ratio: 4 / 3`, so `object-fit` has nothing to crop
  and no photograph is distorted.
- The hero is the one **upright** frame. The group spans the full width of the
  original, so cropping it to a landscape ratio would cut a silhouette or a
  handle out of the picture. It is published at its own ratio with
  `frame="full"`, and `.guide-figure-portrait` caps its displayed width so an
  upright hero does not run the full 1080px guide column.
- `IMG_8845` and `IMG_8848` are published as a construction comparison and are
  **not** presented as an earlier and a later generation: no documentary
  evidence establishes that relationship between these two objects, and colour
  is supporting evidence rather than a date.
- The fruit in `IMG_8840`, `IMG_8845` and `IMG_8848` is deliberately kept in
  frame.

## Attributions

The three designer identifications — Coquelle / Raymond Loewy, La Mama / Enzo
Mari, Futura / Jean-Louis Barrault — are confirmed by the owner of the
Cook & Collect archive. They identify the **design**. No production year is
attached to any of the photographed examples: captions, record lines and alt
text all state that the production date of the individual example is not
established.

## Supplied originals not published

| Original | Why it is not published |
| --- | --- |
| `IMG_8831` | Second group view of the same pieces as `IMG_8834`; it would repeat the hero's content without adding a form or a construction detail. |
| `IMG_8825` | Group view with vegetables; the hero plus the three designer figures plus the construction pair already carry the page's visual rhythm. |
| `IMG_8841` | Its identity is not independently confirmed, and the three confirmed designer photographs cover the same editorial role. |
| `IMG_8817(1)` | Alternate view of the Coquelle already published from `IMG_8816(2)`. |
| `IMG_8816(1)` | Not supplied in the source folder. |
