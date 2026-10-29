/*
 * build-archive.js — archive of documented objects (SEO pages, not for sale).
 *
 * Kept separate from build.js (shop) and build-guides.js (editorial guides): it owns only
 * these outputs, which it deletes and regenerates on every run:
 *   en/archive/index.html, fr/archive/index.html    hub, objects grouped by brand
 *   en/archive/<slug>.html, fr/archive/<slug>.html  one page per object and language
 *   sitemap-archive.xml                             pages and their photos
 * and it adds (or removes) one "Sitemap:" line in robots.txt. All of them are gitignored:
 * they are built at deploy time from the source records.
 *
 * Source: archive/<slug>/info.json, one folder per object (contract: validateObject below).
 * Photos are not in the repository: each photo is a key on the image host
 * (https://images.cookandcollect.eu/<key>), with its pixel size stored in info.json.
 * An object whose `shop_item` names an existing shop item gets no archive page of its own:
 * the hub links to the shop page instead (one page per object).
 *
 * Runs after build.js, whose manifest.json supplies the shop items for the "Available now"
 * block. Dependency-free on purpose: the deploy workflow runs the build with plain node.
 *
 * Run:  node build-archive.js
 * Local preview with the sample records:
 *   ARCHIVE_DIR=tests/fixtures/archive ARCHIVE_IMAGE_BASE=/tests/fixtures/archive-images/ node build-archive.js
 */

const fs = require('fs');
const path = require('path');
const i18n = require('./i18n.js');

const SITE_URL = 'https://cookandcollect.eu';
const DEFAULT_IMAGE_BASE = 'https://images.cookandcollect.eu/';
const LANGS = [
  {code: 'en', legalFile: 'legal-notice.html', curated: 'curatedselection', ogLocale: 'en_GB'},
  {code: 'fr', legalFile: 'mentions-legales.html', curated: 'curated-selection.html', ogLocale: 'fr_FR'}
];

// Hub sections, in display order. An object's brand must be one of these ("other" when unknown).
const BRANDS = ['le-creuset', 'cousances', 'staub', 'copper', 'other'];
const BRAND_LABEL = {
  'le-creuset': 'archiveBrandLeCreuset', cousances: 'archiveBrandCousances', staub: 'archiveBrandStaub',
  copper: 'archiveBrandCopper', other: 'archiveBrandOther'
};
// Same list as CATEGORIES in build.js (shop categories, stored in English).
const CATEGORIES = [
  'Cocottes', 'Skillets & Pans', 'Saucepans & Casseroles', 'Baking & Serving Dishes', 'Terrines', 'Grill Pans',
  'Fondues', 'Tea Light Holders', 'Copper', 'Spare Parts', 'Ice Buckets', 'Other'
];
// Which shop items count as the same brand, for "Available now".
const SHOP_BRAND = {
  'le-creuset': item => /le\s*creuset/i.test(item.title || ''),
  cousances: item => /cousances/i.test(item.title || ''),
  staub: item => /staub/i.test(item.title || ''),
  copper: item => item.category === 'Copper' || /copper|cuivre/i.test(item.title || ''),
  other: () => false
};
// Existing guide per brand; brands without a guide get no guide link.
const BRAND_GUIDE = {
  'le-creuset': {file: 'vintage-le-creuset.html', label: 'guideLinkLeCreuset'},
  copper: {file: 'vintage-french-copper-cookware.html', label: 'guideLinkCopper'}
};
const MAX_RELATED = 4;

/* ─── Validation ─── */

class RecordError extends Error {}
const fail = (field, message) => { throw new RecordError(`${field}: ${message}`); };

