const fs = require('fs');
const path = require('path');
const i18n = require('./i18n.js');

const ITEMS_DIR = path.join(__dirname, 'items');
const SELECTION_DIR = path.join(__dirname, 'selection');
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const OUTPUT = path.join(__dirname, 'manifest.json');
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.bmp', '.svg']);
const FEATURED_ITEM_ORDER = [
  'rare-vintage-le-creuset-white-enamel-cast-iron-coc',
  'vintage-le-creuset-cast-iron-cocotte-rare-floral-d'
];

// Temporary allowlist for the Préfecture (reseller registration): when non-empty, only
// these item ids are published. Set back to [] to show the full collection again.
const VISIBLE_ONLY = [];

const VISIBLE_ONLY_SET = new Set(VISIBLE_ONLY);
const NO_FEATURED_INDEX = 999999;
const NO_COCOTTE_RANK = 999999;

const FEATURED_ITEM_INDEX = new Map(
  FEATURED_ITEM_ORDER.map((id, index) => [id, index])
);

const CATEGORIES = [
  'Cocottes',
  'Skillets & Pans',
  'Saucepans & Casseroles',
  'Baking & Serving Dishes',
  'Terrines',
  'Grill Pans',
  'Fondues',
  'Tea Light Holders',
  'Copper',
  'Spare Parts',
  'Ice Buckets',
  'Other'
];

const CATEGORY_SET = new Set(CATEGORIES);

function detectCategory(item) {
  const haystack = `${item.id} ${item.title}`.toLowerCase();

  if (/fondue/.test(haystack)) return 'Fondues';
  if (/ice\s*bucket|champagne\s*cooler/.test(haystack)) return 'Ice Buckets';
  if (/copper|cuivre/.test(haystack)) return 'Copper';
  if (/grill\s*pan/.test(haystack)) return 'Grill Pans';
  if (/tea\s*light|tealight|food\s*warmer|plate\s*warmer/.test(haystack)) return 'Tea Light Holders';
  if (/cocotte|dutch\s*oven|casserole|doufeu|coquelle/.test(haystack)) return 'Cocottes';
  if (/saucepan|poêlon|poelon/.test(haystack)) return 'Saucepans & Casseroles';
  if (/skillet|frying\s*pan|crêpière|crepiere|crepe\s*pan|sauté\s*pan|saute\s*pan|crêpe\s*pan/.test(haystack)) return 'Skillets & Pans';
  if (/terrine/.test(haystack)) return 'Terrines';
  if (/baking\s*dish|gratin|baker|oven\s*dish|rectangular\s*dish|fish\s*baking|plates|plate\b|dish\b/.test(haystack)) return 'Baking & Serving Dishes';
  if (/\bpan\b/.test(haystack)) return 'Skillets & Pans';

  return 'Other';
}

function parseSortPriority(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return NO_FEATURED_INDEX;
}

