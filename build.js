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

    // Optional French text: { "fr": { "title": "…", "description": "…" } }.
    // Until it is provided, French pages show the English title/description.
    const fr = {};
    if (info.fr && typeof info.fr === 'object') {
      if (typeof info.fr.title === 'string' && info.fr.title.trim()) fr.title = info.fr.title.trim();
      if (typeof info.fr.description === 'string' && info.fr.description.trim()) fr.description = info.fr.description.trim();
    }

    return {
      ...baseItem,
      ...(Object.keys(fr).length ? {fr} : {}),
      // Every shop item is sold directly by Cook & Collect unless info.json opts out
      // with "directSale": false. The enquiry Worker applies the same rule.
      directSale: info.directSale !== false,
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

    // Optional retail price (free-text, e.g. "€475") for the 1stDibs dealer
    // application. Only shown/emitted when present — the Curated Selection
    // remains price-free for pieces where none is set (e.g. Laurent-Perrier).
    if (typeof info.price === 'string' && info.price.trim() !== '') {
      entry.price = info.price.trim();
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

// Purchase enquiries / offers and first-party analytics both go to the
// identify-agent Worker (POST /enquiry, POST /events). Empty = not configured:
// the purchase buttons stay WhatsApp links and no analytics event leaves the
// browser. ENQUIRY_TURNSTILE_SITE_KEY is Turnstile's *public* site key.
const ENQUIRY_API_BASE = (process.env.ENQUIRY_API_BASE || '').replace(/\/+$/, '');
const ENQUIRY_TURNSTILE_SITE_KEY = process.env.ENQUIRY_TURNSTILE_SITE_KEY || '';
const ANALYTICS_API_BASE = (process.env.ANALYTICS_API_BASE || '').replace(/\/+$/, '');

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
            ${item.price ? `<span class="curated-card-price">${escapeHtml(item.price)}</span>` : ''}
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

// JSON-LD: only fields actually present in the data. `offers.price` is
// added only for items that carry a visible retail price (see
// renderSelectionCard) and is always numerically identical to it, so the
// visible price and structured-data price never diverge.
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

    // item.price is free-text (e.g. "€475"); extract the numeric amount for
    // schema.org's Offer.price, which must be a plain number/string.
    const priceMatch = item.price ? item.price.match(/[\d.,]+/) : null;
    const priceAmount = priceMatch ? priceMatch[0].replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.') : null;

    const product = {
      '@type': 'Product',
      name: item.title,
      ...(item.description ? {description: item.description} : {}),
      ...(image ? {image} : {}),
      ...(item.category ? {category: selectionCategoryLabel(item.category, strings)} : {}),
      ...(additionalProperty.length ? {additionalProperty} : {}),
      ...(priceAmount ? {offers: {'@type': 'Offer', price: priceAmount, priceCurrency: 'EUR'}} : {})
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
// locale dir. EN and FR both have permanent pages (en/collection/, fr/collection/);
// the root English duplicate links into en/collection/.
function collectionBaseFor(localeDir) {
  if (localeDir === '') return 'en/collection/';
  return 'collection/';
}

function itemHref(item, collectionBase) {
  return collectionBase
    ? `${collectionBase}${encodeURIComponent(item.id)}.html`
    : `item.html?id=${encodeURIComponent(item.id)}`;
}

// Items stay in English unless info.json provides an "fr" translation.
const langOf = strings => (strings === i18n.fr ? 'fr' : 'en');
const itemTitle = (item, code) => (code === 'fr' && item.fr && item.fr.title) || item.title;
const itemDescription = (item, code) => (code === 'fr' && item.fr && item.fr.description) || item.description;
const hasTranslation = (item, code, field) => code !== 'fr' || Boolean(item.fr && item.fr[field]);

// Shop items only (never the curated selection). Sold pieces and pieces
// marked "directSale": false never show purchase actions.
const isPurchasable = item => !item.sold && item.directSale !== false;

function renderItemCard(item, strings, base, collectionBase, showSoldBadge) {
  const code = langOf(strings);
  const title = itemTitle(item, code);
  const cover = item.cover ? selectionAssetUrl(item.cover, base) : null;
  const dims = item.cover ? imageDimensions(item.cover) : null;
  const dimAttrs = dims ? ` width="${dims.width}" height="${dims.height}"` : '';
  return `
    <a href="${itemHref(item, collectionBase)}" class="item-card" data-item-id="${escapeHtml(item.id)}">
      <div class="image-wrapper">
        ${cover
          ? `<img src="${cover}" alt="${escapeHtml(title)}"${dimAttrs} loading="lazy" decoding="async">`
          : `<div class="no-cover">${escapeHtml(strings.selNoPhotos)}</div>`}
        ${showSoldBadge ? `<span class="sold-badge">${escapeHtml(strings.sold)}</span>` : ''}
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(title)}</h3>
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

/* ─── Brand / designer detection (title and id only; never invented) ─── */
function itemHaystack(item) {
  return `${item.id} ${item.title}`.toLowerCase();
}
const isCousances = item => /cousances/.test(itemHaystack(item));
const isDesignerPiece = item => /enzo[\s-]*mari|la[\s-]*mama|loewy|coquelle/.test(itemHaystack(item));
function brandKey(item) {
  const h = itemHaystack(item);
  if (/cousances/.test(h)) return 'cousances';
  if (isLeCreuset(item)) return 'le-creuset';
  if (/staub/.test(h)) return 'staub';
  if (/nomar/.test(h)) return 'nomar';
  if (/copper|cuivre/.test(h)) return 'copper';
  return '';
}

/* ─── Shop collection landing pages: /en/shop/<slug>.html, /fr/shop/<slug>.html ───
   One page per collection that has enough available pieces to be useful.
   Below MIN_SHOP_ITEMS the page is not generated (no thin pages) and nothing
   links to it; copper and champagne buckets are covered by their guides. */
const MIN_SHOP_ITEMS = 3;
const SHOP_CATEGORIES = [
  {
    slug: 'vintage-le-creuset',
    key: 'shopLeCreuset',
    match: isLeCreuset,
    guides: [
      {file: 'vintage-le-creuset.html', labelKey: 'guideLinkLeCreuset'},
      {file: 'le-creuset-dating-guide.html', labelKey: 'guideLinkDating'}
    ]
  },
  {
    slug: 'vintage-cousances',
    key: 'shopCousances',
    match: isCousances,
    guides: [
      {file: 'european-enamelled-cast-iron-makers.html', labelKey: 'guideLinkCastIron'},
      {file: 'vintage-le-creuset.html', labelKey: 'guideLinkLeCreuset'}
    ]
  },
  {
    slug: 'designer-cookware',
    key: 'shopDesigner',
    match: isDesignerPiece,
    guides: [
      {file: 'vintage-le-creuset.html', labelKey: 'guideLinkDesigners'},
      {file: 'le-creuset-dating-guide.html', labelKey: 'guideLinkDating'}
    ]
  }
];
const shopCategoryItems = cat => items.filter(item => isPurchasable(item) && cat.match(item));
const ACTIVE_SHOP_CATEGORIES = SHOP_CATEGORIES.filter(cat => shopCategoryItems(cat).length >= MIN_SHOP_ITEMS);

// The most specific shop collection an item belongs to (designer > Cousances > Le Creuset).
function shopCategoryFor(item) {
  const order = ['designer-cookware', 'vintage-cousances', 'vintage-le-creuset'];
  return order
    .map(slug => ACTIVE_SHOP_CATEGORIES.find(cat => cat.slug === slug))
    .find(cat => cat && cat.match(item)) || null;
}

// Crawlable "shop by collection" links (home page and guides). `shopBase` is
// the path from the current page to the locale's shop/ folder.
function renderShopLinks(strings, shopBase) {
  if (!ACTIVE_SHOP_CATEGORIES.length) return '';
  return `<nav class="collection-links" aria-label="${escapeHtml(strings.shopNavLabel)}">
      <span class="collection-links-label">${escapeHtml(strings.shopNavLabel)}</span>
      ${ACTIVE_SHOP_CATEGORIES.map(cat => `<a href="${shopBase}${cat.slug}.html">${escapeHtml(strings[`${cat.key}LinkLabel`])}</a>`).join('\n      ')}
    </nav>`;
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
  if (isCousances(item)) {
    links.push({href: guideHrefs.guideCastIronHref, label: strings.guideLinkCastIron});
  }
  if (isLeCreuset(item)) {
    links.push({href: guideHrefs.guideLeCreusetHref, label: isDesignerPiece(item) ? strings.guideLinkDesigners : strings.guideLinkLeCreuset});
    if (isCocotte(item)) {
      links.push({href: guideHrefs.guideDatingHref, label: strings.guideLinkDating});
    }
  }
  if (item.category === 'Ice Buckets') {
    links.push({href: guideHrefs.guideChampagneHref, label: strings.guideLinkChampagne});
  }
  return links.slice(0, 2);
}

// Up to `limit` available shop pieces related to `item`: same designer, same
// category and same maker score higher. Unrelated pieces are never used as filler.
function relatedAvailableItems(item, limit = 4) {
  const brand = brandKey(item);
  const designer = isDesignerPiece(item);
  const score = other =>
    (designer && isDesignerPiece(other) ? 4 : 0)
    + (other.category === item.category ? 2 : 0)
    + (brand && brandKey(other) === brand ? 1 : 0);
  return items
    .filter(other => other.id !== item.id && isPurchasable(other))
    .map((other, index) => ({other, index, s: score(other)}))
    .filter(entry => entry.s >= 2 || (entry.s === 1 && brand === 'cousances'))
    .sort((a, b) => b.s - a.s || a.index - b.index)
    .slice(0, limit)
    .map(entry => entry.other);
}

const SELLER = {'@type': 'Organization', name: 'Cook & Collect', url: `${SITE_URL}/`};

// Parses "120€" / "1.200,50 €" into "120" / "1200.50"; null when there is no euro price.
function priceAmount(price) {
  const match = typeof price === 'string' ? price.match(/([\d.,]+)\s*€/) : null;
  return match ? match[1].replace(/\./g, '').replace(',', '.') : null;
}

// Product + Offer + BreadcrumbList JSON-LD for a permanent item page. Only real
// data: the published price, real availability (SoldOut once sold), used
// condition and the seller. No GTIN, brand, reviews, ratings or shipping terms
// are added because none of that is recorded. EN and FR pages describe the same
// offer (same price, availability, sku), only the text language differs.
function renderItemStructuredData(item, code, canonicalUrl, breadcrumbs) {
  const images = (item.images || []).map(src => `${SITE_URL}/${src}`);
  const priceValue = priceAmount(item.price);
  const description = itemDescription(item, code);

  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: itemTitle(item, code),
    sku: item.id,
    ...(description ? {description} : {}),
    ...(images.length ? {image: images} : {}),
    ...(item.category ? {category: item.category} : {}),
    url: canonicalUrl,
    ...(priceValue ? {
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EUR',
        price: priceValue,
        availability: item.sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/UsedCondition',
        url: canonicalUrl,
        seller: SELLER
      }
    } : {})
  };

  return `<script type="application/ld+json">${JSON.stringify(product)}</script>\n  ${renderBreadcrumbStructuredData(breadcrumbs)}`;
}

function renderBreadcrumbStructuredData(breadcrumbs) {
  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      ...(crumb.url ? {item: crumb.url} : {})
    }))
  };
  return `<script type="application/ld+json">${JSON.stringify(breadcrumbList)}</script>`;
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

// Organization + WebSite, published once per home page. Contact details are
// the public ones from the legal notice.
function renderSiteStructuredData() {
  const json = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Cook & Collect',
        legalName: i18n.en.legalTradeName,
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/apple-touch-icon.png`,
        email: i18n.en.legalEmail,
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'sales',
          telephone: i18n.en.legalPhone.replace(/\s+/g, ''),
          email: i18n.en.legalEmail,
          availableLanguage: ['English', 'French']
        }
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: 'Cook & Collect',
        url: `${SITE_URL}/`,
        inLanguage: ['en', 'fr'],
        publisher: {'@id': `${SITE_URL}/#organization`}
      }
    ]
  };
  return `<script type="application/ld+json">${JSON.stringify(json)}</script>`;
}