function onlyKeys(value, field, allowed) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(field, 'must be an object');
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) fail(field || 'record', `unknown field "${key}"`);
  }
}
function text(value, field, max) {
  if (typeof value !== 'string' || !value.trim()) fail(field, 'must be a non-empty string');
  if (value.length > max) fail(field, `must be at most ${max} characters`);
}
function bilingual(value, field, max) {
  onlyKeys(value, field, ['en', 'fr']);
  text(value.en, `${field}.en`, max);
  text(value.fr, `${field}.fr`, max);
}
function list(value, field, min, max) {
  if (!Array.isArray(value)) fail(field, 'must be a list');
  if (value.length < min || value.length > max) fail(field, `must have ${min} to ${max} entries`);
}
function date(value, field) {
  const valid = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
  if (!valid) fail(field, 'must be a date written YYYY-MM-DD');
}
function size(value, field) {
  if (!Number.isInteger(value) || value < 1 || value > 10000) fail(field, 'must be a whole number of pixels');
}
function imageKey(value, field, slug) {
  const pattern = new RegExp(`^archive/${slug}/[a-z0-9][a-z0-9._-]*\\.(jpe?g|webp)$`);
  if (typeof value !== 'string' || !pattern.test(value)) fail(field, `must be a photo key under archive/${slug}/`);
}

/** Checks one record; `folder` is its folder name. Throws with the failing field named. */
function validateObject(object, folder) {
  onlyKeys(object, '', ['schema_version', 'slug', 'brand', 'category', 'date_published', 'date_modified',
    'shop_item', 'photos', 'markings', 'dimensions', 'archive_findings', 'en', 'fr']);
  if (object.schema_version !== '1') fail('schema_version', 'must be "1"');
  if (typeof object.slug !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(object.slug) || object.slug.length > 80) {
    fail('slug', 'must be lowercase letters, digits and hyphens');
  }
  if (object.slug !== folder) fail('slug', 'slug must match the folder name');
  if (!BRANDS.includes(object.brand)) fail('brand', `must be one of ${BRANDS.join(', ')}`);
  if (!CATEGORIES.includes(object.category)) fail('category', 'must be one of the shop categories');
  date(object.date_published, 'date_published');
  date(object.date_modified, 'date_modified');
  if (object.shop_item !== undefined && (typeof object.shop_item !== 'string' || !/^[a-z0-9-]{1,80}$/.test(object.shop_item))) {
    fail('shop_item', 'must be a shop item id');
  }
  list(object.photos, 'photos', 1, 12);
  object.photos.forEach((photo, i) => {
    const f = `photos[${i}]`;
    onlyKeys(photo, f, ['key', 'width', 'height', 'small', 'alt']);
    imageKey(photo.key, `${f}.key`, object.slug);
    size(photo.width, `${f}.width`);
    size(photo.height, `${f}.height`);
    if (photo.small !== undefined) {
      onlyKeys(photo.small, `${f}.small`, ['key', 'width', 'height']);
      imageKey(photo.small.key, `${f}.small.key`, object.slug);
      size(photo.small.width, `${f}.small.width`);
      size(photo.small.height, `${f}.small.height`);
    }
    bilingual(photo.alt, `${f}.alt`, 200);
  });
  list(object.markings, 'markings', 0, 20);
  object.markings.forEach((marking, i) => {
    onlyKeys(marking, `markings[${i}]`, ['text', 'where']);
    text(marking.text, `markings[${i}].text`, 120);
    bilingual(marking.where, `markings[${i}].where`, 60);
  });
  list(object.dimensions, 'dimensions', 0, 12);
  object.dimensions.forEach((dimension, i) => {
    onlyKeys(dimension, `dimensions[${i}]`, ['label', 'value']);
    bilingual(dimension.label, `dimensions[${i}].label`, 60);
    bilingual(dimension.value, `dimensions[${i}].value`, 60);
  });
  list(object.archive_findings, 'archive_findings', 0, 10);
  object.archive_findings.forEach((finding, i) => bilingual(finding, `archive_findings[${i}]`, 400));
  for (const lang of ['en', 'fr']) {
    onlyKeys(object[lang], lang, ['title', 'meta_description', 'intro', 'condition']);
    text(object[lang].title, `${lang}.title`, 110);
    text(object[lang].meta_description, `${lang}.meta_description`, 170);
    list(object[lang].intro, `${lang}.intro`, 1, 4);
    object[lang].intro.forEach((paragraph, i) => text(paragraph, `${lang}.intro[${i}]`, 800));
    text(object[lang].condition, `${lang}.condition`, 400);
  }
  return object;
}