function compareNumbers(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function isLeCreuset(item) {
  const haystack = `${item.id} ${item.title}`.toLowerCase();
  return haystack.includes('le-creuset') || /\ble\s*creuset\b/.test(haystack);
}

function isCocotte(item) {
  const haystack = `${item.id} ${item.title}`.toLowerCase();
  return haystack.includes('cocotte');
}

function isMiniCocotte(item) {
  const slug = String(item.id || '').toLowerCase();
  const hasMini = /(^|[-_])mini($|[-_])/.test(slug);
  const hasCocotte = slug.includes('cocotte');
  return hasMini && hasCocotte;
}

function getBucket(item) {
  const featuredIndex = FEATURED_ITEM_INDEX.get(item.id);
  if (featuredIndex !== undefined) {
    return {group: 0, featuredIndex, cocotteRank: NO_COCOTTE_RANK};
  }

  const leCreuset = isLeCreuset(item);
  const cocotte = isCocotte(item);
  const cocotteRank = cocotte ? (isMiniCocotte(item) ? 1 : 0) : NO_COCOTTE_RANK;

  if (leCreuset && cocotte) return {group: 1, featuredIndex: NO_FEATURED_INDEX, cocotteRank};
  if (cocotte) return {group: 2, featuredIndex: NO_FEATURED_INDEX, cocotteRank};
  if (leCreuset) return {group: 3, featuredIndex: NO_FEATURED_INDEX, cocotteRank};
  return {group: 4, featuredIndex: NO_FEATURED_INDEX, cocotteRank};
}

function scanItems() {
  if (!fs.existsSync(ITEMS_DIR)) {
    console.log('No items/ directory found. Creating empty manifest.');
    return [];
  }

  const folders = fs.readdirSync(ITEMS_DIR, {withFileTypes: true})
    .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'));

  return folders.map(folder => {
    const folderPath = path.join(ITEMS_DIR, folder.name);
    const infoPath = path.join(folderPath, 'info.json');

    let info = {};
    if (fs.existsSync(infoPath)) {
      try {
        info = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
      } catch (e) {
        console.warn(`Warning: Invalid info.json in ${folder.name}, using defaults.`);
      }
    }

    // `hidden: true` keeps the folder but unpublishes the item (e.g. moved to the curated selection).
    if (info.hidden === true) return null;

    const files = fs.readdirSync(folderPath);
    const images = files.filter(f => IMAGE_EXT.has(path.extname(f).toLowerCase()));

    // Find cover image (cover.jpg, cover.png, etc.)
    const cover = images.find(f => path.parse(f).name.toLowerCase() === 'cover');
    const otherImages = images.filter(f => f !== cover).sort();

    // Build ordered image list: cover first, then rest sorted
    const allImages = [
      ...(cover ? [`items/${folder.name}/${cover}`] : []),
      ...otherImages.map(f => `items/${folder.name}/${f}`)
    ];

    const baseItem = {
      id: folder.name,
      title: info.title || folder.name,
      price: info.price || '',
      description: info.description || '',
      sold: info.sold === true
    };

    const manualCategory = typeof info.category === 'string' && CATEGORY_SET.has(info.category)
      ? info.category
      : null;

    return {
      ...baseItem,
      category: manualCategory || detectCategory(baseItem),
      sortPriority: parseSortPriority(info.sortPriority),
      sortBucket: getBucket({id: folder.name, title: info.title || folder.name}),
      cover: cover ? `items/${folder.name}/${cover}` : (allImages[0] || null),
      images: allImages
    };
  })
  .filter(Boolean)
  .sort((a, b) => {
    const groupDiff = compareNumbers(a.sortBucket.group, b.sortBucket.group);
    if (groupDiff !== 0) return groupDiff;

    const featuredDiff = compareNumbers(a.sortBucket.featuredIndex, b.sortBucket.featuredIndex);
    if (featuredDiff !== 0) return featuredDiff;

    const cocotteRankDiff = compareNumbers(a.sortBucket.cocotteRank, b.sortBucket.cocotteRank);
    if (cocotteRankDiff !== 0) return cocotteRankDiff;

    const priorityDiff = compareNumbers(a.sortPriority, b.sortPriority);
    if (priorityDiff !== 0) return priorityDiff;

    return a.title.localeCompare(b.title);
  })
  .map(({sortPriority, sortBucket, ...item}) => item);
}

/* ─── Curated Selection (premium dealer portfolio) ───
   Read from selection/<slug>/ and kept in a SEPARATE manifest array.
   These objects never carry a price and never mix with the shop `items`. */

// Order here is the display order of the category groups on the page.
const SELECTION_CATEGORIES = [
  'French Copperware',
  'Rare Cast Iron',
  'Champagne & Wine Objects',
  'French Design & Decorative Objects'
];
const SELECTION_CATEGORY_SET = new Set(SELECTION_CATEGORIES);

// Fields copied verbatim from info.json into the selection manifest (no price).
const SELECTION_STRING_FIELDS = [
  'maker', 'designer', 'origin', 'period', 'materials',
  'dimensions', 'marks', 'description', 'condition', 'status'
];

// Validates an info.json `imageAlts` map ({ "cover.jpg": "…" }), keeping only
// non-empty string values. Returns undefined if there is nothing usable.
function parseImageAlts(raw) {
  if (!raw || typeof raw !== 'object') return undefined;
  const alts = {};
  Object.entries(raw).forEach(([file, text]) => {
    if (typeof text === 'string' && text.trim() !== '') alts[file] = text.trim();
  });
  return Object.keys(alts).length ? alts : undefined;
}

function scanSelection() {
  if (!fs.existsSync(SELECTION_DIR)) return [];

  const folders = fs.readdirSync(SELECTION_DIR, {withFileTypes: true})
    .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'));

  return folders.map(folder => {
    const folderPath = path.join(SELECTION_DIR, folder.name);
    const infoPath = path.join(folderPath, 'info.json');

    let info = {};
    if (fs.existsSync(infoPath)) {
      try {
        info = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
      } catch (e) {
        console.warn(`Warning: Invalid info.json in selection/${folder.name}, using defaults.`);
      }
    }

    const files = fs.readdirSync(folderPath);
    const images = files.filter(f => IMAGE_EXT.has(path.extname(f).toLowerCase()));
    const cover = images.find(f => path.parse(f).name.toLowerCase() === 'cover');
    const otherImages = images.filter(f => f !== cover).sort();
    const allImages = [
      ...(cover ? [`selection/${folder.name}/${cover}`] : []),
      ...otherImages.map(f => `selection/${folder.name}/${f}`)
    ];

    const entry = {
      id: folder.name,
      title: info.title || folder.name,
      cover: cover ? `selection/${folder.name}/${cover}` : (allImages[0] || null),
      images: allImages
    };

    if (typeof info.category === 'string' && SELECTION_CATEGORY_SET.has(info.category)) {
      entry.category = info.category;
    }

    // Copy only known, non-empty string fields (unknown info is simply not shown).
    SELECTION_STRING_FIELDS.forEach(field => {
      const value = info[field];
      if (typeof value === 'string' && value.trim() !== '') {
        entry[field] = value;
      }
    });

    // Optional per-image ALT text: info.imageAlts = { "cover.jpg": "…", "02.jpg": "…" }.
    // Any image not listed simply falls back to the item title (see selectionImageAlt).
    const imageAlts = parseImageAlts(info.imageAlts);
    if (imageAlts) entry.imageAlts = imageAlts;

    // Optional French translations: info.fr = { title, description, … }.
    if (info.fr && typeof info.fr === 'object') {
      const fr = {};
      ['title', ...SELECTION_STRING_FIELDS].forEach(field => {
        const value = info.fr[field];
        if (typeof value === 'string' && value.trim() !== '') fr[field] = value;
      });
      const frImageAlts = parseImageAlts(info.fr.imageAlts);
      if (frImageAlts) fr.imageAlts = frImageAlts;
      if (Object.keys(fr).length) entry.fr = fr;
    }

    entry._sortPriority = parseSortPriority(info.sortPriority);
    return entry;
  })
  .sort((a, b) => {
    const categoryRank = e => (e.category ? SELECTION_CATEGORIES.indexOf(e.category) : SELECTION_CATEGORIES.length);
    const categoryDiff = categoryRank(a) - categoryRank(b);
    if (categoryDiff !== 0) return categoryDiff;
    const priorityDiff = compareNumbers(a._sortPriority, b._sortPriority);
    if (priorityDiff !== 0) return priorityDiff;
    return a.title.localeCompare(b.title);
  })
  .map(({_sortPriority, ...entry}) => entry);
}

const allItems = scanItems();
const items = VISIBLE_ONLY_SET.size > 0
  ? allItems.filter(item => VISIBLE_ONLY_SET.has(item.id))
  : allItems;
const selection = scanSelection();
const manifest = {items, categories: CATEGORIES, selection};
fs.writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2));

/* ─── Curated Selection: server-side rendered gallery ───
   Renders the SAME `selection` array (single source of truth, from
   selection/<slug>/info.json) directly into static HTML, so the full
   inventory (title, description, maker, dates, materials, dimensions,
   images) is present in the page source without requiring JavaScript.
   js/selection.js only *enhances* this markup (modal, gallery, lightbox);
   it no longer generates the content itself. */