function renderItemGallery(item, base, title) {
  const imgs = item.images || [];
  if (!imgs.length) return '';
  const main = imgs[0];
  const mainDims = imageDimensions(main);
  const mainAttrs = mainDims ? ` width="${mainDims.width}" height="${mainDims.height}"` : '';
  const thumbs = imgs.length > 1 ? imgs.map((src, i) => {
    const url = selectionAssetUrl(src, base);
    const d = imageDimensions(src);
    const attrs = d ? ` width="${d.width}" height="${d.height}"` : '';
    return `<img src="${url}" alt="${escapeHtml(title)} — photo ${i + 1}"${attrs} class="${i === 0 ? 'active' : ''}" onclick="switchImage(${i})" loading="lazy" decoding="async">`;
  }).join('') : '';
  // The main photograph is the LCP element: never lazy, fetched first.
  return `
      <div class="gallery">
        <img src="${selectionAssetUrl(main, base)}" alt="${escapeHtml(title)}" class="main-image" id="mainImage"${mainAttrs} fetchpriority="high" onclick="openLightbox(window._currentImageIndex || 0)">
        ${thumbs ? `<div class="thumbnails">${thumbs}</div>` : ''}
      </div>`;
}

// Script tags shared by generated pages. The analytics endpoint and the
// enquiry API are build-time settings (see ENQUIRY_API_BASE below); while they
// are empty the scripts stay inert / fall back to WhatsApp.
function trackScriptTag(base) {
  return `<script src="${base}js/track.js?v=1" data-api="${escapeHtml(ANALYTICS_API_BASE)}" defer></script>`;
}
function enquiryScriptTag(base) {
  return `<script src="${base}js/enquiry.js?v=1" data-api="${escapeHtml(ENQUIRY_API_BASE)}" data-sitekey="${escapeHtml(ENQUIRY_TURNSTILE_SITE_KEY)}" defer></script>`;
}

