/*
 * build-guides.js — editorial collector guides (SEO landing pages).
 *
 * Kept separate from build.js on purpose: build.js owns the shop/app
 * (manifest + item grid + locale pages) and is already large. Guides are a
 * distinct, growing content area (target: ~10 guides), so they get their own
 * small, self-contained generator.
 *
 * How it scales — to add guide #3..#10:
 *   1. Append an entry to the GUIDES registry below (including its `card`
 *      listing metadata so it appears on the Collector's Guides index).
 *   2. Create its template in templates/guides/<file>.html (use {{guideHead}},
 *      {{nav}}, {{contactButtons}}, {{footer}}, {{BASE}}, {{curatedHref}},
 *      {{guidesHref}}), and <g-figure> for every illustration.
 *   3. Add its strings to i18n.js under a unique `strKey` prefix.
 * The <head> (canonical, hreflang, Open Graph, Twitter, Article +
 * BreadcrumbList JSON-LD), navigation and bilingual wiring are generated here.
 *
 * Shared guide components (used by every guide, no per-guide CSS or markup):
 *   <g-figure>            image + caption, with an automatic same-size
 *                         placeholder while a photograph is still missing
 *   .guide-split          figure beside prose
 *   .guide-figure-pair / .guide-figure-trio   figure groups
 *   .guide-spec           compact specification block (dl)
 *   .guide-note-box       collector's note
 *   .guide-references     Research & References list
 *
 * The Collector's Guides index (en/guides/index.html + fr/guides/index.html)
 * is generated from the same GUIDES registry — its card grid grows
 * automatically as guides are added, with no per-count layout to maintain.
 *
 * Output: one file per locale, same filename in each language folder
 * (language is implied by the folder), e.g.
 *   en/guides/index.html                               (English index)
 *   fr/guides/index.html                               (French index)
 *   en/guides/vintage-french-champagne-buckets.html    (English, canonical)
 *   fr/guides/vintage-french-champagne-buckets.html    (French)
 *
 * Run:  node build-guides.js   (or: npm run build:guides)
 */

const fs = require('fs');
const path = require('path');
const i18n = require('./i18n.js');

const TEMPLATES_DIR = path.join(__dirname, 'templates');
const SITE_URL = 'https://cookandcollect.eu';