const SITE_URL = 'https://cookandcollect.eu';

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Minimal synchronous JPEG dimension reader (avoids an extra dependency just
// for width/height attributes). Returns null for non-JPEG or unparsable files.
function readJpegDimensions(absPath) {
  try {
    const buf = fs.readFileSync(absPath);
    if (buf.length < 4 || buf[0] !== 0xFF || buf[1] !== 0xD8) return null;
    let offset = 2;
    while (offset < buf.length) {
      if (buf[offset] !== 0xFF) { offset++; continue; }
      const marker = buf[offset + 1];
      // SOF markers (baseline/progressive), excluding DHT/JPG extensions.
      const isSOF = (marker >= 0xC0 && marker <= 0xCF) && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC;
      const length = buf.readUInt16BE(offset + 2);
      if (isSOF) {
        const height = buf.readUInt16BE(offset + 5);
        const width = buf.readUInt16BE(offset + 7);
        return {width, height};
      }
      if (marker === 0xD8 || marker === 0xD9) { offset += 2; continue; }
      offset += 2 + length;
    }
  } catch (e) {
    return null;
  }
  return null;
}

const imageSizeCache = new Map();
function imageDimensions(relPathToImage) {
  if (imageSizeCache.has(relPathToImage)) return imageSizeCache.get(relPathToImage);
  const absPath = path.join(__dirname, relPathToImage);
  const ext = path.extname(absPath).toLowerCase();
  const dims = (ext === '.jpg' || ext === '.jpeg') ? readJpegDimensions(absPath) : null;
  imageSizeCache.set(relPathToImage, dims);
  return dims;
}

// Category values are stored in English (see selection/README.md); the display
// label is simply the matching, already-translated curatedCatXTitle string.
function selectionCategoryLabel(category, strings) {
  const labels = {
    'French Copperware': strings.curatedCat1Title,
    'Champagne & Wine Objects': strings.curatedCat2Title,
    'French Design & Decorative Objects': strings.curatedCat3Title,
    'Rare Cast Iron': strings.curatedCat4Title
  };
  if (!category) return strings.selOtherPieces;
  return labels[category] || category;
}

// Mirrors selLocalize() in js/selection.js: overlay `fr` translations and
// translate the (English-stored) status value for display.
function localizeSelectionEntry(entry, langCode, strings) {
  const hasFr = langCode === 'fr' && entry.fr;
  const localized = hasFr ? {...entry, ...entry.fr} : {...entry};
  if (!(hasFr && entry.fr.status)) {
    if (localized.status === 'Available') localized.status = strings.selStatusAvailable;
    else if (localized.status === 'Collection Archive') localized.status = strings.selStatusArchive;
  }
  return localized;
}

function selectionAssetUrl(p, base) {
  if (!p) return p;
  return /^https?:/.test(p) ? p : base + p;
}

function selectionField(label, value) {
  if (!value) return '';
  return `<div class="sel-field"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`;
}

// Per-image ALT text: looks up the image's filename in item.imageAlts (an
// optional { "cover.jpg": "…", "02.jpg": "…" } map from info.json). Falls
// back to the supplied default when no specific alt text has been written,
// so every image can have a distinct, accurate description without it being
// mandatory for every file.
function selectionImageAlt(item, relPath, fallback) {
  const filename = path.basename(relPath);
  if (item.imageAlts && typeof item.imageAlts[filename] === 'string' && item.imageAlts[filename].trim()) {
    return item.imageAlts[filename];
  }
  return fallback;
}

function renderSelectionCard(item, index, strings, base) {
  const cover = item.cover ? selectionAssetUrl(item.cover, base) : null;
  const dims = item.cover ? imageDimensions(item.cover) : null;
  const dimAttrs = dims ? ` width="${dims.width}" height="${dims.height}"` : '';
  const meta = item.period || '';
  const title = item.title || '';
  const statusBadge = item.status ? `<span class="curated-status">${escapeHtml(item.status)}</span>` : '';

  const extraImages = (item.images || []).slice(1);
  const gallery = extraImages.length ? `
        <div class="sel-thumbnails">
          ${extraImages.map((src, i) => {
            const url = selectionAssetUrl(src, base);
            const d = imageDimensions(src);
            const attrs = d ? ` width="${d.width}" height="${d.height}"` : '';
            const alt = selectionImageAlt(item, src, `${title} — ${i + 2}`);
            return `<img src="${url}" alt="${escapeHtml(alt)}"${attrs} loading="lazy">`;
          }).join('')}
        </div>` : '';

  const fields =
    selectionField(strings.selMaker, item.maker) +
    selectionField(strings.selDesigner, item.designer) +
    selectionField(strings.selOrigin, item.origin) +
    selectionField(strings.selPeriod, item.period) +
    selectionField(strings.selMaterials, item.materials) +
    selectionField(strings.selDimensions, item.dimensions) +
    selectionField(strings.selMarks, item.marks) +
    selectionField(strings.selCondition, item.condition) +
    selectionField(strings.selStatus, item.status);

  const categoryLabel = item.category ? selectionCategoryLabel(item.category, strings) : '';

  return `
      <details class="curated-card" data-index="${index}">
        <summary class="curated-card-summary" aria-label="${escapeHtml(title)}">
          <span class="curated-card-image">
            ${cover
              ? `<img src="${cover}" alt="${escapeHtml(selectionImageAlt(item, item.cover, title))}"${dimAttrs} loading="lazy">`
              : `<span class="no-cover">${escapeHtml(strings.selNoPhotos)}</span>`}
            ${statusBadge}
          </span>
          <span class="curated-card-body">
            <h4 class="curated-card-title">${escapeHtml(title)}</h4>
            ${meta ? `<span class="curated-card-meta">${escapeHtml(meta)}</span>` : ''}
          </span>
        </summary>
        <div class="curated-card-details">
          ${categoryLabel ? `<p class="sel-detail-category">${escapeHtml(categoryLabel)}</p>` : ''}
          ${item.description ? `<p class="sel-detail-description">${escapeHtml(item.description)}</p>` : ''}
          ${fields ? `<dl class="sel-detail-fields">${fields}</dl>` : ''}
          ${gallery}
        </div>
      </details>`;
}

// Renders the full static gallery for one locale: grouped by category (same
// order as manifest.selection), every object's complete data present in HTML.
function renderSelectionGallery(selectionList, langCode, strings, base) {
  if (!selectionList.length) {
    return `<div class="empty-state"><p>${escapeHtml(strings.curatedEmpty)}</p></div>`;
  }

  const localized = selectionList.map(entry => localizeSelectionEntry(entry, langCode, strings));

  const groups = [];
  localized.forEach((item, i) => {
    const key = item.category || '';
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.entries.push([item, i]);
    else groups.push({key, entries: [[item, i]]});
  });

  return groups.map(group => `
    <div class="curated-group" data-category="${escapeHtml(group.key)}">
      <h3 class="curated-group-heading">${escapeHtml(group.key ? selectionCategoryLabel(group.key, strings) : strings.selOtherPieces)}</h3>
      <div class="curated-grid">${group.entries.map(([item, i]) => renderSelectionCard(item, i, strings, base)).join('')}</div>
    </div>`).join('');
}

// Minimal, non-invented JSON-LD: only fields actually present in the data.
// No price/offers/brand/sku/gtin/availability/reviews are added (none exist).
function renderSelectionStructuredData(selectionList, langCode, strings, canonicalUrl) {
  if (!selectionList.length) return '';
  const localized = selectionList.map(entry => localizeSelectionEntry(entry, langCode, strings));

  const itemListElement = localized.map((item, i) => {
    const image = item.cover ? `${SITE_URL}/${item.cover}` : undefined;
    const additionalProperty = [
      ['Maker', item.maker], ['Designer', item.designer], ['Origin', item.origin],
      ['Period', item.period], ['Materials', item.materials], ['Dimensions', item.dimensions],
      ['Marks & signatures', item.marks], ['Condition', item.condition], ['Status', item.status]
    ]
      .filter(([, value]) => !!value)
      .map(([name, value]) => ({'@type': 'PropertyValue', name, value}));

    const product = {
      '@type': 'Product',
      name: item.title,
      ...(item.description ? {description: item.description} : {}),
      ...(image ? {image} : {}),
      ...(item.category ? {category: selectionCategoryLabel(item.category, strings)} : {}),
      ...(additionalProperty.length ? {additionalProperty} : {})
    };

    return {'@type': 'ListItem', position: i + 1, item: product};
  });

  const json = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: strings.curatedTitle,
    description: strings.curatedMetaDesc,
    url: canonicalUrl,
    itemListElement
  };

  return `<script type="application/ld+json">${JSON.stringify(json)}</script>`;
}