// Pre-filled WhatsApp message: works with no backend and no JavaScript, and is
// replaced by the enquiry / offer form when js/enquiry.js is configured.
function whatsappEnquiryHref(item, code, kind, pageUrl) {
  const s = i18n[code];
  const intro = kind === 'offer' ? s.purchaseWhatsappOffer : s.purchaseWhatsappBuy;
  const text = `${intro} ${itemTitle(item, code)} (${s.purchaseRefLabel} ${item.id}) — ${item.price}\n${pageUrl}`;
  return `https://wa.me/33627335434?text=${encodeURIComponent(text)}`;
}

function renderPurchaseActions(item, code, pageUrl) {
  if (!isPurchasable(item)) return '';
  const s = i18n[code];
  return `<div class="purchase-actions" data-purchase-actions>
          <a class="purchase-btn purchase-btn-primary" data-enquiry="purchase" href="${escapeHtml(whatsappEnquiryHref(item, code, 'purchase', pageUrl))}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.purchaseEnquire)}</a>
          <a class="purchase-btn purchase-btn-secondary" data-enquiry="offer" href="${escapeHtml(whatsappEnquiryHref(item, code, 'offer', pageUrl))}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.purchaseOffer)}</a>
          <p class="purchase-note">${escapeHtml(s.purchaseNote)}</p>
        </div>`;
}