/* ─── Guide registry ─── */
// Order here is the display order on the Collector's Guides index.
const GUIDES = [
  {
    // i18n key prefix. All of this guide's strings live in i18n.js as
    // `${strKey}...` (e.g. guideChampagneDocTitle, guideChampagneH1, …).
    strKey: 'guideChampagne',
    template: 'guides/vintage-french-champagne-buckets.html',
    // Same filename in every language folder; the folder encodes the language.
    file: 'vintage-french-champagne-buckets.html',
    // Hero / Open Graph image (site-root-relative). This is the same file used
    // as the page hero, so replacing the photo updates the social preview too.
    ogImage: 'img/guides/champagne-buckets/veuve-clicquot/1-full.jpeg',
    // Listing metadata for the Collector's Guides index card. `image` is the
    // card thumbnail (site-root-relative); the title/eyebrow/summary strings
    // live in i18n.js under `${strKey}Card…`.
    card: {image: 'img/guides/champagne-buckets/veuve-clicquot/1-full.jpeg'},
    // Manually managed publication dates (ISO 8601) for Article schema.
    // Bump `dateModified` whenever the guide's content is meaningfully revised.
    datePublished: '2026-09-17',
    dateModified: '2026-09-17'
  },
  {
    strKey: 'guideCopper',
    template: 'guides/vintage-french-copper-cookware.html',
    file: 'vintage-french-copper-cookware.html',
    ogImage: 'img/guides/copper-cookware/dehillerin-saute/1-full.jpeg',
    card: {image: 'img/guides/copper-cookware/dehillerin-saute/1-full.jpeg'},
    datePublished: '2026-09-19',
    dateModified: '2026-09-20'
  },
  {
    // Pillar / hub for a planned multi-page Le Creuset research cluster.
    // Future child guides should declare parent: 'guideLeCreuset'; do not add
    // them to the registry until their real pages exist.
    strKey: 'guideLeCreuset',
    template: 'guides/vintage-le-creuset.html',
    file: 'vintage-le-creuset.html',
    // Original Cook & Collect archive photograph still to be supplied. The
    // shared figure/index renderer emits a placeholder and omits og:image.
    ogImage: 'img/guides/le-creuset/archive-overview/1-full.jpeg',
    card: {image: 'img/guides/le-creuset/archive-overview/1-full.jpeg'},
    datePublished: '2026-09-22',
    dateModified: '2026-09-24'
  },
  {
    // First specialist child under the Le Creuset pillar. The parent field
    // drives the fourth visible/schema breadcrumb level.
    strKey: 'guideLeCreusetDating',
    parent: 'guideLeCreuset',
    template: 'guides/le-creuset-dating-guide.html',
    file: 'le-creuset-dating-guide.html',
    // Hero of the guide and identity photograph of Dating example No. 01.
    ogImage: 'img/guides/le-creuset/dating/early-le-creuset-round-cocotte-volcanique.jpeg',
    card: {image: 'img/guides/le-creuset/dating/early-le-creuset-round-cocotte-volcanique.jpeg'},
    datePublished: '2026-09-22',
    dateModified: '2026-09-24'
  },
  // ── Specialist guides under the copper pillar ──
  // Each one owns the detailed case study for its maker/supplier; the pillar
  // page introduces them and links out. Keep search intents distinct.
  {
    strKey: 'guideDehillerin',
    parent: 'guideCopper',
    template: 'guides/e-dehillerin-copper-cookware.html',
    file: 'e-dehillerin-copper-cookware.html',
    ogImage: 'img/guides/copper-cookware/dehillerin-saute/1-full.jpeg',
    card: {image: 'img/guides/copper-cookware/dehillerin-saute/1-full.jpeg'},
    datePublished: '2026-09-20',
    dateModified: '2026-09-20'
  },
  {
    strKey: 'guideMauviel',
    parent: 'guideCopper',
    template: 'guides/mauviel-vintage-copper-cookware.html',
    file: 'mauviel-vintage-copper-cookware.html',
    ogImage: 'img/guides/copper-cookware/mauviel-saute/1-full.jpeg',
    card: {image: 'img/guides/copper-cookware/mauviel-saute/1-full.jpeg'},
    datePublished: '2026-09-20',
    dateModified: '2026-09-20'
  },
  {
    strKey: 'guideLecellier',
    parent: 'guideCopper',
    template: 'guides/lecellier-cuivralec.html',
    file: 'lecellier-cuivralec.html',
    ogImage: 'img/guides/copper-cookware/lecellier-cuivralec/1-set.jpeg',
    card: {image: 'img/guides/copper-cookware/lecellier-cuivralec/1-set.jpeg'},
    datePublished: '2026-09-20',
    dateModified: '2026-09-20'
  }
];

/* ─── Locales ─── */
// English is the canonical language for guides and lives at /en/guides/.
const LOCALES = [
  {code: 'en', dir: 'en/guides', legalFile: 'legal-notice.html'},
  {code: 'fr', dir: 'fr/guides', legalFile: 'mentions-legales.html'}
];

/* ─── Shared partials (mirror build.js so guides look native) ─── */
const CONTACT_BUTTONS = `<!-- Floating Contact Buttons -->
  <div class="contact-buttons">
    <a href="https://wa.me/33627335434" target="_blank" rel="noopener noreferrer" class="contact-btn whatsapp" aria-label="{{ariaWhatsApp}}">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    </a>
    <a href="https://m.me/cookncollect" target="_blank" rel="noopener noreferrer" class="contact-btn messenger" aria-label="{{ariaMessenger}}">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.2l3.131 3.259L19.752 8.2l-6.561 6.763z"/></svg>
    </a>
  </div>`;

const FOOTER = `<footer>
    <p>&copy; 2026 Cook &amp; Collect</p>
    <p><a href="{{legalHref}}">{{legal}}</a></p>
  </footer>`;

// Guides sit at <locale>/guides/, one level below the locale root, so links
// to the locale root need "../". The lang switch keeps the same filename and
// only swaps the language folder.
function renderNav(rootPrefix, langSwitch) {
  return `<nav>
    <div class="nav-inner">
      <a href="${rootPrefix}index.html" class="logo">Cook &amp; Collect</a>
      <ul class="nav-links">
        <li><a href="${rootPrefix}index.html">{{navCollection}}</a></li>
        <li><a href="${rootPrefix}about.html">{{navAbout}}</a></li>
        <li><a href="${rootPrefix}shipping.html">{{navShipping}}</a></li>
        <li><a href="${rootPrefix}sold.html">{{navSold}}</a></li>
        ${langSwitch}
      </ul>
    </div>
  </nav>`;
}

