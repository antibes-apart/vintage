const fs = require('fs');
const path = require('path');
const i18n = require('./i18n.js');

const ITEMS_DIR = path.join(__dirname, 'items');
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const OUTPUT = path.join(__dirname, 'manifest.json');
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.bmp', '.svg']);
const FEATURED_ITEM_ORDER = [
  'rare-vintage-le-creuset-white-enamel-cast-iron-coc',
  'vintage-le-creuset-cast-iron-cocotte-rare-floral-d'
];

// Temporary allowlist for the Préfecture (reseller registration): when non-empty, only
// these item ids are published. Set back to [] to show the full collection again.
const VISIBLE_ONLY = [
  'le-creuset-cocotte-ovale-vintage-fonte-maille-oran',
  'le-creuset-26-cast-iron-dutch-oven-cream-ivory-mad',
  'vintage-cousances-cast-iron-dutch-oven-size-g-yell',
  'le-creuset-enameled-cast-iron-baking-dish-no-18-vi',
  'emile-henry-gastron-ceramic-plate-made-in-france-y',
  'le-creuset-cast-iron-mini-cocotte-terrine-size-14-',
  'le-creuset-stoneware-mini-oval-cocotte-red-with-li',
  'le-creuset-enameled-cast-iron-baking-dish-no-28',
  'le-creuset-mini-cast-iron-cocotte-blue-with-lid',
  'le-creuset-mini-cast-iron-cocotte-red-with-lid',
  'le-creuset-cast-iron-casserole-with-lid-model-no-1',
  'le-creuset-cast-iron-skillet-16-cm-vintage-model',
  'vintage-le-creuset-enameled-cast-iron-terrine-no-3',
  'vintage-french-cast-iron-kitchen-set-rooster-paper',
  'laurent-perrier-champagne-cooler-stainless-steel-i'
];

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

const allItems = scanItems();
const items = VISIBLE_ONLY_SET.size > 0
  ? allItems.filter(item => VISIBLE_ONLY_SET.has(item.id))
  : allItems;
const manifest = {items, categories: CATEGORIES};
fs.writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2));

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
  {tpl: 'shipping.html', out: 'shipping.html', page: 'shipping'},
  {tpl: 'about.html', out: 'about.html', page: 'about'},
  {tpl: 'legal.html', out: null, page: 'legal'}, // out resolved per-locale (legal filename)
  {tpl: 'sold.html', out: 'sold.html', page: 'sold', inject: true} // hidden / unlinked
];

// Set to true to restore the detailed shipping cost tables on the Shipping page.
// While false, that page shows only a "contact us for a quote" message.
const SHIPPING_DETAILS_VISIBLE = false;

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

function renderNav(activePage, langSwitch) {
  const cls = p => (p === activePage ? ' class="active"' : '');
  return `<nav>
    <div class="nav-inner">
      <a href="index.html" class="logo">Vintage Collection</a>
      <ul class="nav-links">
        <li><a href="index.html"${cls('home')}>{{navCollection}}</a></li>
        <li><a href="about.html"${cls('about')}>{{navAbout}}</a></li>
        <li><a href="shipping.html"${cls('shipping')}>{{navShipping}}</a></li>
        ${langSwitch}
      </ul>
    </div>
  </nav>`;
}

const FOOTER = `<footer>
    <p>&copy; 2026 Vintage Collection</p>
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
    const enFile = pageDef.page === 'legal' ? 'legal-notice.html' : pageDef.out;
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
      legalHref: locale.legal
    };
    html = substitute(html, ctx);

    if (pageDef.inject) {
      const head = `<script>window.__BASE__=${JSON.stringify(base)};</script>${manifestScript}`;
      html = html.replace('</head>', `${head}\n</head>`);
    }

    const outDir = path.join(__dirname, locale.dir);
    fs.mkdirSync(outDir, {recursive: true});
    fs.writeFileSync(path.join(outDir, outFile), html);
    generated++;
  });
});

console.log(`Generated manifest.json - ${items.length} item(s) (${items.filter(i => i.sold).length} sold)`);
console.log(`Generated ${generated} page(s) across ${LOCALES.length} locale target(s).`);