function renderRelatedSection(item, code, strings) {
  const related = relatedAvailableItems(item);
  const heading = item.sold ? strings.relatedSoldHeading : strings.relatedHeading;
  if (!related.length) {
    if (!item.sold) return '';
    return `
    <section class="related-items" aria-labelledby="related-heading">
      <h2 id="related-heading">${escapeHtml(heading)}</h2>
      <p><a href="../index.html">${escapeHtml(strings.relatedBrowseAll)}</a></p>
    </section>`;
  }
  return `
    <section class="related-items" aria-labelledby="related-heading">
      <h2 id="related-heading">${escapeHtml(heading)}</h2>
      <div class="items-grid related-grid" data-list="related">
        ${renderItemGrid(related, strings, '../../', './', false, '')}
      </div>
    </section>`;
}

// One permanent item page: /en/collection/<id>.html or /fr/collection/<id>.html.
function renderCollectionPage(item, code, guideHrefs) {
  const strings = i18n[code];
  const enUrl = `${SITE_URL}/en/collection/${item.id}.html`;
  const frUrl = `${SITE_URL}/fr/collection/${item.id}.html`;
  const canonicalUrl = code === 'fr' ? frUrl : enUrl;
  const homeUrl = code === 'fr' ? `${SITE_URL}/fr/index.html` : `${SITE_URL}/`;
  const title = itemTitle(item, code);
  const description = itemDescription(item, code);
  // Untranslated text on a French page is marked as English for screen readers.
  const titleLang = hasTranslation(item, code, 'title') ? '' : ' lang="en"';
  const descLang = hasTranslation(item, code, 'description') ? '' : ' lang="en"';
  // Available pieces sit under their shop collection page when they have one;
  // otherwise under the available collection (the home page) or sold page.
  const shopCat = item.sold ? null : shopCategoryFor(item);
  const listHref = item.sold ? '../sold.html' : shopCat ? `../shop/${shopCat.slug}.html` : '../index.html';
  const listLabel = item.sold ? strings.collectionBreadcrumbSold
    : shopCat ? strings[`${shopCat.key}LinkLabel`] : strings.collectionBreadcrumbAvailable;
  const backHref = item.sold ? '../sold.html' : '../index.html';
  const backLabel = item.sold ? strings.backSold : strings.backCollection;
  const statusLabel = item.sold ? strings.collectionStatusSold : strings.collectionStatusAvailable;

  // Structured breadcrumbs only use canonical URLs: the available collection
  // *is* the home page, so it is not repeated as a second level.
  const listUrl = item.sold ? `${SITE_URL}/${code}/sold.html`
    : shopCat ? `${SITE_URL}/${code}/shop/${shopCat.slug}.html` : null;
  const breadcrumbs = [
    {name: strings.collectionBreadcrumbHome, url: homeUrl},
    ...(listUrl ? [{name: listLabel, url: listUrl}] : []),
    {name: title, url: canonicalUrl}
  ];

  const contextLinks = [
    ...(shopCat ? [{href: `../shop/${shopCat.slug}.html`, label: strings[`${shopCat.key}LinkLabel`]}] : []),
    ...itemGuideLinks(item, guideHrefs, strings).map(l => ({href: `../${l.href}`, label: l.label}))
  ];
  const contextLinksHTML = contextLinks.length ? `
        <p class="collection-related-links">
          ${contextLinks.map(l => `<a href="${l.href}">${escapeHtml(l.label)}</a>`).join(' &middot; ')}
        </p>` : '';

  const metaDescRaw = description ? description.replace(/\s+/g, ' ').trim() : title;
  const metaDescBody = metaDescRaw.length > 150 ? `${metaDescRaw.slice(0, 147).trim()}…` : metaDescRaw;
  const metaDesc = item.sold ? `${strings.collectionStatusSold}. ${metaDescBody}` : metaDescBody;
  const docTitle = `${title} | Cook & Collect`;
  const curatedHref = code === 'fr' ? '../curated-selection.html' : '../curatedselection';
  const legalHref = code === 'fr' ? '../mentions-legales.html' : '../legal-notice.html';

  const langSwitchHTML = `<li class="lang-switch">
          <select onchange="location.href=this.value" aria-label="{{ariaLanguage}}">
            <option value="../../en/collection/${item.id}.html"${code === 'en' ? ' selected' : ''}>EN</option>
            <option value="../../fr/collection/${item.id}.html"${code === 'fr' ? ' selected' : ''}>FR</option>
          </select>
        </li>`;

  const soldNote = item.sold ? `<p class="sold-note">${escapeHtml(strings.collectionSoldNote)}</p>` : '';

  const rawHtml = `<!DOCTYPE html>
<html lang="${code}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(metaDesc)}">
  <title>${escapeHtml(docTitle)}</title>
  <link rel="icon" href="../../favicon.svg" type="image/svg+xml">
  <link rel="icon" href="../../favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="../../apple-touch-icon.png">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="fr" href="${frUrl}">
  <link rel="alternate" hreflang="x-default" href="${enUrl}">
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="Cook &amp; Collect">
  <meta property="og:locale" content="${code === 'fr' ? 'fr_FR' : 'en_GB'}">
  <meta property="og:title" content="${escapeHtml(docTitle)}">
  <meta property="og:description" content="${escapeHtml(metaDesc)}">
  <meta property="og:url" content="${canonicalUrl}">
  ${item.cover ? `<meta property="og:image" content="${SITE_URL}/${item.cover}">` : ''}
  <link rel="stylesheet" href="../../css/style.css?v=26">
  ${renderItemStructuredData(item, code, canonicalUrl, breadcrumbs)}
</head>
<body data-page="collection-item" data-item-id="${escapeHtml(item.id)}" data-item-title="${escapeHtml(title)}" data-item-price="${escapeHtml(item.price)}" data-item-status="${item.sold ? 'sold' : 'available'}" data-purchasable="${isPurchasable(item)}">
  ${renderNav('home', langSwitchHTML, '../', curatedHref, '../guides/')}
  <main>
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><a href="../index.html">${escapeHtml(strings.collectionBreadcrumbHome)}</a></li>
        <li><a href="${listHref}">${escapeHtml(listLabel)}</a></li>
        <li aria-current="page"${titleLang}>${escapeHtml(title)}</li>
      </ol>
    </nav>
    <a href="${backHref}" class="back-link">${escapeHtml(backLabel)}</a>
    <div class="item-layout">
      ${renderItemGallery(item, '../../', title)}
      <div class="item-info">
        <span class="${item.sold ? 'sold-badge' : 'available-badge'}">${escapeHtml(statusLabel)}</span>
        <h1 class="item-title"${titleLang}>${escapeHtml(title)}</h1>
        <p class="item-price">${escapeHtml(item.price)}</p>
        ${soldNote}
        ${renderPurchaseActions(item, code, canonicalUrl)}
        ${description ? `<p class="item-description"${descLang}>${escapeHtml(description)}</p>` : ''}
        ${!item.sold ? `<div class="shipping-note"><span class="shipping-icon">&#9992;</span> ${strings.shippingNote} <a href="../shipping.html">${escapeHtml(strings.collectionViewShipping)}</a></div>` : ''}
        ${contextLinksHTML}
      </div>
    </div>
    ${renderRelatedSection(item, code, strings)}
  </main>
  ${tpl('lightbox.html')}
  ${CONTACT_BUTTONS}
  ${FOOTER}
  <script src="../../js/app.js?v=4"></script>
  ${trackScriptTag('../../')}
  ${isPurchasable(item) ? enquiryScriptTag('../../') : ''}
</body>
</html>`;

  return substitute(rawHtml, {...strings, legalHref, privacyHref: '../privacy.html'});
}

// One shop collection landing page: /<code>/shop/<slug>.html.
function renderShopPage(cat, code) {
  const strings = i18n[code];
  const get = suffix => strings[`${cat.key}${suffix}`] || '';
  const enUrl = `${SITE_URL}/en/shop/${cat.slug}.html`;
  const frUrl = `${SITE_URL}/fr/shop/${cat.slug}.html`;
  const canonicalUrl = code === 'fr' ? frUrl : enUrl;
  const homeUrl = code === 'fr' ? `${SITE_URL}/fr/index.html` : `${SITE_URL}/`;
  const list = shopCategoryItems(cat);
  const curatedHref = code === 'fr' ? '../curated-selection.html' : '../curatedselection';
  const legalHref = code === 'fr' ? '../mentions-legales.html' : '../legal-notice.html';
  const docTitle = get('DocTitle');
  const metaDesc = get('MetaDesc');
  const firstCover = list.find(item => item.cover);

  const breadcrumbs = [
    {name: strings.collectionBreadcrumbHome, url: homeUrl},
    {name: get('H1'), url: canonicalUrl}
  ];
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: get('H1'),
    description: metaDesc,
    url: canonicalUrl,
    inLanguage: code,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: list.length,
      itemListElement: list.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/${code}/collection/${item.id}.html`,
        name: itemTitle(item, code)
      }))
    }
  };

  const otherCats = ACTIVE_SHOP_CATEGORIES.filter(other => other.slug !== cat.slug);
  const paragraphs = ['Intro1', 'Intro2', 'Intro3'].map(get).filter(Boolean)
    .map(p => `<p>${p}</p>`).join('\n      ');

  const langSwitchHTML = `<li class="lang-switch">
          <select onchange="location.href=this.value" aria-label="{{ariaLanguage}}">
            <option value="../../en/shop/${cat.slug}.html"${code === 'en' ? ' selected' : ''}>EN</option>
            <option value="../../fr/shop/${cat.slug}.html"${code === 'fr' ? ' selected' : ''}>FR</option>
          </select>
        </li>`;

  const rawHtml = `<!DOCTYPE html>
<html lang="${code}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(metaDesc)}">
  <title>${escapeHtml(docTitle)}</title>
  <link rel="icon" href="../../favicon.svg" type="image/svg+xml">
  <link rel="icon" href="../../favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="../../apple-touch-icon.png">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="fr" href="${frUrl}">
  <link rel="alternate" hreflang="x-default" href="${enUrl}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Cook &amp; Collect">
  <meta property="og:locale" content="${code === 'fr' ? 'fr_FR' : 'en_GB'}">
  <meta property="og:title" content="${escapeHtml(docTitle)}">
  <meta property="og:description" content="${escapeHtml(metaDesc)}">
  <meta property="og:url" content="${canonicalUrl}">
  ${firstCover ? `<meta property="og:image" content="${SITE_URL}/${firstCover.cover}">` : ''}
  <link rel="stylesheet" href="../../css/style.css?v=26">
  <script type="application/ld+json">${JSON.stringify(itemList)}</script>
  ${renderBreadcrumbStructuredData(breadcrumbs)}
</head>
<body data-page="shop" data-shop-category="${cat.slug}">
  ${renderNav('home', langSwitchHTML, '../', curatedHref, '../guides/')}
  <main class="shop-page">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><a href="../index.html">${escapeHtml(strings.collectionBreadcrumbHome)}</a></li>
        <li aria-current="page">${escapeHtml(get('H1'))}</li>
      </ol>
    </nav>
    <h1 class="page-title">${escapeHtml(get('H1'))}</h1>
    <div class="shop-intro">
      ${paragraphs}
    </div>
    <p class="collection-related-links">
      ${cat.guides.map(g => `<a href="../guides/${g.file}">${escapeHtml(strings[g.labelKey])}</a>`).join(' &middot; ')}
    </p>
    <h2 class="shop-available-heading">${escapeHtml(strings.shopAvailableHeading)} <span class="shop-count">(${list.length})</span></h2>
    <div class="items-grid" data-list="category:${cat.slug}">
      ${renderItemGrid(list, strings, '../../', '../collection/', false, strings.noAvailable)}
    </div>
    <section class="shop-more">
      <h2>${escapeHtml(strings.shopMoreHeading)}</h2>
      <p>
        ${otherCats.map(other => `<a href="${other.slug}.html">${escapeHtml(strings[`${other.key}LinkLabel`])}</a>`).join(' &middot; ')}${otherCats.length ? ' &middot; ' : ''}<a href="../index.html">${escapeHtml(strings.shopAllAvailable)}</a> &middot; <a href="../sold.html">${escapeHtml(strings.shopSoldArchive)}</a>
      </p>
    </section>
  </main>
  ${CONTACT_BUTTONS}
  ${FOOTER}
  ${trackScriptTag('../../')}
</body>
</html>`;

  return substitute(rawHtml, {...strings, legalHref, privacyHref: '../privacy.html'});
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
  {tpl: 'privacy.html', out: 'privacy.html', page: 'privacy'}, // GDPR privacy notice (linked from every footer)
  {tpl: 'sold.html', out: 'sold.html', page: 'sold', inject: true}, // hidden / unlinked
  {tpl: 'studio.html', out: 'studio.html', page: 'studio'}, // listing studio: unlinked, noindex, not in sitemap
  // Visitor identification agent: English only (en/ folder), hidden launch: unlinked, noindex, not in sitemap.
  {tpl: 'identify.html', out: 'identify.html', page: 'identify', onlyDir: 'en'}
];

