const fs = require('fs');
const path = require('path');

const ITEMS_DIR = path.join(__dirname, 'items');
const OUTPUT = path.join(__dirname, 'manifest.json');
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.bmp', '.svg']);

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

    return {
      id: folder.name,
      title: info.title || folder.name,
      price: info.price || '',
      description: info.description || '',
      sold: info.sold === true,
      cover: cover ? `items/${folder.name}/${cover}` : (allImages[0] || null),
      images: allImages
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title));
}

const items = scanItems();
fs.writeFileSync(OUTPUT, JSON.stringify({items}, null, 2));

// Inject manifest into HTML files so they work without a server (file:// protocol)
const manifestScript = `<script>window.__MANIFEST__=${JSON.stringify({items})};</script>`;
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
