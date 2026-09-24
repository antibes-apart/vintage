# Le Creuset dating guide photography — `img/guides/le-creuset/dating/`

Original Cook & Collect object photography only. No manufacturer, museum,
auction or marketplace images, no stock photography, no AI-generated object
images. In particular, **Le Creuset's own Archive Series photographs are cited
as a documentary reference in the text and are never reproduced here.**

All files are rendered through the `<g-figure>` component (`build-guides.js`):
while a file is missing the build emits a same-sized placeholder frame, and
dropping the real file in at the exact path below is the only step needed to
publish it. `npm run build` prints every path still missing.

## Dating example No. 01 — early round cocotte in Volcanique

Cook & Collect archive. Published files are framing-only derivatives of the
originals: rotated to upright, cropped to suit the guide's figure frames,
resized and recompressed. No colour, tone or content alteration.

| File | Subject | Source original | Used in |
| --- | --- | --- | --- |
| `early-le-creuset-round-cocotte-volcanique.jpeg` | Complete closed cocotte, three-quarter view (hero / Open Graph image, and the case-study identity photograph) | `IMG_9595` | Hero, Dating example No. 01 |
| `early-le-creuset-cocotte-overall-form.jpeg` | Overall form from above — body, both side handles, lid, integral lid handle | `IMG_9602` | 1. Start With the Shape |
| `early-le-creuset-cocotte-base.jpeg` | Complete underside | `IMG_9612` | 2. Examine the Base |
| `early-le-creuset-cocotte-base-marking.jpeg` | Detail of the impressed lozenge mark in the base field, with surface craquelure | `IMG_9612` (crop) | 2. Examine the Base · 3. Read the Markings |
| `early-le-creuset-cocotte-base-le-creuset-legend.jpeg` | Lower part of the base field, where the cast `LE CREUSET` legend curves along the foot | `IMG_9612` (lower crop) | 2. Examine the Base · 3. Read the Markings |
| `early-le-creuset-cocotte-handles.jpeg` | Side handle and integral circular lid handle | `IMG_9595` (crop) | 4. Handles and Lid Handle |
| `early-le-creuset-cocotte-lid-top.jpeg` | Lid exterior — stepped profile, enamel, integral cast handle | `IMG_9601` | 5. Study the Lid |
| `early-le-creuset-cocotte-lid-underside.jpeg` | Lid underside — rim construction, enamel, casting mark | `IMG_9605` | 5. Study the Lid |
| `early-le-creuset-cocotte-lid-marking.jpeg` | Detail of the impressed `D` beneath the lid | `IMG_9605` (crop) | 3. Read the Markings |
| `early-le-creuset-cocotte-interior.jpeg` | Grey enamel vessel interior | `IMG_9607` | 6. Colour and Enamel |
| `early-le-creuset-cocotte-diameter-measurement.jpeg` | Research record — tape across the rim | `IMG_9619` | Dating example No. 01 only |
| `early-le-creuset-cocotte-height-measurement.jpeg` | Research record — tape against the body height | `IMG_9620` | Dating example No. 01 only |

Originals of this set are held outside the repository with the rest of the
Cook & Collect photography; only web-delivery derivatives are committed, as in
the other guide asset folders.

`IMG_9618` (vessel inverted beside the lid) was shot for the same session and
remains an internal research photograph: it adds no feature that the published
files do not already document.

## Framing notes

Most guide figures are cropped by CSS to a fixed height (`--guide-card-h`) with
`object-fit: cover`, so the crops above are pre-framed to roughly the aspect
ratio of the frame they sit in:

- split figures (shape, base, handles, interior) ≈ 1:1;
- the mark details ≈ 2.4:1, so the mark survives the centre crop;
- the hero, the lid comparison and the measurement records use
  `frame="full"`, which keeps the photograph's own aspect ratio.

The measurement photographs are research records, not editorial photographs:
they are deliberately published smaller and only inside the case study.

## Why the base needs two figures

`IMG_9612` carries two unrelated marks at different radii, in opposite
orientations: the lozenge containing a letter near the centre of the base, and
the `LE CREUSET` legend in the outer field, curved along the foot and upside
down relative to the lozenge. The legend is in very low relief and in the same
enamel colour as its surroundings, so a crop framed on the centre of the base
loses it entirely — which is exactly what happened in the first pass of this
guide. The lower crop is therefore published as its own figure and must not be
merged back into `early-le-creuset-cocotte-base-marking.jpeg`.

Both crops are framing-only derivatives of `IMG_9612`: rotation, crop, resize
and recompression. No colour, tone, sharpening or content alteration is applied
to published files.
