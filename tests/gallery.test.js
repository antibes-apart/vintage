const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');

function image(src) {
  const classes = new Set();
  return {
    src,
    style: {},
    classList: {
      add: (...names) => names.forEach(name => classes.add(name)),
      remove: (...names) => names.forEach(name => classes.delete(name)),
      contains: name => classes.has(name),
      toggle: (name, active) => active ? classes.add(name) : classes.delete(name)
    }
  };
}

function gallery(sources, fullSizes = []) {
  const main = sources.length ? image(sources[0]) : null;
  const thumbs = sources.length > 1 ? sources.map((src, i) => {
    const thumb = image(src);
    thumb.dataset = fullSizes[i] ? { full: fullSizes[i] } : {};
    return thumb;
  }) : [];
  const lightbox = image('');
  const lightboxImg = image('');
  const nodes = { mainImage: main, lightbox, lightboxImg };
  const body = { dataset: { page: 'collection-item' }, style: {} };
  const context = vm.createContext({
    window: {},
    document: {
      documentElement: { lang: 'en' },
      body,
      getElementById: id => nodes[id],
      querySelectorAll: () => thumbs,
      addEventListener() {}
    },
    fetch: () => { throw new Error('Permanent galleries must not fetch the manifest'); }
  });
  vm.runInContext(app, context);
  return { context, main, thumbs, lightbox, lightboxImg, body };
}

test('permanent pages bootstrap all photos from the rendered gallery', () => {
  const { context, main, thumbs } = gallery(['cover.jpg', '2.jpg', '3.jpg']);
  assert.deepEqual(Array.from(context.window._galleryImages), ['cover.jpg', '2.jpg', '3.jpg']);
  assert.equal(context.window._currentImageIndex, 0);
  context.switchImage(2);
  assert.equal(main.src, '3.jpg');
  assert.equal(thumbs[2].classList.contains('active'), true);
  context.switchImage(0);
  assert.equal(main.src, 'cover.jpg');
  assert.equal(thumbs[2].classList.contains('active'), false);
  assert.equal(thumbs[0].classList.contains('active'), true);
});

test('lightbox navigation wraps and keeps the main photo and thumbnail in sync', () => {
  const { context, main, thumbs, lightbox, lightboxImg, body } = gallery(['cover.jpg', '2.jpg']);
  context.openLightbox(0);
  assert.equal(lightbox.classList.contains('open'), true);
  assert.equal(body.style.overflow, 'hidden');
  lightboxImg.classList.add('zoomed');
  lightboxImg.style.transform = 'scale(2.5)';
  context.navigateLightbox(-1);
  assert.equal(main.src, '2.jpg');
  assert.equal(lightboxImg.src, '2.jpg');
  assert.equal(thumbs[1].classList.contains('active'), true);
  assert.equal(lightboxImg.classList.contains('zoomed'), false);
  assert.equal(lightboxImg.style.transform, '');
  context.navigateLightbox(1);
  assert.equal(main.src, 'cover.jpg');
  context.closeLightbox();
  assert.equal(lightbox.classList.contains('open'), false);
  assert.equal(body.style.overflow, '');
});

test('single-photo galleries work without thumbnails', () => {
  const { context, main, thumbs, lightboxImg } = gallery(['cover.jpg']);
  assert.equal(thumbs.length, 0);
  assert.deepEqual(Array.from(context.window._galleryImages), ['cover.jpg']);
  context.openLightbox(0);
  context.navigateLightbox(1);
  assert.equal(main.src, 'cover.jpg');
  assert.equal(lightboxImg.src, 'cover.jpg');
});

test('thumbnails can point to a larger photo than they display (archive pages)', () => {
  const { context, main, lightboxImg } = gallery(['1-small.jpg', '2-small.jpg'], ['1-large.jpg', '2-large.jpg']);
  assert.deepEqual(Array.from(context.window._galleryImages), ['1-large.jpg', '2-large.jpg']);
  context.switchImage(1);
  assert.equal(main.src, '2-large.jpg');
  context.openLightbox(1);
  assert.equal(lightboxImg.src, '2-large.jpg');
});

test('photo-free galleries do not open or navigate an empty lightbox', () => {
  const { context, lightbox } = gallery([]);
  context.openLightbox(0);
  context.navigateLightbox(1);
  assert.equal(lightbox.classList.contains('open'), false);
  assert.equal(context.window._currentImageIndex, 0);
});

test('generated permanent pages wire every photo, including the cover', () => {
  const directory = path.join(root, 'en/collection');
  for (const file of fs.readdirSync(directory).filter(file => file.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(directory, file), 'utf8');
    assert.match(html, /id="lightbox"/, file);
    assert.match(html, /src="\.\.\/\.\.\/js\/app\.js\?v=2"/, file);
    assert.doesNotMatch(html, /\{\{\w+\}\}/, file);
    const main = html.match(/<img src="([^"]+)"[^>]*id="mainImage"[^>]*>/);
    if (!main) continue;
    assert.match(main[0], /onclick="openLightbox\(window\._currentImageIndex \|\| 0\)"/, file);
    const thumbnails = html.match(/<div class="thumbnails">([\s\S]*?)<\/div>/);
    if (!thumbnails) continue;
    const photos = [...thumbnails[1].matchAll(/<img src="([^"]+)"[^>]*onclick="switchImage\((\d+)\)"/g)];
    assert.ok(photos.length > 1, file);
    assert.equal(photos[0][1], main[1], file);
    assert.match(photos[0][0], /class="active"/, file);
    photos.forEach((photo, index) => assert.equal(Number(photo[2]), index, file));
  }
});