/* ─── Shop catalogue: server-side rendered grid + permanent item pages ───
   Mirrors the curated-selection SSR approach: `items` (from items/<slug>/,
   the single source of truth) is rendered directly into static HTML for the
   home (available) and sold grids, and into one permanent page per item at
   en/collection/<id>.html. js/app.js only *enhances* this markup (search,
   category filter); it must not be required to discover the inventory. */

// Where a shop item's permanent URL lives, relative to the current page's
// locale dir. Only EN has permanent collection pages today (see report:
// FR item descriptions are not yet translated, so FR pages are not
// generated rather than duplicating English text under a French URL).
function collectionBaseFor(localeDir) {
  if (localeDir === '') return 'en/collection/';
  if (localeDir === 'en') return 'collection/';
  return null; // fr: no permanent page yet, fall back to item.html?id=
}

function itemHref(item, collectionBase) {
  return collectionBase
    ? `${collectionBase}${encodeURIComponent(item.id)}.html`
    : `item.html?id=${encodeURIComponent(item.id)}`;
}

function renderItemCard(item, strings, base, collectionBase, showSoldBadge) {
  const cover = item.cover ? selectionAssetUrl(item.cover, base) : null;
  const dims = item.cover ? imageDimensions(item.cover) : null;
  const dimAttrs = dims ? ` width="${dims.width}" height="${dims.height}"` : '';
  return `
    <a href="${itemHref(item, collectionBase)}" class="item-card">
      <div class="image-wrapper">
        ${cover
          ? `<img src="${cover}" alt="${escapeHtml(item.title)}"${dimAttrs} loading="lazy">`
          : `<div class="no-cover">${escapeHtml(strings.selNoPhotos)}</div>`}
        ${showSoldBadge ? `<span class="sold-badge">${escapeHtml(strings.sold)}</span>` : ''}
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        <p class="card-price">${escapeHtml(item.price)}</p>
      </div>
    </a>`;
}

function renderItemGrid(itemList, strings, base, collectionBase, showSoldBadge, emptyMsg) {
  if (!itemList.length) {
    return `<div class="empty-state"><p>${escapeHtml(emptyMsg)}</p></div>`;
  }
  return itemList.map(item => renderItemCard(item, strings, base, collectionBase, showSoldBadge)).join('');
}

// Category → specialist guide, for the 1-2 contextual links shown on a
// permanent item page. Deliberately narrow: only maps categories/entities the
// guides actually cover, so unrelated items (e.g. Terrines, Baking Dishes)
// get no forced link rather than an irrelevant one.
function itemGuideLinks(item, guideHrefs, strings) {
  const links = [];
  if (item.category === 'Copper') {
    links.push({href: guideHrefs.guideCopperHref, label: strings.guideLinkCopper});
  }
  if (isLeCreuset(item)) {
    links.push({href: guideHrefs.guideLeCreusetHref, label: strings.guideLinkLeCreuset});
    if (isCocotte(item)) {
      links.push({href: guideHrefs.guideDatingHref, label: strings.guideLinkDating});
    }
  }
  if (item.category === 'Ice Buckets') {
    links.push({href: guideHrefs.guideChampagneHref, label: strings.guideLinkChampagne});
  }
  return links.slice(0, 2);
}