function loadObjects(sourceDir) {
  if (!fs.existsSync(sourceDir)) return [];
  return fs.readdirSync(sourceDir, {withFileTypes: true})
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort()
    .map(folder => {
      const file = path.join(sourceDir, folder, 'info.json');
      const label = `${path.basename(sourceDir)}/${folder}/info.json`;
      try {
        return validateObject(JSON.parse(fs.readFileSync(file, 'utf8')), folder);
      } catch (error) {
        throw new Error(`${label}: ${error.message}`);
      }
    });
}

/* ─── Rendering helpers ─── */

// Data from info.json is escaped, including braces, so it can never be read as a {{template}} token.
function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
}
// JSON-LD inside <script>: "<" is written as \u003c so no text can close the script element.
const jsonLd = value => `<script type="application/ld+json">${JSON.stringify(value).replace(/</g, '\\u003c')}</script>`;
// Static partials use i18n tokens; they are resolved here, before any data is inserted.
const fill = (html, strings) => html.replace(/\{\{(\w+)\}\}/g, (match, key) => (key in strings ? strings[key] : match));

function jpegSize(absPath) {
  let buf;
  try { buf = fs.readFileSync(absPath); } catch { return null; }
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) { i += 2; continue; }
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return {height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7)};
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

const CONTACT_BUTTONS = `<!-- Floating Contact Buttons -->
  <div class="contact-buttons">
    <a href="https://wa.me/33627335434" target="_blank" rel="noopener noreferrer" class="contact-btn whatsapp" aria-label="{{ariaWhatsApp}}">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    </a>
    <a href="https://m.me/cookncollect" target="_blank" rel="noopener noreferrer" class="contact-btn messenger" aria-label="{{ariaMessenger}}">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.2l3.131 3.259L19.752 8.2l-6.561 6.763z"/></svg>
    </a>
  </div>`;

// Archive pages sit at <lang>/archive/: the language root is "../", the site root "../../".
function chrome(lang, strings, enHref, frHref) {
  const sel = code => (code === lang.code ? ' selected' : '');
  const nav = `<nav>
    <div class="nav-inner">
      <a href="../index.html" class="logo">Cook &amp; Collect</a>
      <ul class="nav-links">
        <li><a href="../index.html">{{navCollection}}</a></li>
        <li><a href="../${lang.curated}" class="nav-highlight"><span class="nav-star" aria-hidden="true">★</span>{{navOurSelection}}</a></li>
        <li><a href="../guides/index.html">{{navGuides}}</a></li>
        <li><a href="../about.html">{{navAbout}}</a></li>
        <li><a href="../shipping.html">{{navShipping}}</a></li>
        <li><a href="../sold.html">{{navSold}}</a></li>
        <li class="lang-switch">
          <select onchange="location.href=this.value" aria-label="{{ariaLanguage}}">
            <option value="${enHref}"${sel('en')}>EN</option>
            <option value="${frHref}"${sel('fr')}>FR</option>
          </select>
        </li>
      </ul>
    </div>
  </nav>`;
  const footer = `<footer>
    <p>&copy; 2026 Cook &amp; Collect</p>
    <p><a href="../${lang.legalFile}">{{legal}}</a></p>
  </footer>`;
  return {nav: fill(nav, strings), footer: fill(footer, strings), contact: fill(CONTACT_BUTTONS, strings)};
}

function head({lang, title, description, canonical, enUrl, frUrl, image, data}) {
  return `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${esc(description)}">
  <title>${esc(title)}</title>
  <link rel="icon" href="../../favicon.svg" type="image/svg+xml">
  <link rel="icon" href="../../favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="../../apple-touch-icon.png">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="fr" href="${frUrl}">
  <link rel="alternate" hreflang="x-default" href="${enUrl}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Cook &amp; Collect">
  <meta property="og:locale" content="${lang.ogLocale}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">${image ? `\n  <meta property="og:image" content="${esc(image)}">` : ''}
  <link rel="stylesheet" href="../../css/style.css?v=18">
  ${data.map(jsonLd).join('\n  ')}
</head>`;
}