function renderLangSwitch(currentCode, enHref, frHref) {
  const sel = code => (code === currentCode ? ' selected' : '');
  return `<li class="lang-switch">
          <select onchange="location.href=this.value" aria-label="{{ariaLanguage}}">
            <option value="${enHref}"${sel('en')}>EN</option>
            <option value="${frHref}"${sel('fr')}>FR</option>
          </select>
        </li>`;
}

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ─── <g-figure> — the shared guide figure component ───
 * Every guide illustration goes through this one component, so all guides get
 * the same image treatment, caption typography and — importantly — the same
 * behaviour when a photograph has not been supplied yet.
 *
 * Usage in a guide template (attribute values may contain {{i18n}} tokens,
 * which are substituted afterwards as usual):
 *
 *   <g-figure src="img/guides/<guide>/<object>/1-full.jpeg"
 *             alt="{{guideXAlt}}"
 *             caption="{{guideXCaption}}"></g-figure>
 *
 *   variant="split"  → renders as a .guide-split-figure (image beside prose)
 *   hero="true"      → eager loading / high priority (above-the-fold image)
 *   frame="full"     → the photograph keeps its own aspect ratio instead of the
 *                      shared fixed card height. Use it where the complete
 *                      object must stay in frame (hero, object comparisons) or
 *                      where a research record is shown deliberately small.
 *
 * If the file referenced by `src` exists, a normal <figure><img> is emitted.
 * If it does not exist yet, an identically sized placeholder block is emitted
 * instead (same frame, same height, same caption), describing the photograph
 * that is still needed. Dropping the real file in at that exact path is the
 * only step required later — no template or layout change.
 */
const pendingImages = new Set();

function imageExists(src) {
  return fs.existsSync(path.join(__dirname, src));
}

/* Intrinsic pixel size of a JPEG, read from its SOFn marker.
 * Only needed for frame="full" figures: those keep their own aspect ratio, so
 * without width/height the browser cannot reserve the box and the page shifts
 * while the photograph loads (the hero image is the LCP element). Figures using
 * the shared fixed card height do not need it — CSS already fixes their box.
 * Returns null for anything it cannot parse, and the attributes are simply
 * omitted. Deliberately dependency-free: the deploy workflow runs the build
 * scripts with plain node, without installing node_modules. */
function jpegSize(src) {
  let buf;
  try {
    buf = fs.readFileSync(path.join(__dirname, src));
  } catch {
    return null;
  }
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    // Standalone markers carry no payload.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) { i += 2; continue; }
    const length = buf.readUInt16BE(i + 2);
    // SOF0..SOF3, SOF5..SOF7, SOF9..SOF11, SOF13..SOF15 — all carry the size.
    const isSof = marker >= 0xc0 && marker <= 0xcf
      && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) {
      return {height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7)};
    }
    i += 2 + length;
  }
  return null;
}

function parseAttrs(raw) {
  const attrs = {};
  const re = /([\w-]+)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(raw)) !== null) attrs[m[1]] = m[2];
  return attrs;
}

function renderFigure(attrs, base) {
  const variant = attrs.variant || 'default';
  const baseClass = variant === 'split' ? 'guide-split-figure' : 'guide-figure';
  const figureClass = attrs.frame === 'full' ? `${baseClass} guide-figure-full` : baseClass;
  const caption = attrs.caption || '';
  const alt = attrs.alt || caption;
  const src = attrs.src || '';
  const captionHtml = caption ? `\n            <figcaption>${caption}</figcaption>` : '';

  if (src && imageExists(src)) {
    const loading = attrs.hero === 'true'
      ? ' loading="eager" fetchpriority="high"'
      : ' loading="lazy"';
    // See jpegSize(): only the aspect-ratio-preserving figures need the box
    // reserved in markup.
    const size = attrs.frame === 'full' ? jpegSize(src) : null;
    const sizeAttrs = size ? ` width="${size.width}" height="${size.height}"` : '';
    return `<figure class="${figureClass}">
            <img src="${base}${src}" alt="${alt}"${sizeAttrs}${loading} decoding="async">${captionHtml}
          </figure>`;
  }

  // Photograph still to come: same frame, same height, no broken image.
  // The description lives in the <figcaption> when there is one, so the frame
  // itself only carries the "photograph to come" label and does not repeat it.
  if (src) pendingImages.add(src);
  const placeholderText = caption
    ? ''
    : `\n              <span class="guide-figure-placeholder-text">${alt}</span>`;
  return `<figure class="${figureClass} guide-figure-pending">
            <div class="guide-figure-placeholder" role="img" aria-label="${alt}">
              <span class="guide-figure-placeholder-label">{{guidePhotoPending}}</span>${placeholderText}
            </div>${captionHtml}
          </figure>`;
}