// Minimal, non-invented Product + BreadcrumbList JSON-LD for a permanent item
// page. Offer/availability only reflects real sold/available status; no
// GTIN/MPN/brand/reviews are added since none of that data exists.
function renderItemStructuredData(item, canonicalUrl, breadcrumbs) {
  const images = (item.images || []).map(src => `${SITE_URL}/${src}`);
  const priceMatch = typeof item.price === 'string' ? item.price.match(/([\d.,]+)\s*€/) : null;
  const priceValue = priceMatch ? priceMatch[1].replace(/\./g, '').replace(',', '.') : null;

  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.title,
    ...(item.description ? {description: item.description} : {}),
    ...(images.length ? {image: images} : {}),
    ...(item.category ? {category: item.category} : {}),
    itemCondition: 'https://schema.org/UsedCondition',
    url: canonicalUrl,
    ...(priceValue ? {
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EUR',
        price: priceValue,
        availability: item.sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
        url: canonicalUrl
      }
    } : {})
  };

  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: crumb.url
    }))
  };

  return `<script type="application/ld+json">${JSON.stringify(product)}</script>\n  <script type="application/ld+json">${JSON.stringify(breadcrumbList)}</script>`;
}

// CollectionPage + ItemList JSON-LD for the home (available) and sold
// catalogue pages. Mirrors exactly what is rendered in gridHTML for the same
// items/locale — no data beyond what a visitor already sees on the page.
function renderCatalogListStructuredData(itemsList, canonicalUrl, name, description, collectionBase) {
  if (!itemsList.length) return '';
  const pageDir = canonicalUrl.replace(/[^/]+$/, '');
  const itemListElement = itemsList.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: `${pageDir}${itemHref(item, collectionBase)}`
  }));

  const json = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: canonicalUrl,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement
    }
  };

  return `<script type="application/ld+json">${JSON.stringify(json)}</script>`;
}

function renderItemGallery(item, base) {
  const imgs = item.images || [];
  if (!imgs.length) return '';
  const main = imgs[0];
  const mainDims = imageDimensions(main);
  const mainAttrs = mainDims ? ` width="${mainDims.width}" height="${mainDims.height}"` : '';
  const thumbs = imgs.slice(1).map((src, i) => {
    const url = selectionAssetUrl(src, base);
    const d = imageDimensions(src);
    const attrs = d ? ` width="${d.width}" height="${d.height}"` : '';
    return `<img src="${url}" alt="${escapeHtml(item.title)} — photo ${i + 2}"${attrs} loading="lazy">`;
  }).join('');
  return `
      <div class="gallery">
        <img src="${selectionAssetUrl(main, base)}" alt="${escapeHtml(item.title)}" class="main-image"${mainAttrs}>
        ${thumbs ? `<div class="thumbnails">${thumbs}</div>` : ''}
      </div>`;
}

// Renders one permanent /en/collection/<id>.html page. `strings` = i18n.en.
function renderCollectionPage(item, strings, guideHrefs, base) {
  const canonicalUrl = `${SITE_URL}/en/collection/${item.id}.html`;
  const listHref = item.sold ? '../sold.html' : '../index.html';
  const listLabel = item.sold ? strings.collectionBreadcrumbSold : strings.collectionBreadcrumbAvailable;
  const backLabel = item.sold ? strings.backSold : strings.backCollection;
  const statusLabel = item.sold ? strings.collectionStatusSold : strings.collectionStatusAvailable;

  const breadcrumbs = [
    {name: strings.collectionBreadcrumbHome, url: `${SITE_URL}/en/index.html`},
    {name: listLabel, url: `${SITE_URL}/en/${item.sold ? 'sold.html' : 'index.html'}`},
    {name: item.title, url: canonicalUrl}
  ];

  const guideLinks = itemGuideLinks(item, guideHrefs, strings);
  const guideLinksHTML = guideLinks.length ? `
      <p class="collection-related-links">
        ${guideLinks.map(l => `<a href="../${l.href}">${escapeHtml(l.label)}</a>`).join(' &middot; ')}
      </p>` : '';

  const metaDescRaw = item.description ? item.description.replace(/\s+/g, ' ').trim() : item.title;
  const metaDesc = metaDescRaw.length > 158 ? `${metaDescRaw.slice(0, 155).trim()}…` : metaDescRaw;
  const docTitle = `${item.title} | Cook & Collect`;

  const langSwitchHTML = `<li class="lang-switch">
          <select onchange="location.href=this.value" aria-label="{{ariaLanguage}}">
            <option value="${item.id}.html" selected>EN</option>
            <option value="../../fr/item.html?id=${encodeURIComponent(item.id)}">FR</option>
          </select>
        </li>`;

  const rawHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(metaDesc)}">
  <title>${escapeHtml(docTitle)}</title>
  <link rel="icon" href="../../favicon.svg" type="image/svg+xml">
  <link rel="icon" href="../../favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="../../apple-touch-icon.png">
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:type" content="product">
  <meta property="og:title" content="${escapeHtml(docTitle)}">
  <meta property="og:description" content="${escapeHtml(metaDesc)}">
  <meta property="og:url" content="${canonicalUrl}">
  ${item.cover ? `<meta property="og:image" content="${SITE_URL}/${item.cover}">` : ''}
  <link rel="stylesheet" href="../../css/style.css?v=6">
  ${renderItemStructuredData(item, canonicalUrl, breadcrumbs)}
</head>
<body data-page="collection-item">
  ${renderNav('home', langSwitchHTML, '../')}
  <main>
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="../index.html">${escapeHtml(strings.collectionBreadcrumbHome)}</a> &rsaquo;
      <a href="${listHref}">${escapeHtml(listLabel)}</a> &rsaquo;
      <span aria-current="page">${escapeHtml(item.title)}</span>
    </nav>
    <a href="${listHref}" class="back-link">${escapeHtml(backLabel)}</a>
    <div class="item-layout">
      ${renderItemGallery(item, '../../')}
      <div class="item-info">
        <span class="${item.sold ? 'sold-badge' : 'available-badge'}">${escapeHtml(statusLabel)}</span>
        <h1 class="item-title">${escapeHtml(item.title)}</h1>
        <p class="item-price">${escapeHtml(item.price)}</p>
        ${item.description ? `<p class="item-description">${escapeHtml(item.description)}</p>` : ''}
        ${!item.sold ? `<div class="shipping-note"><span class="shipping-icon">&#9992;</span> ${strings.shippingNote} <a href="../shipping.html">${escapeHtml(strings.collectionViewShipping)}</a></div>` : ''}
        ${guideLinksHTML}
      </div>
    </div>
  </main>
  ${CONTACT_BUTTONS}
  ${FOOTER}