/* ─── Shop items ─── */

function shopHref(item, langCode) {
  return langCode === 'en'
    ? `../collection/${encodeURIComponent(item.id)}.html`
    : `../item.html?id=${encodeURIComponent(item.id)}`;
}

function shopCard(item, langCode) {
  const dims = item.cover ? jpegSize(path.join(__dirname, item.cover)) : null;
  const dimAttrs = dims ? ` width="${dims.width}" height="${dims.height}"` : '';
  return `
        <a href="${shopHref(item, langCode)}" class="item-card">
          <div class="image-wrapper">
            ${item.cover
              ? `<img src="../../${esc(item.cover)}" alt="${esc(item.title)}"${dimAttrs} loading="lazy">`
              : `<div class="no-cover">${esc(item.title)}</div>`}
          </div>
          <div class="card-body">
            <h3 class="card-title">${esc(item.title)}</h3>
          </div>
        </a>`;
}

// Up to four shop items for sale: same brand first, then the same kind of object, else the first ones.
function availableFor(object, forSale) {
  const sameBrand = forSale.filter(SHOP_BRAND[object.brand]);
  const sameCategory = forSale.filter(item => item.category === object.category && !sameBrand.includes(item));
  const picked = [...sameBrand, ...sameCategory];
  return (picked.length ? picked : forSale).slice(0, MAX_RELATED);
}

/* ─── Pages ─── */

const photoUrl = (imageBase, key) => `${imageBase}${key}`;

function gallery(object, langCode, imageBase) {
  const photos = object.photos;
  const main = photos[0];
  const thumbs = photos.length > 1 ? photos.map((photo, i) => {
    const shown = photo.small || photo;
    return `<img src="${esc(photoUrl(imageBase, shown.key))}" data-full="${esc(photoUrl(imageBase, photo.key))}" alt="${esc(photo.alt[langCode])}" width="${shown.width}" height="${shown.height}" class="${i === 0 ? 'active' : ''}" onclick="switchImage(${i})" loading="lazy">`;
  }).join('') : '';
  return `
      <div class="gallery">
        <img src="${esc(photoUrl(imageBase, main.key))}" alt="${esc(main.alt[langCode])}" class="main-image" id="mainImage" width="${main.width}" height="${main.height}" onclick="openLightbox(window._currentImageIndex || 0)">
        ${thumbs ? `<div class="thumbnails">${thumbs}</div>` : ''}
      </div>`;
}

function archiveCard(object, langCode, imageBase, href) {
  const photo = object.photos[0];
  const shown = photo.small || photo;
  return `
        <a href="${href}" class="item-card">
          <div class="image-wrapper">
            <img src="${esc(photoUrl(imageBase, shown.key))}" alt="${esc(photo.alt[langCode])}" width="${shown.width}" height="${shown.height}" loading="lazy">
          </div>
          <div class="card-body">
            <h3 class="card-title">${esc(object[langCode].title)}</h3>
          </div>
        </a>`;
}