// Replace every <g-figure …></g-figure> (or self-closing <g-figure … />).
// A bare "<g-figure>" with no attributes is left untouched: the templates
// mention the component by name in their documentation comments, and those
// mentions must not be rewritten into figures.
function renderFigures(html, base) {
  return html.replace(/<g-figure\b([^>]*?)\/?>(?:\s*<\/g-figure>)?/g, (m, rawAttrs) => {
    const attrs = parseAttrs(rawAttrs);
    return attrs.src ? renderFigure(attrs, base) : m;
  });
}

// Canonical + hreflang + Open Graph + Twitter + Article/BreadcrumbList JSON-LD.
// `s` is the locale's i18n strings; `k` is the guide's strKey prefix.
function renderGuideHead(guide, code, s, k) {
  const get = suffix => s[`${k}${suffix}`] || '';
  const enUrl = `${SITE_URL}/en/guides/${guide.file}`;
  const frUrl = `${SITE_URL}/fr/guides/${guide.file}`;
  const canonical = code === 'fr' ? frUrl : enUrl;
  // Only advertise a social image once the photograph actually exists: a guide
  // may be published while its object photography is still being shot, and a
  // 404 og:image is worse than none.
  const hasOgImage = Boolean(guide.ogImage) && imageExists(guide.ogImage);
  const ogImageUrl = hasOgImage ? `${SITE_URL}/${guide.ogImage}` : '';
  const desc = get('MetaDesc');
  const ogTitle = get('OgTitle') || get('DocTitle');
  const ogDesc = get('OgDesc') || desc;
  const ogLocale = code === 'fr' ? 'fr_FR' : 'en_GB';
  const homeUrl = code === 'fr' ? `${SITE_URL}/fr/` : `${SITE_URL}/en/`;

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: get('H1'),
    description: desc,
    ...(hasOgImage ? {image: [ogImageUrl]} : {}),
    inLanguage: code,
    author: {'@type': 'Organization', name: 'Cook & Collect'},
    publisher: {'@type': 'Organization', name: 'Cook & Collect'},
    mainEntityOfPage: {'@type': 'WebPage', '@id': canonical},
    ...(guide.datePublished ? {datePublished: guide.datePublished} : {}),
    ...(guide.dateModified ? {dateModified: guide.dateModified} : {}),
    isAccessibleForFree: true
  };
  // Breadcrumb mirrors the visible trail: Collection › Guides › [pillar] ›
  // this guide. A guide declares `parent: '<strKey>'` in the registry when it
  // sits under a pillar guide, and the extra level appears in both places.
  const parent = guide.parent ? GUIDES.find(g => g.strKey === guide.parent) : null;
  const trail = [
    {'@type': 'ListItem', position: 1, name: s.navCollection, item: homeUrl},
    {'@type': 'ListItem', position: 2, name: get('BreadcrumbGuides'), item: `${homeUrl}guides/`}
  ];
  if (parent) {
    trail.push({
      '@type': 'ListItem',
      position: 3,
      name: s[`${parent.strKey}BreadcrumbCurrent`] || s[`${parent.strKey}H1`] || '',
      item: `${homeUrl}guides/${parent.file}`
    });
  }
  trail.push({'@type': 'ListItem', position: trail.length + 1, name: get('BreadcrumbCurrent')});

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail
  };

  const imageMeta = hasOgImage
    ? `\n  <meta property="og:image" content="${ogImageUrl}">`
    : '';
  const twitterImageMeta = hasOgImage
    ? `\n  <meta name="twitter:image" content="${ogImageUrl}">`
    : '';

  return `  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="fr" href="${frUrl}">
  <link rel="alternate" hreflang="x-default" href="${enUrl}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Cook & Collect">
  <meta property="og:locale" content="${ogLocale}">
  <meta property="og:title" content="${escapeAttr(ogTitle)}">
  <meta property="og:description" content="${escapeAttr(ogDesc)}">
  <meta property="og:url" content="${canonical}">${imageMeta}
  <meta name="twitter:card" content="${hasOgImage ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${escapeAttr(ogTitle)}">
  <meta name="twitter:description" content="${escapeAttr(ogDesc)}">${twitterImageMeta}
  <script type="application/ld+json">${JSON.stringify(article)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>`;
}

