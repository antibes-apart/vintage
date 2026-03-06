const fs = require('fs');
const path = require('path');

module.exports = async ({github, context, core}) => {
  const body = context.payload.issue.body;

  // Parse issue form fields
  function getField(name) {
    const regex = new RegExp(`### ${name}\\s*\\n\\s*([\\s\\S]*?)(?=\\n### |$)`, 'i');
    const match = body.match(regex);
    return match ? match[1].trim() : '';
  }

  const title = getField('Item Title');
  const price = getField('Price');
  const description = getField('Description');
  const coverSection = getField('Cover Photo \\(main photo for the grid\\)');
  const gallerySection = getField('Gallery Photos \\(additional photos\\)');

  if (!title || !price) {
    core.setFailed('Title and Price are required.');
    return;
  }

  const issueNumber = context.payload.issue.number;

  // If reopened, find and remove the folder created by the previous run of this issue
  const itemsRoot = 'items';
  if (fs.existsSync(itemsRoot)) {
    for (const folder of fs.readdirSync(itemsRoot)) {
      const infoPath = path.join(itemsRoot, folder, 'info.json');
      if (fs.existsSync(infoPath)) {
        try {
          const existing = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
          if (existing.issueNumber === issueNumber) {
            console.log(`Removing previous folder "${folder}" from issue #${issueNumber}`);
            fs.rmSync(path.join(itemsRoot, folder), {recursive: true, force: true});
          }
        } catch (e) { /* ignore parse errors */ }
      }
    }
  }

  // Create folder name from title (slug)
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);

  const itemDir = path.join('items', slug);

  if (fs.existsSync(itemDir)) {
    core.setFailed(`Item folder "${slug}" already exists.`);
    return;
  }

  fs.mkdirSync(itemDir, {recursive: true});

  // Save info.json
  const info = {title, price, issueNumber};
  if (description && description !== '_No response_') {
    info.description = description;
  }
  fs.writeFileSync(path.join(itemDir, 'info.json'), JSON.stringify(info, null, 2));

  // Extract image URLs from markdown
  function extractImageUrls(text) {
    if (!text || text === '_No response_') return [];
    const urls = [];
    const mdRegex = /!\[.*?\]\((https:\/\/[^\s)]+)\)/g;
    let match;
    while ((match = mdRegex.exec(text)) !== null) {
      urls.push(match[1]);
    }
    // Also match plain URLs that look like images
    const plainUrls = /(?:^|\s)(https:\/\/github\.com\/user-attachments\/assets\/[^\s)]+)/g;
    while ((match = plainUrls.exec(text)) !== null) {
      if (!urls.includes(match[1])) {
        urls.push(match[1]);
      }
    }
    return urls;
  }

  const coverUrls = extractImageUrls(coverSection);
  const galleryUrls = extractImageUrls(gallerySection);

  // Download image, detect extension from content-type, save with correct extension
  async function downloadImage(url, baseFilePath) {
    const headers = {};
    // GitHub attachment URLs need authentication
    if (url.includes('github.com') || url.includes('githubusercontent.com')) {
      const token = process.env.GITHUB_TOKEN;
      if (token) {
        headers['Authorization'] = `token ${token}`;
      }
    }
    const response = await fetch(url, {headers, redirect: 'follow'});
    if (!response.ok) throw new Error(`Failed to download ${url}: ${response.status}`);
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      throw new Error(`Got HTML instead of image for ${url} — URL may require auth or is invalid`);
    }
    const ext = getExtFromContentType(contentType) || getExtFromUrl(url);
    const finalPath = baseFilePath + ext;
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(finalPath, buffer);
    console.log(`Downloaded: ${finalPath} (${buffer.length} bytes, ${contentType})`);
  }

  const MIME_TO_EXT = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/avif': '.avif',
    'image/svg+xml': '.svg',
    'image/bmp': '.bmp',
  };

  function getExtFromContentType(contentType) {
    for (const [mime, ext] of Object.entries(MIME_TO_EXT)) {
      if (contentType.includes(mime)) return ext;
    }
    return null;
  }

  function getExtFromUrl(url) {
    const urlPath = new URL(url).pathname;
    const ext = path.extname(urlPath).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'].includes(ext)) return ext;
    return '.jpg';
  }

  let downloadCount = 0;

  // Download cover photo
  if (coverUrls.length > 0) {
    await downloadImage(coverUrls[0], path.join(itemDir, 'cover'));
    downloadCount++;
  }

  // Download gallery photos
  for (let i = 0; i < galleryUrls.length; i++) {
    await downloadImage(galleryUrls[i], path.join(itemDir, `${i + 2}`));
    downloadCount++;
  }

  // Export for later steps
  core.exportVariable('ITEM_SLUG', slug);
  core.exportVariable('ITEM_TITLE', title);
  core.exportVariable('DOWNLOAD_COUNT', downloadCount.toString());
};