function objectPage(object, lang, ctx) {
  const s = i18n[lang.code];
  const t = object[lang.code];
  const enUrl = `${SITE_URL}/en/archive/${object.slug}.html`;
  const frUrl = `${SITE_URL}/fr/archive/${object.slug}.html`;
  const canonical = lang.code === 'en' ? enUrl : frUrl;
  const hubUrl = `${SITE_URL}/${lang.code}/archive/`;
  const parts = chrome(lang, s, `../../en/archive/${object.slug}.html`, `../../fr/archive/${object.slug}.html`);
  const images = object.photos.map(photo => ({
    '@type': 'ImageObject', url: photoUrl(ctx.imageBase, photo.key), width: photo.width, height: photo.height,
    caption: photo.alt[lang.code]
  }));
  const article = {
    '@context': 'https://schema.org', '@type': 'Article', headline: t.title, description: t.meta_description,
    image: images, inLanguage: lang.code, datePublished: object.date_published, dateModified: object.date_modified,
    author: {'@type': 'Organization', name: 'Cook & Collect'},
    publisher: {'@type': 'Organization', name: 'Cook & Collect'},
    mainEntityOfPage: {'@type': 'WebPage', '@id': canonical}, isAccessibleForFree: true
  };
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      {'@type': 'ListItem', position: 1, name: s.navCollection, item: `${SITE_URL}/${lang.code}/`},
      {'@type': 'ListItem', position: 2, name: s.archiveBreadcrumb, item: hubUrl},
      {'@type': 'ListItem', position: 3, name: t.title}
    ]
  };

  const markings = object.markings.length ? `
        <table class="archive-table">
          <thead><tr><th scope="col">${s.archiveMarking}</th><th scope="col">${s.archiveMarkingWhere}</th></tr></thead>
          <tbody>${object.markings.map(m => `
            <tr><td class="archive-marking">${esc(m.text)}</td><td>${esc(m.where[lang.code])}</td></tr>`).join('')}
          </tbody>
        </table>` : '';
  const findings = object.archive_findings.length ? `
        <h3>${s.archiveFindingsTitle}</h3>
        <ul class="archive-findings">${object.archive_findings.map(f => `
          <li>${esc(f[lang.code])}</li>`).join('')}
        </ul>` : '';
  const identification = markings || findings ? `
      <section class="archive-section">
        <h2>${s.archiveIdentificationTitle}</h2>${markings}${findings}
      </section>` : '';
  const dimensions = object.dimensions.length ? `
      <section class="archive-section">
        <h2>${s.archiveDimensionsTitle}</h2>
        <table class="archive-table">
          <tbody>${object.dimensions.map(d => `
            <tr>
              <th scope="row">${esc(d.label[lang.code])}</th>
              <td>${esc(d.value[lang.code])}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </section>` : '';
  const guide = BRAND_GUIDE[object.brand];
  const guideLink = guide ? `
        <p class="archive-guide-link">${s.archiveRelatedGuide} <a href="../guides/${guide.file}">${s[guide.label]}</a></p>` : '';
  const similar = ctx.similarFor(object);
  const similarBlock = similar.length ? `
    <section class="archive-similar" aria-labelledby="archive-similar-title">
      <h2 id="archive-similar-title">${s.archiveSimilarTitle}</h2>
      <div class="items-grid archive-grid">${similar.map(o => archiveCard(o, lang.code, ctx.imageBase, `${o.slug}.html`)).join('')}
      </div>
    </section>` : '';
  const available = availableFor(object, ctx.forSale);
  const availableBlock = available.length ? `
    <section class="archive-available" aria-labelledby="archive-available-title">
      <h2 id="archive-available-title">${s.archiveAvailableTitle}</h2>
      <div class="items-grid archive-grid">${available.map(item => shopCard(item, lang.code)).join('')}
      </div>
      <p class="archive-available-all"><a href="../index.html">${s.archiveAvailableAll}</a></p>
    </section>` : '';

  return `<!DOCTYPE html>
<html lang="${lang.code}">
${head({lang, title: `${t.title} | Cook & Collect`, description: t.meta_description, canonical, enUrl, frUrl,
    image: photoUrl(ctx.imageBase, object.photos[0].key), data: [article, breadcrumb]})}
<body data-page="collection-item">
  ${parts.nav}
  <main class="archive-page">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><a href="../index.html">${s.navCollection}</a></li>
        <li><a href="index.html">${s.archiveBreadcrumb}</a></li>
        <li aria-current="page">${esc(t.title)}</li>
      </ol>
    </nav>
    <a href="index.html" class="back-link">← ${s.archiveBackHub}</a>
    <div class="item-layout">
      ${gallery(object, lang.code, ctx.imageBase)}
      <div class="item-info">
        <p class="archive-eyebrow">${s.archiveEyebrow}</p>
        <h1 class="item-title">${esc(t.title)}</h1>
        ${t.intro.map(p => `<p class="archive-intro">${esc(p)}</p>`).join('\n        ')}
        <p class="archive-not-for-sale">${s.archiveNotForSale}</p>${guideLink}
      </div>
    </div>${identification}${dimensions}
    <section class="archive-section">
      <h2>${s.archiveConditionTitle}</h2>
      <p>${esc(t.condition)}</p>
    </section>${availableBlock}${similarBlock}
  </main>
  ${ctx.lightbox}
  ${parts.contact}
  ${parts.footer}
  <script src="../../js/app.js?v=3"></script>