function substitute(html, ctx) {
  return html.replace(/\{\{(\w+)\}\}/g, (m, key) => (key in ctx ? ctx[key] : m));
}

const tpl = name => fs.readFileSync(path.join(TEMPLATES_DIR, name), 'utf-8');

/* ─── Collector's Guides index (landing page) ───
 * Generated from the same GUIDES registry so the card grid grows on its own.
 * The card layout is a responsive CSS grid (.guide-index-grid, auto-fill) so
 * it degrades gracefully for 1, 2, 3, 4, 6+ guides with no per-count code. */
function renderGuideIndexHead(code, s) {
  const enUrl = `${SITE_URL}/en/guides/`;
  const frUrl = `${SITE_URL}/fr/guides/`;
  const canonical = code === 'fr' ? frUrl : enUrl;
  const ogLocale = code === 'fr' ? 'fr_FR' : 'en_GB';
  const homeUrl = code === 'fr' ? `${SITE_URL}/fr/` : `${SITE_URL}/en/`;
  const title = s.guidesIndexOgTitle || s.guidesIndexTitle;
  const desc = s.guidesIndexMetaDesc || '';

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {'@type': 'ListItem', position: 1, name: s.navCollection, item: homeUrl},
      {'@type': 'ListItem', position: 2, name: s.guidesIndexBreadcrumbCurrent}
    ]
  };
  // ItemList of the guides, in registry order, for richer indexing.
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: GUIDES.map((guide, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${homeUrl}guides/${guide.file}`,
      name: i18n[code][`${guide.strKey}CardTitle`] || i18n[code][`${guide.strKey}H1`] || ''
    }))
  };

  return `  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="fr" href="${frUrl}">
  <link rel="alternate" hreflang="x-default" href="${enUrl}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Cook & Collect">
  <meta property="og:locale" content="${ogLocale}">
  <meta property="og:title" content="${escapeAttr(title)}">
  <meta property="og:description" content="${escapeAttr(desc)}">
  <meta property="og:url" content="${canonical}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeAttr(title)}">
  <meta name="twitter:description" content="${escapeAttr(desc)}">
  <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
  <script type="application/ld+json">${JSON.stringify(itemList)}</script>`;
}

function renderGuideIndexCards(code, base) {
  const s = i18n[code];
  return GUIDES.map(guide => {
    const k = guide.strKey;
    const get = suffix => s[`${k}${suffix}`] || '';
    const eyebrow = get('CardEyebrow') || get('Eyebrow');
    const title = get('CardTitle') || get('H1');
    const summary = get('CardSummary') || get('MetaDesc');
    const alt = get('CardImageAlt') || title;
    const cta = s.guidesIndexCardCta || '';
    const img = (guide.card && guide.card.image) || guide.ogImage;
    // Same placeholder logic as <g-figure>: a guide can be listed before its
    // photography arrives without showing a broken thumbnail.
    let media;
    if (img && imageExists(img)) {
      media = `<figure class="guide-index-card-media">
              <img src="${base}${img}" alt="${escapeAttr(alt)}" loading="lazy" decoding="async">
            </figure>`;
    } else {
      if (img) pendingImages.add(img);
      media = `<figure class="guide-index-card-media guide-figure-pending">
              <div class="guide-figure-placeholder" role="img" aria-label="${escapeAttr(alt)}">
                <span class="guide-figure-placeholder-label">${s.guidePhotoPending || ''}</span>
                <span class="guide-figure-placeholder-text">${alt}</span>
              </div>
            </figure>`;
    }
    return `        <article class="guide-index-card">
          <a class="guide-index-card-link" href="${guide.file}">
            ${media}
            <div class="guide-index-card-body">
              <p class="guide-index-card-eyebrow">${eyebrow}</p>
              <h2 class="guide-index-card-title">${title}</h2>
              <p class="guide-index-card-summary">${summary}</p>
              <span class="guide-index-card-cta">${cta}</span>
            </div>
          </a>
        </article>`;
  }).join('\n');
}

function buildGuideIndex(locale) {
  const strings = i18n[locale.code];
  const base = '../../';
  const rootPrefix = '../';
  const enHref = '../../en/guides/index.html';
  const frHref = '../../fr/guides/index.html';
  const langSwitch = renderLangSwitch(locale.code, enHref, frHref);
  const template = tpl('guides/index.html');

  let html = template
    .replace('{{nav}}', renderNav(rootPrefix, langSwitch))
    .replace('{{contactButtons}}', CONTACT_BUTTONS)
    .replace('{{footer}}', FOOTER)
    .replace('{{guideIndexHead}}', renderGuideIndexHead(locale.code, strings))
    .replace('{{guideIndexCards}}', renderGuideIndexCards(locale.code, base));

  const ctx = {
    ...strings,
    LANG: locale.code,
    BASE: base,
    legalHref: `${rootPrefix}${locale.legalFile}`,
    curatedHref: `${rootPrefix}curated-selection.html`,
    aboutHref: `${rootPrefix}about.html`
  };
  html = substitute(html, ctx);

  const outDir = path.join(__dirname, locale.dir);
  fs.mkdirSync(outDir, {recursive: true});
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
}

/* ─── Generate ─── */
let generated = 0;
GUIDES.forEach(guide => {
  const template = tpl(guide.template);
  LOCALES.forEach(locale => {
    const strings = i18n[locale.code];
    // Same filename, different language folder.
    const enHref = `../../en/guides/${guide.file}`;
    const frHref = `../../fr/guides/${guide.file}`;
    const langSwitch = renderLangSwitch(locale.code, enHref, frHref);

    // Assets/root paths: guides are two folders deep (e.g. en/guides/), so
    // site-root assets resolve with "../../" and the locale root with "../".
    const base = '../../';
    const rootPrefix = '../';

    let html = template
      .replace('{{nav}}', renderNav(rootPrefix, langSwitch))
      .replace('{{contactButtons}}', CONTACT_BUTTONS)
      .replace('{{footer}}', FOOTER)
      .replace('{{guideHead}}', renderGuideHead(guide, locale.code, strings, guide.strKey));

    // Shared figure component — see renderFigure() above.
    html = renderFigures(html, base);

    const ctx = {
      ...strings,
      LANG: locale.code,
      BASE: base,
      legalHref: `${rootPrefix}${locale.legalFile}`,
      curatedHref: `${rootPrefix}curated-selection.html`,
      aboutHref: `${rootPrefix}about.html`,
      // The Collector's Guides index is a sibling file in the same folder.
      guidesHref: 'index.html',
      // Every guide is a sibling file too, so any guide can cross-link to any
      // other with {{<strKey>Href}} (e.g. {{guideChampagneHref}}). Generated
      // from the registry, so new guides are linkable with no code change.
      ...Object.fromEntries(GUIDES.map(g => [`${g.strKey}Href`, g.file]))
    };
    html = substitute(html, ctx);

    const outDir = path.join(__dirname, locale.dir);
    fs.mkdirSync(outDir, {recursive: true});
    fs.writeFileSync(path.join(outDir, guide.file), html);
    generated++;
  });
});

// Collector's Guides index, one per locale.
let indexes = 0;
LOCALES.forEach(locale => {
  buildGuideIndex(locale);
  indexes++;
});

console.log(`Generated ${generated} guide page(s) + ${indexes} index page(s) from ${GUIDES.length} guide(s) across ${LOCALES.length} locale(s).`);

// Any <g-figure src> (or index card image) whose file does not exist yet is
// rendered as a placeholder. Listing them here keeps the outstanding
// photography visible instead of silently shipping empty frames.
if (pendingImages.size) {
  console.log(`\n${pendingImages.size} image placeholder(s) awaiting original photography:`);
  [...pendingImages].sort().forEach(src => console.log(`  - ${src}`));
}
