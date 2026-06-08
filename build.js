const fs = require('fs');
const path = require('path');

const ITEMS_DIR = path.join(__dirname, 'items');
const OUTPUT = path.join(__dirname, 'manifest.json');
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.bmp', '.svg']);
const FEATURED_ITEM_ORDER = [
  'rare-vintage-le-creuset-white-enamel-cast-iron-coc',
  'vintage-le-creuset-cast-iron-cocotte-rare-floral-d'
];
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

const items = scanItems();
const manifest = {items, categories: CATEGORIES};
fs.writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2));

// Inject manifest into HTML files so they work without a server (file:// protocol)
const manifestScript = `<script>window.__MANIFEST__=${JSON.stringify(manifest)};</script>`;
const htmlFiles = ['index.html', 'sold.html', 'item.html'];

htmlFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf-8');
  // Remove any previously injected manifest
  html = html.replace(/<script>window\.__MANIFEST__=.*?<\/script>\n?/g, '');
  // Inject before </head>
  html = html.replace('</head>', `${manifestScript}\n</head>`);
  fs.writeFileSync(filePath, html);
});

console.log(`Generated manifest.json - ${items.length} item(s) (${items.filter(i => i.sold).length} sold)`);