</body>
</html>
`;
}

function hubPage(lang, ctx) {
  const s = i18n[lang.code];
  const enUrl = `${SITE_URL}/en/archive/`;
  const frUrl = `${SITE_URL}/fr/archive/`;
  const canonical = lang.code === 'en' ? enUrl : frUrl;
  const parts = chrome(lang, s, '../../en/archive/index.html', '../../fr/archive/index.html');
  const hrefFor = object => (ctx.linked.has(object.slug)
    ? shopHref(ctx.linked.get(object.slug), lang.code)
    : `${object.slug}.html`);
  const groups = BRANDS.map(brand => ({brand, objects: ctx.objects.filter(o => o.brand === brand)}))
    .filter(group => group.objects.length);
  const collection = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: s.archiveHubTitle,
    description: s.archiveHubMetaDesc, url: canonical, inLanguage: lang.code,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: ctx.objects.filter(o => !ctx.linked.has(o.slug)).map((o, i) => ({
        '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/${lang.code}/archive/${o.slug}.html`, name: o[lang.code].title
      }))
    }
  };
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      {'@type': 'ListItem', position: 1, name: s.navCollection, item: `${SITE_URL}/${lang.code}/`},
      {'@type': 'ListItem', position: 2, name: s.archiveBreadcrumb}
    ]
  };
  const firstImage = ctx.objects[0] ? photoUrl(ctx.imageBase, ctx.objects[0].photos[0].key) : '';

  return `<!DOCTYPE html>
<html lang="${lang.code}">
${head({lang, title: s.archiveHubDocTitle, description: s.archiveHubMetaDesc, canonical, enUrl, frUrl,
    image: firstImage, data: [collection, breadcrumb]})}
<body data-page="archive-hub">
  ${parts.nav}
  <main class="archive-page">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><a href="../index.html">${s.navCollection}</a></li>
        <li aria-current="page">${s.archiveBreadcrumb}</li>
      </ol>
    </nav>
    <h1 class="page-title">${s.archiveHubTitle}</h1>
    <p class="archive-hub-intro">${s.archiveHubIntro}</p>
    <p class="archive-hub-banner">${s.archiveHubBanner} <a href="../index.html">${s.archiveHubBannerLink}</a></p>
    <ul class="archive-group-links">${groups.map(g => `
      <li><a href="#${g.brand}">${s[BRAND_LABEL[g.brand]]}</a></li>`).join('')}
    </ul>${groups.map(g => `
    <section class="archive-group" id="${g.brand}" aria-labelledby="archive-group-${g.brand}">
      <h2 id="archive-group-${g.brand}">${s[BRAND_LABEL[g.brand]]}</h2>
      <div class="items-grid archive-grid">${g.objects.map(o => archiveCard(o, lang.code, ctx.imageBase, hrefFor(o))).join('')}
      </div>
    </section>`).join('')}
  </main>
  ${parts.contact}
  ${parts.footer}
</body>
</html>
`;
}

function sitemap(objects, imageBase) {
  const latest = objects.map(o => o.date_modified).sort().pop();
  const url = (loc, lastmod, images = []) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>${images.map(src => `
    <image:image><image:loc>${esc(src)}</image:loc></image:image>`).join('')}
  </url>`;
  const entries = [
    ...LANGS.map(lang => url(`${SITE_URL}/${lang.code}/archive/`, latest)),
    ...objects.flatMap(o => LANGS.map(lang => url(`${SITE_URL}/${lang.code}/archive/${o.slug}.html`, o.date_modified,
      o.photos.map(photo => photoUrl(imageBase, photo.key)))))
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.join('\n')}
</urlset>
`;
}