</body>
</html>`;

  return substitute(rawHtml, {...strings, legalHref: '../legal-notice.html'});
}

/* ─── Canonical / hreflang for standard (non-catalogue-injected) pages ───
   Long-term architecture: /en/ and /fr/ are the canonical language roots.
   Root-level duplicates (see LOCALES) are a legacy holdover from before the
   /en/ + /fr/ split and should NOT be treated as canonical going forward —
   they point their canonical at the matching /en/ page instead. Root's own
   hreflang is omitted (rather than pointing hreflang at itself) so it never
   competes with the real /en/⇄/fr/ pair. The domain homepage ("/") is
   intentionally NOT covered by this helper — see build report. */
function renderCanonicalBlock(localeDir, file, frFile = file) {
  if (localeDir === '') {
    return `<link rel="canonical" href="${SITE_URL}/en/${file}">`;
  }
  const enUrl = `${SITE_URL}/en/${file}`;
  const frUrl = `${SITE_URL}/fr/${frFile}`;
  const selfUrl = localeDir === 'en' ? enUrl : frUrl;
  return [
    `<link rel="canonical" href="${selfUrl}">`,
    `<link rel="alternate" hreflang="en" href="${enUrl}">`,
    `<link rel="alternate" hreflang="fr" href="${frUrl}">`,
    `<link rel="alternate" hreflang="x-default" href="${enUrl}">`
  ].join('\n  ');
}

/* ─── Bilingual page generation ─── */

// Root serves English (canonical); /en/ duplicates it; /fr/ is French.
const LOCALES = [
  {code: 'en', dir: '', legal: 'legal-notice.html'},
  {code: 'en', dir: 'en', legal: 'legal-notice.html'},
  {code: 'fr', dir: 'fr', legal: 'mentions-legales.html'}
];

// Page types. `inject` = needs the manifest inlined (item grid / detail).
const PAGES = [
  {tpl: 'home.html', out: 'index.html', page: 'home', inject: true},
  {tpl: 'item.html', out: 'item.html', page: 'item', inject: true},
  {tpl: 'curated-selection.html', out: 'curated-selection.html', page: 'curated', inject: true},
  {tpl: 'shipping.html', out: 'shipping.html', page: 'shipping'},
  {tpl: 'about.html', out: 'about.html', page: 'about'},
  {tpl: 'legal.html', out: null, page: 'legal'}, // out resolved per-locale (legal filename)
  {tpl: 'sold.html', out: 'sold.html', page: 'sold', inject: true} // hidden / unlinked
];

// Set to true to restore the detailed shipping cost tables on the Shipping page.
// While false, that page shows only a "contact us for a quote" message.
const SHIPPING_DETAILS_VISIBLE = true;

const manifestScript = `<script>window.__MANIFEST__=${JSON.stringify(manifest)};</script>`;
const tpl = name => fs.readFileSync(path.join(TEMPLATES_DIR, name), 'utf-8');

// Remove a <!-- NAME_START … NAME_END --> marked region from the template output.
function stripBlock(html, name) {
  const re = new RegExp(`[ \\t]*<!-- ${name}_START[\\s\\S]*?${name}_END -->\\n?`, 'g');
  return html.replace(re, '');
}

// Shared partials (contain their own {{keys}}, resolved in the final substitution pass).
const CONTACT_BUTTONS = `<!-- Floating Contact Buttons -->
  <div class="contact-buttons">
    <a href="https://wa.me/33627335434" target="_blank" rel="noopener noreferrer" class="contact-btn whatsapp" aria-label="{{ariaWhatsApp}}">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    </a>
    <a href="https://m.me/cookncollect" target="_blank" rel="noopener noreferrer" class="contact-btn messenger" aria-label="{{ariaMessenger}}">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.2l3.131 3.259L19.752 8.2l-6.561 6.763z"/></svg>
    </a>
  </div>`;

function renderNav(activePage, langSwitch, hrefPrefix) {
  const prefix = hrefPrefix || '';
  const cls = p => (p === activePage ? ' class="active"' : '');
  return `<nav>
    <div class="nav-inner">
      <a href="${prefix}index.html" class="logo">Cook &amp; Collect</a>
      <ul class="nav-links">
        <li><a href="${prefix}index.html"${cls('home')}>{{navCollection}}</a></li>
        <li><a href="${prefix}about.html"${cls('about')}>{{navAbout}}</a></li>
        <li><a href="${prefix}shipping.html"${cls('shipping')}>{{navShipping}}</a></li>
        <li><a href="${prefix}sold.html"${cls('sold')}>{{navSold}}</a></li>
        ${langSwitch}
      </ul>
    </div>
  </nav>`;
}

const FOOTER = `<footer>
    <p>&copy; 2026 Cook &amp; Collect</p>
    <p><a href="{{legalHref}}">{{legal}}</a></p>
  </footer>`;

// Relative path from the current locale dir to `<targetDir>/<file>`.
// Works on file:// as well as when served. Dirs are '', 'en' or 'fr'.
function relPath(fromDir, targetDir, file) {
  if (fromDir === targetDir) return file;
  if (fromDir === '') return `${targetDir}/${file}`;
  return `../${targetDir}/${file}`;
}

function renderLangSwitch(currentDir, currentCode, enFile, frFile) {
  const sel = code => (code === currentCode ? ' selected' : '');
  return `<li class="lang-switch">
          <select onchange="location.href=this.value" aria-label="{{ariaLanguage}}">
            <option value="${relPath(currentDir, 'en', enFile)}"${sel('en')}>EN</option>
            <option value="${relPath(currentDir, 'fr', frFile)}"${sel('fr')}>FR</option>
          </select>
        </li>`;
}

function substitute(html, ctx) {
  return html.replace(/\{\{(\w+)\}\}/g, (m, key) => (key in ctx ? ctx[key] : m));
}

let generated = 0;
LOCALES.forEach(locale => {
  const strings = i18n[locale.code];
  // Prefix so relative asset paths resolve from this folder's depth
  // (root = "", subfolders = "../"). Works on file:// and when served.
  const base = locale.dir === '' ? '' : '../';
  PAGES.forEach(pageDef => {
    const outFile = pageDef.page === 'legal' ? locale.legal : pageDef.out;
    // EN Curated Selection lives at the extension/hyphen-free /en/curatedselection
    // (see build report). FR keeps curated-selection.html unchanged.
    const enFile = pageDef.page === 'legal' ? 'legal-notice.html'
      : pageDef.page === 'curated' ? 'curatedselection'
      : pageDef.out;
    const frFile = pageDef.page === 'legal' ? 'mentions-legales.html' : pageDef.out;
    const langSwitch = renderLangSwitch(locale.dir, locale.code, enFile, frFile);

    let html = tpl(pageDef.tpl)
      .replace('{{nav}}', renderNav(pageDef.page, langSwitch))
      .replace('{{contactButtons}}', CONTACT_BUTTONS)
      .replace('{{footer}}', FOOTER);

    if (pageDef.page === 'shipping') {
      html = stripBlock(html, SHIPPING_DETAILS_VISIBLE ? 'SHIP_HIDDEN' : 'SHIP_DETAILS');
    }

    const ctx = {
      ...strings,
      LANG: locale.code,
      BASE: base,
      legalHref: locale.legal,
      // Guides live in en/guides/ and fr/guides/ (see build-guides.js). From the
      // root English page they need the "en/" prefix; inside en/ or fr/ they are
      // a sibling folder. One helper per guide file keeps this scalable: adding
      // a guide means adding one line here, not a new linking scheme.
      ...(() => {
        const guideHref = file =>
          locale.dir === '' ? `en/guides/${file}` : `guides/${file}`;
        return {
          guidesHref: guideHref('index.html'),
          guideChampagneHref: guideHref('vintage-french-champagne-buckets.html'),
          guideCopperHref: guideHref('vintage-french-copper-cookware.html'),
          guideLeCreusetHref: guideHref('vintage-le-creuset.html'),
          guideDatingHref: guideHref('le-creuset-dating-guide.html'),
          guideDecorativeHref: guideHref('french-design-decorative-objects.html')
        };
      })(),
      // Canonical/hreflang architecture: /en/ and /fr/ are the canonical
      // language roots going forward. Root ('') is a legacy pre-/en/ duplicate
      // and canonicalizes to the /en/ page instead of the other way around
      // (see renderCanonicalBlock and the build report for the reasoning).
      ...(pageDef.page === 'curated' ? (() => {
        // The true canonical is /en/curatedselection (hyphen/extension-free —
        // see build report). Root's own duplicate and the legacy
        // en/curated-selection.html file (kept live, non-destructively, for
        // existing links) both point their canonical there and omit
        // hreflang, exactly like the other legacy-root-duplicate pages.
        // fr/curated-selection.html is unchanged and stays self-canonical.
        const curatedSelectionUrl = `${SITE_URL}/en/curatedselection`;
        const hreflangFr = `${SITE_URL}/fr/curated-selection.html`;
        const isFr = locale.dir === 'fr';
        const selfCanonical = isFr ? hreflangFr : curatedSelectionUrl;
        const firstCover = selection.find(e => e.cover);
        const ogImage = firstCover
          ? `<meta property="og:image" content="${SITE_URL}/${firstCover.cover}">`
          : '';
        return {
          curatedCanonical: selfCanonical,
          // Only the true canonical pages (fr's own page, and the real
          // /en/curatedselection file generated separately below) carry
          // hreflang. Root and the legacy en/curated-selection.html
          // duplicate omit it.
          curatedHreflangBlock: isFr
            ? `<link rel="alternate" hreflang="en" href="${curatedSelectionUrl}">
  <link rel="alternate" hreflang="fr" href="${hreflangFr}">
  <link rel="alternate" hreflang="x-default" href="${curatedSelectionUrl}">`
            : '',
          curatedOgImage: ogImage,
          curatedGalleryHTML: renderSelectionGallery(selection, locale.code, strings, base),
          curatedStructuredData: renderSelectionStructuredData(selection, locale.code, strings, selfCanonical)
        };
      })() : {}),
      // Home/sold: server-rendered item grid (crawlable without JS) +
      // generic canonical/hreflang block for every other standard page type.
      ...(pageDef.page === 'home' ? (() => {
        const available = items.filter(i => !i.sold);
        const collectionBase = collectionBaseFor(locale.dir);
        // The domain homepage ("/") is deliberately left self-canonical for
        // now — see build report re: long-term homepage/language routing.
        const canonicalUrl = locale.dir === '' ? `${SITE_URL}/` : `${SITE_URL}/${locale.dir}/index.html`;
        return {
          gridHTML: renderItemGrid(available, strings, base, collectionBase, false, strings.noAvailable),
          canonicalBlock: locale.dir === ''
            ? `<link rel="canonical" href="${canonicalUrl}">`
            : renderCanonicalBlock(locale.dir, 'index.html'),
          structuredData: renderCatalogListStructuredData(available, canonicalUrl, strings.homeTitle, strings.homeMetaDesc, collectionBase)
        };
      })() : {}),
      ...(pageDef.page === 'sold' ? (() => {
        const sold = items.filter(i => i.sold);
        const collectionBase = collectionBaseFor(locale.dir);
        const canonicalUrl = `${SITE_URL}/${locale.dir ? `${locale.dir}/` : 'en/'}sold.html`;
        return {
          gridHTML: renderItemGrid(sold, strings, base, collectionBase, true, strings.noSold),
          canonicalBlock: renderCanonicalBlock(locale.dir, 'sold.html'),
          structuredData: renderCatalogListStructuredData(sold, canonicalUrl, strings.soldTitle, strings.soldMetaDesc, collectionBase)
        };
      })() : {}),
      ...(pageDef.page === 'about' ? {canonicalBlock: renderCanonicalBlock(locale.dir, 'about.html')} : {}),
      ...(pageDef.page === 'shipping' ? {canonicalBlock: renderCanonicalBlock(locale.dir, 'shipping.html')} : {}),
      ...(pageDef.page === 'legal' ? {canonicalBlock: renderCanonicalBlock(locale.dir, 'legal-notice.html', 'mentions-legales.html')} : {})
    };
    // Pre-substitution copy, reused below to render the real
    // /en/curatedselection canonical file from the same nav/footer/langSwitch
    // markup without a second render pass (see build report).
    const preCtxHtml = html;
    html = substitute(html, ctx);

    if (pageDef.inject) {
      const collectionBase = collectionBaseFor(locale.dir);
      const head = `<script>window.__BASE__=${JSON.stringify(base)};window.__COLLECTION_BASE__=${JSON.stringify(collectionBase)};</script>${manifestScript}`;
      html = html.replace('</head>', `${head}\n</head>`);
    }

    const outDir = path.join(__dirname, locale.dir);
    fs.mkdirSync(outDir, {recursive: true});
    fs.writeFileSync(path.join(outDir, outFile), html);
    generated++;

    // Real canonical Curated Selection URL: /en/curatedselection (no
    // hyphen/extension). Rendered from the same pre-substitution markup as
    // the legacy en/curated-selection.html file above, but self-canonical
    // with full reciprocal hreflang, mirroring the other canonical pages.
    if (pageDef.page === 'curated' && locale.dir === 'en') {
      const curatedSelectionUrl = `${SITE_URL}/en/curatedselection`;
      const hreflangFr = `${SITE_URL}/fr/curated-selection.html`;
      const firstCover = selection.find(e => e.cover);
      const ogImage = firstCover
        ? `<meta property="og:image" content="${SITE_URL}/${firstCover.cover}">`
        : '';
      const canonicalCtx = {
        ...ctx,
        curatedCanonical: curatedSelectionUrl,
        curatedHreflangBlock: `<link rel="alternate" hreflang="en" href="${curatedSelectionUrl}">
  <link rel="alternate" hreflang="fr" href="${hreflangFr}">
  <link rel="alternate" hreflang="x-default" href="${curatedSelectionUrl}">`,
        curatedOgImage: ogImage,
        curatedStructuredData: renderSelectionStructuredData(selection, locale.code, strings, curatedSelectionUrl)
      };
      let canonicalHtml = substitute(preCtxHtml, canonicalCtx);
      if (pageDef.inject) {
        const collectionBase = collectionBaseFor(locale.dir);
        const head = `<script>window.__BASE__=${JSON.stringify(base)};window.__COLLECTION_BASE__=${JSON.stringify(collectionBase)};</script>${manifestScript}`;
        canonicalHtml = canonicalHtml.replace('</head>', `${head}\n</head>`);
      }
      fs.writeFileSync(path.join(outDir, 'curatedselection'), canonicalHtml);
      generated++;
    }
  });
});

/* ─── Permanent per-item pages: /en/collection/<id>.html ───
   EN only for now (see collectionBaseFor). Every available AND sold item
   gets one, and the URL never changes when an item sells — only its
   status/badge/JSON-LD availability do (see PHASE 6 / Sold Archive). */
const collectionGuideHrefs = {
  guideCopperHref: 'guides/vintage-french-copper-cookware.html',
  guideLeCreusetHref: 'guides/vintage-le-creuset.html',
  guideDatingHref: 'guides/le-creuset-dating-guide.html',
  guideChampagneHref: 'guides/vintage-french-champagne-buckets.html'
};
const collectionDir = path.join(__dirname, 'en', 'collection');
fs.mkdirSync(collectionDir, {recursive: true});
items.forEach(item => {
  const html = renderCollectionPage(item, i18n.en, collectionGuideHrefs, '../../');
  fs.writeFileSync(path.join(collectionDir, `${item.id}.html`), html);
});
console.log(`Generated ${items.length} permanent collection page(s) in en/collection/.`);

/* ─── sitemap.xml + robots.txt ───
   Canonical, indexable URLs only: no root duplicates, no legacy
   item.html?id= query URLs, no non-canonical FR item pages (none exist). */
const GUIDE_FILES = [
  'index.html',
  'e-dehillerin-copper-cookware.html',
  'french-design-decorative-objects.html',
  'le-creuset-dating-guide.html',
  'lecellier-cuivralec.html',
  'mauviel-vintage-copper-cookware.html',
  'vintage-french-champagne-buckets.html',
  'vintage-french-copper-cookware.html',
  'vintage-le-creuset.html'
];

const sitemapUrls = [];
// Domain homepage: left as its own entry (see canonical note above).
sitemapUrls.push(`${SITE_URL}/`);
['en', 'fr'].forEach(dir => {
  ['index.html', 'sold.html', 'about.html', 'shipping.html'].forEach(file => {
    sitemapUrls.push(`${SITE_URL}/${dir}/${file}`);
  });
  // Curated Selection: EN canonical is the hyphen/extension-free
  // /en/curatedselection; the legacy en/curated-selection.html duplicate is
  // intentionally excluded from the sitemap (non-canonical, kept live only
  // for existing links). FR is unchanged.
  sitemapUrls.push(`${SITE_URL}/${dir}/${dir === 'en' ? 'curatedselection' : 'curated-selection.html'}`);
  sitemapUrls.push(`${SITE_URL}/${dir}/${dir === 'fr' ? 'mentions-legales.html' : 'legal-notice.html'}`);
  GUIDE_FILES.forEach(file => sitemapUrls.push(`${SITE_URL}/${dir}/guides/${file}`));
});
items.forEach(item => sitemapUrls.push(`${SITE_URL}/en/collection/${item.id}.html`));

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemapXml);

const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
fs.writeFileSync(path.join(__dirname, 'robots.txt'), robotsTxt);
console.log(`Generated sitemap.xml (${sitemapUrls.length} URLs) and robots.txt.`);

console.log(`Generated manifest.json - ${items.length} item(s) (${items.filter(i => i.sold).length} sold)`);
console.log(`Generated ${generated} page(s) across ${LOCALES.length} locale target(s).`);