// Listing studio (studio.html): the chat page calls the separate identify-agent Worker API.
// Leave STUDIO_API_BASE empty until that Worker is deployed: the page then shows "not available yet".
// STUDIO_TURNSTILE_SITE_KEY is Cloudflare Turnstile's *public* site key (the secret stays on the Worker).
const STUDIO_API_BASE = process.env.STUDIO_API_BASE || '';
const STUDIO_TURNSTILE_SITE_KEY = process.env.STUDIO_TURNSTILE_SITE_KEY || '';
// The identification page uses the same Worker; its Turnstile public site key is optional until the page is linked.
const IDENTIFY_TURNSTILE_SITE_KEY = process.env.IDENTIFY_TURNSTILE_SITE_KEY || '';
const attr = value => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

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

function renderNav(activePage, langSwitch, hrefPrefix, ourSelectionHref, guidesHref) {
  const prefix = hrefPrefix || '';
  const cls = p => (p === activePage ? ' class="active"' : '');
  const selectionCls = activePage === 'curated' ? ' class="nav-highlight active"' : ' class="nav-highlight"';
  return `<nav>
    <div class="nav-inner">
      <a href="${prefix}index.html" class="logo">Cook &amp; Collect</a>
      <ul class="nav-links">
        <li><a href="${prefix}index.html"${cls('home')}>{{navCollection}}</a></li>
        <li><a href="${ourSelectionHref || `${prefix}index.html`}"${selectionCls}><span class="nav-star" aria-hidden="true">★</span>{{navOurSelection}}</a></li>
        <li><a href="${guidesHref || `${prefix}index.html`}"${cls('guides')}>{{navGuides}}</a></li>
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
    <p><a href="{{legalHref}}">{{legal}}</a> · <a href="{{privacyHref}}">{{privacy}}</a></p>
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
    if (pageDef.onlyDir !== undefined && pageDef.onlyDir !== locale.dir) return;
    const outFile = pageDef.page === 'legal' ? locale.legal : pageDef.out;
    // EN Curated Selection lives at the extension/hyphen-free /en/curatedselection
    // (see build report). FR keeps curated-selection.html unchanged.
    const enFile = pageDef.page === 'legal' ? 'legal-notice.html'
      : pageDef.page === 'curated' ? 'curatedselection'
      : pageDef.out;
    const frFile = pageDef.page === 'legal' ? 'mentions-legales.html' : pageDef.out;
    // A single-language page has no translation to switch to.
    const langSwitch = pageDef.onlyDir !== undefined ? '' : renderLangSwitch(locale.dir, locale.code, enFile, frFile);
    // Nav-only hrefs for the "Our Selection" / "Guides" entries (site-wide
    // nav — see build report). Mirrors the existing root->en/ crossover
    // pattern used for guideHref below.
    const ourSelectionHref = locale.dir === '' ? 'en/curatedselection'
      : locale.dir === 'en' ? 'curatedselection'
      : 'curated-selection.html';
    const guidesNavHref = locale.dir === '' ? 'en/guides/' : 'guides/';

    let html = tpl(pageDef.tpl)
      .replace('{{nav}}', renderNav(pageDef.page, langSwitch, '', ourSelectionHref, guidesNavHref))
      .replace('{{lightbox}}', tpl('lightbox.html'))
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
      privacyHref: 'privacy.html',
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
        // English home: the domain root "/" is the canonical URL (it holds the
        // Search Console history); en/index.html is a duplicate pointing to it.
        // "/" and fr/index.html are the reciprocal hreflang pair.
        const rootUrl = `${SITE_URL}/`;
        const frHomeUrl = `${SITE_URL}/fr/index.html`;
        const canonicalUrl = locale.dir === 'fr' ? frHomeUrl : rootUrl;
        const hreflang = [
          `<link rel="alternate" hreflang="en" href="${rootUrl}">`,
          `<link rel="alternate" hreflang="fr" href="${frHomeUrl}">`,
          `<link rel="alternate" hreflang="x-default" href="${rootUrl}">`
        ];
        const shopBase = locale.dir === '' ? 'en/shop/' : 'shop/';
        return {
          gridHTML: renderItemGrid(available, strings, base, collectionBase, false, strings.noAvailable),
          canonicalBlock: locale.dir === 'en'
            ? `<link rel="canonical" href="${rootUrl}">`
            : [`<link rel="canonical" href="${canonicalUrl}">`, ...hreflang].join('\n  '),
          structuredData: [
            renderSiteStructuredData(),
            renderCatalogListStructuredData(available, locale.dir === '' ? rootUrl : `${SITE_URL}/${locale.dir}/index.html`, strings.homeTitle, strings.homeMetaDesc, collectionBase)
          ].join('\n  '),
          collectionLinks: renderShopLinks(strings, shopBase)
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
      ...(pageDef.page === 'studio' ? {
        canonicalBlock: renderCanonicalBlock(locale.dir, 'studio.html'),
        studioApiBase: attr(STUDIO_API_BASE),
        studioTurnstileSiteKey: attr(STUDIO_TURNSTILE_SITE_KEY)
      } : {}),
      ...(pageDef.page === 'identify' ? {
        canonicalBlock: `<link rel="canonical" href="${SITE_URL}/en/identify.html">`,
        identifyApiBase: attr(STUDIO_API_BASE),
        identifyTurnstileSiteKey: attr(IDENTIFY_TURNSTILE_SITE_KEY),
        identifyShopItems: items.filter(item => !item.sold && item.cover).slice(0, 3).map(item =>
          `<a href="${itemHref(item, collectionBaseFor(locale.dir))}"><img src="${attr(selectionAssetUrl(item.cover, base))}" alt="${attr(item.title)}" loading="lazy"><span>${escapeHtml(item.title)}</span></a>`
        ).join('')
      } : {}),
      ...(pageDef.page === 'shipping' ? {canonicalBlock: renderCanonicalBlock(locale.dir, 'shipping.html')} : {}),
      ...(pageDef.page === 'privacy' ? {canonicalBlock: renderCanonicalBlock(locale.dir, 'privacy.html')} : {}),
      ...(pageDef.page === 'legal' ? {canonicalBlock: renderCanonicalBlock(locale.dir, 'legal-notice.html', 'mentions-legales.html')} : {})
    };
    // Pre-substitution copy, reused below to render the real
    // /en/curatedselection canonical file from the same nav/footer/langSwitch
    // markup without a second render pass (see build report).
    const preCtxHtml = html;
    html = substitute(html, ctx);

    // First-party, cookieless conversion events (js/track.js). The owner-only
    // studio and the hidden identification page are not measured.
    if (pageDef.page !== 'studio' && pageDef.page !== 'identify') {
      html = html.replace('</body>', `  ${trackScriptTag(base)}\n</body>`);
    }

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
    // hyphen/extension). The physical backing file is en/curatedselection.html
    // — GitHub Pages resolves the extensionless clean URL to it, mirroring
    // the already-verified /en/curated-selection → curated-selection.html
    // behavior. Rendered from the same pre-substitution markup as the
    // legacy en/curated-selection.html file above, but self-canonical with
    // full reciprocal hreflang, mirroring the other canonical pages.
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
      let canonicalHtml = substitute(preCtxHtml, canonicalCtx)
        .replace('</body>', `  ${trackScriptTag(base)}\n</body>`);
      if (pageDef.inject) {
        const collectionBase = collectionBaseFor(locale.dir);
        const head = `<script>window.__BASE__=${JSON.stringify(base)};window.__COLLECTION_BASE__=${JSON.stringify(collectionBase)};</script>${manifestScript}`;
        canonicalHtml = canonicalHtml.replace('</head>', `${head}\n</head>`);
      }
      fs.writeFileSync(path.join(outDir, 'curatedselection.html'), canonicalHtml);
      generated++;
    }
  });
});

/* ─── Permanent per-item pages: /en/collection/<id>.html + /fr/collection/<id>.html ───
   Every available AND sold item gets one per language, and the URL never
   changes when an item sells — only its status/badge/JSON-LD availability do.
   French pages use the item's "fr" text when info.json provides it. */
const collectionGuideHrefs = {
  guideCopperHref: 'guides/vintage-french-copper-cookware.html',
  guideLeCreusetHref: 'guides/vintage-le-creuset.html',
  guideDatingHref: 'guides/le-creuset-dating-guide.html',
  guideChampagneHref: 'guides/vintage-french-champagne-buckets.html',
  guideCastIronHref: 'guides/european-enamelled-cast-iron-makers.html'
};
['en', 'fr'].forEach(code => {
  const dir = path.join(__dirname, code, 'collection');
  fs.mkdirSync(dir, {recursive: true});
  items.forEach(item => {
    fs.writeFileSync(path.join(dir, `${item.id}.html`), renderCollectionPage(item, code, collectionGuideHrefs));
  });
});
console.log(`Generated ${items.length * 2} permanent collection page(s) in en/collection/ and fr/collection/.`);

/* ─── Shop collection landing pages: /en/shop/<slug>.html + /fr/shop/<slug>.html ─── */
['en', 'fr'].forEach(code => {
  const dir = path.join(__dirname, code, 'shop');
  fs.mkdirSync(dir, {recursive: true});
  // Pages of collections that fell below MIN_SHOP_ITEMS are removed, so no
  // thin page lingers; nothing links to them once inactive.
  const active = new Set(ACTIVE_SHOP_CATEGORIES.map(cat => `${cat.slug}.html`));
  fs.readdirSync(dir).filter(f => f.endsWith('.html') && !active.has(f))
    .forEach(f => fs.unlinkSync(path.join(dir, f)));
  ACTIVE_SHOP_CATEGORIES.forEach(cat => {
    fs.writeFileSync(path.join(dir, `${cat.slug}.html`), renderShopPage(cat, code));
  });
});
console.log(`Generated ${ACTIVE_SHOP_CATEGORIES.length * 2} shop collection page(s): ${ACTIVE_SHOP_CATEGORIES.map(c => c.slug).join(', ') || 'none'}.`);

/* ─── legacy-redirects.json ───
   Read by the identify-agent Worker (route cookandcollect.eu/item.html*,
   /en/item.html*, /fr/item.html*) to answer old item.html?id=<id> URLs with a
   301 to the same-language permanent page. Unknown ids are not listed, so the
   Worker passes them through to the legacy page instead of guessing. Generated
   at build time and deployed with the site (gitignored, like manifest.json). */
const legacyRedirects = {
  version: 1,
  items: Object.fromEntries(items.map(item => [item.id, {
    en: `/en/collection/${item.id}.html`,
    fr: `/fr/collection/${item.id}.html`
  }]))
};
fs.writeFileSync(path.join(__dirname, 'legacy-redirects.json'), JSON.stringify(legacyRedirects));

/* ─── sitemap.xml + robots.txt ───
   Canonical, indexable URLs only: no root duplicates (except "/", the
   canonical English home), no en/index.html (canonicalised to "/"), no legacy
   item.html?id= query URLs. */
const GUIDE_FILES = [
  'e-dehillerin-copper-cookware.html',
  'european-enamelled-cast-iron-makers.html',
  'french-design-decorative-objects.html',
  'le-creuset-dating-guide.html',
  'lecellier-cuivralec.html',
  'mauviel-vintage-copper-cookware.html',
  'vintage-french-champagne-buckets.html',
  'vintage-french-copper-cookware.html',
  'vintage-le-creuset.html'
];

const sitemapUrls = [];
// English home is "/"; French home is fr/index.html.
sitemapUrls.push(`${SITE_URL}/`);
sitemapUrls.push(`${SITE_URL}/fr/index.html`);
['en', 'fr'].forEach(dir => {
  ['sold.html', 'about.html', 'shipping.html'].forEach(file => {
    sitemapUrls.push(`${SITE_URL}/${dir}/${file}`);
  });
  // Curated Selection: EN canonical is the hyphen/extension-free
  // /en/curatedselection; the legacy en/curated-selection.html duplicate is
  // intentionally excluded from the sitemap (non-canonical, kept live only
  // for existing links). FR is unchanged.
  sitemapUrls.push(`${SITE_URL}/${dir}/${dir === 'en' ? 'curatedselection' : 'curated-selection.html'}`);
  sitemapUrls.push(`${SITE_URL}/${dir}/${dir === 'fr' ? 'mentions-legales.html' : 'legal-notice.html'}`);
  sitemapUrls.push(`${SITE_URL}/${dir}/privacy.html`);
  // Guides landing page: canonical is the directory-index trailing-slash
  // form (matches renderGuideIndexHead's canonical in build-guides.js), not
  // guides/index.html, so the sitemap doesn't create a duplicate URL.
  sitemapUrls.push(`${SITE_URL}/${dir}/guides/`);
  GUIDE_FILES.forEach(file => sitemapUrls.push(`${SITE_URL}/${dir}/guides/${file}`));
});
['en', 'fr'].forEach(code => {
  items.forEach(item => sitemapUrls.push(`${SITE_URL}/${code}/collection/${item.id}.html`));
  ACTIVE_SHOP_CATEGORIES.forEach(cat => sitemapUrls.push(`${SITE_URL}/${code}/shop/${cat.slug}.html`));
});

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