function updateRobots(outRoot, publish) {
  const file = path.join(outRoot, 'robots.txt');
  if (!fs.existsSync(file)) return;
  const line = `Sitemap: ${SITE_URL}/sitemap-archive.xml`;
  const kept = fs.readFileSync(file, 'utf8').split('\n').filter(l => l.trim() !== line);
  while (kept.length && kept[kept.length - 1] === '') kept.pop();
  if (publish) kept.push(line);
  fs.writeFileSync(file, `${kept.join('\n')}\n`);
}

/* ─── Build ─── */

/**
 * Builds the archive from `sourceDir` into `outRoot`. Everything this generator owns is removed first,
 * so a deleted record also loses its pages. Returns the number of object pages per language.
 */
function buildArchive({sourceDir, outRoot, manifest, imageBase = DEFAULT_IMAGE_BASE}) {
  if (!/^(https:\/\/[^/\s]+\/|\/)([^\s]*\/)?$/.test(imageBase)) {
    throw new Error('imageBase must be an https:// address or a path starting with "/", ending with "/"');
  }
  const all = loadObjects(sourceDir);
  const shopItems = new Map((manifest.items || []).map(item => [item.id, item]));
  const linked = new Map();
  for (const object of all) {
    if (!object.shop_item) continue;
    const item = shopItems.get(object.shop_item);
    if (item) linked.set(object.slug, item);
    else console.warn(`archive/${object.slug}: shop item "${object.shop_item}" not found; it gets its own archive page.`);
  }
  const withPage = all.filter(object => !linked.has(object.slug));

  for (const lang of LANGS) fs.rmSync(path.join(outRoot, lang.code, 'archive'), {recursive: true, force: true});
  fs.rmSync(path.join(outRoot, 'sitemap-archive.xml'), {force: true});
  if (!all.length) {
    updateRobots(outRoot, false);
    return {pages: 0, objects: 0, linked: 0};
  }

  const forSale = (manifest.items || []).filter(item => !item.sold && !item.hidden);
  const similarFor = object => {
    const others = withPage.filter(o => o.slug !== object.slug);
    const sameBrand = others.filter(o => o.brand === object.brand);
    const sameCategory = others.filter(o => o.category === object.category && !sameBrand.includes(o));
    return [...sameBrand, ...sameCategory].slice(0, MAX_RELATED);
  };
  const ctx = {
    objects: all, linked, forSale, imageBase, similarFor,
    lightbox: fs.readFileSync(path.join(__dirname, 'templates', 'lightbox.html'), 'utf8')
  };

  for (const lang of LANGS) {
    const dir = path.join(outRoot, lang.code, 'archive');
    fs.mkdirSync(dir, {recursive: true});
    const langCtx = {...ctx, lightbox: fill(ctx.lightbox, i18n[lang.code])};
    fs.writeFileSync(path.join(dir, 'index.html'), hubPage(lang, langCtx));
    for (const object of withPage) fs.writeFileSync(path.join(dir, `${object.slug}.html`), objectPage(object, lang, langCtx));
  }
  fs.writeFileSync(path.join(outRoot, 'sitemap-archive.xml'), sitemap(withPage, imageBase));
  updateRobots(outRoot, true);
  return {pages: withPage.length, objects: all.length, linked: linked.size};
}

module.exports = {buildArchive, validateObject, BRANDS, CATEGORIES};

if (require.main === module) {
  const manifestFile = path.join(__dirname, 'manifest.json');
  if (!fs.existsSync(manifestFile)) {
    console.error('manifest.json not found: run node build.js first.');
    process.exit(1);
  }
  try {
    const result = buildArchive({
      sourceDir: path.resolve(__dirname, process.env.ARCHIVE_DIR || 'archive'),
      outRoot: __dirname,
      manifest: JSON.parse(fs.readFileSync(manifestFile, 'utf8')),
      imageBase: process.env.ARCHIVE_IMAGE_BASE || DEFAULT_IMAGE_BASE
    });
    console.log(`Archive: ${result.pages} object page(s) per language from ${result.objects} record(s)` +
      (result.linked ? `, ${result.linked} linked to the shop instead.` : '.'));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
