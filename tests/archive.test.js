const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { buildArchive, validateObject } = require('../build-archive.js');

const FIXTURES = path.join(__dirname, 'fixtures', 'archive');
const ROBOTS = 'User-agent: *\nAllow: /\n\nSitemap: https://cookandcollect.eu/sitemap.xml\n';

// A small stand-in for manifest.json (normally written by build.js just before build-archive.js runs).
const MANIFEST = {
  items: [
    { id: 'fixture-le-creuset-cocotte', title: 'Le Creuset Cocotte 22', category: 'Cocottes', cover: 'items/fixture-le-creuset-cocotte/cover.jpg' },
    { id: 'fixture-cousances-skillet', title: 'Cousances Skillet', category: 'Skillets & Pans', cover: 'items/fixture-cousances-skillet/cover.jpg' },
    { id: 'fixture-cousances-sold', title: 'Cousances Cocotte', category: 'Cocottes', sold: true, cover: 'items/fixture-cousances-sold/cover.jpg' },
    { id: 'fixture-cocotte-generic', title: 'Vintage Enamel Cocotte', category: 'Cocottes', cover: 'items/fixture-cocotte-generic/cover.jpg' },
    { id: 'fixture-staub-cocotte-for-sale', title: 'Staub Cocotte', category: 'Cocottes', cover: 'items/fixture-staub-cocotte-for-sale/cover.jpg' },
    { id: 'fixture-copper-pan', title: 'Copper Saute Pan', category: 'Copper', cover: 'items/fixture-copper-pan/cover.jpg' },
    { id: 'fixture-fondue', title: 'Fondue Set', category: 'Fondues' }
  ]
};

function site(sourceDir = FIXTURES, manifest = MANIFEST, imageBase) {
  const outRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'archive-test-'));
  fs.writeFileSync(path.join(outRoot, 'robots.txt'), ROBOTS);
  const result = buildArchive({ sourceDir, outRoot, manifest, ...(imageBase ? { imageBase } : {}) });
  const read = file => fs.readFileSync(path.join(outRoot, file), 'utf8');
  return { outRoot, result, read, exists: file => fs.existsSync(path.join(outRoot, file)) };
}

function copyFixtures() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'archive-src-'));
  fs.cpSync(FIXTURES, dir, { recursive: true });
  return dir;
}

function editObject(sourceDir, slug, change) {
  const file = path.join(sourceDir, slug, 'info.json');
  const object = JSON.parse(fs.readFileSync(file, 'utf8'));
  change(object);
  fs.writeFileSync(file, JSON.stringify(object));
}

function jsonLd(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
}

const COUSANCES = 'cousances-oval-cocotte-orange';
const LE_CREUSET = 'le-creuset-round-cocotte-flame';

test('each object gets an English and a French page plus a hub in each language', () => {
  const { exists, result } = site();
  for (const lang of ['en', 'fr']) {
    assert.ok(exists(`${lang}/archive/index.html`), `${lang} hub`);
    assert.ok(exists(`${lang}/archive/${COUSANCES}.html`));
    assert.ok(exists(`${lang}/archive/${LE_CREUSET}.html`));
  }
  assert.equal(result.pages, 2);
});

test('an object that is also a shop item gets no archive page; the hub links to the shop page', () => {
  const { exists, read } = site();
  assert.equal(exists('en/archive/staub-cocotte-black.html'), false);
  assert.equal(exists('fr/archive/staub-cocotte-black.html'), false);
  assert.match(read('en/archive/index.html'), /href="\.\.\/collection\/fixture-staub-cocotte-for-sale\.html"/);
  assert.match(read('fr/archive/index.html'), /href="\.\.\/item\.html\?id=fixture-staub-cocotte-for-sale"/);
});

test('an object page has its own canonical URL and an English/French pair', () => {
  const { read } = site();
  const en = read(`en/archive/${COUSANCES}.html`);
  const fr = read(`fr/archive/${COUSANCES}.html`);
  assert.match(en, /<html lang="en">/);
  assert.match(fr, /<html lang="fr">/);
  assert.match(en, new RegExp(`<link rel="canonical" href="https://cookandcollect\\.eu/en/archive/${COUSANCES}\\.html">`));
  assert.match(fr, new RegExp(`<link rel="canonical" href="https://cookandcollect\\.eu/fr/archive/${COUSANCES}\\.html">`));
  for (const html of [en, fr]) {
    assert.match(html, new RegExp(`hreflang="en" href="https://cookandcollect\\.eu/en/archive/${COUSANCES}\\.html"`));
    assert.match(html, new RegExp(`hreflang="fr" href="https://cookandcollect\\.eu/fr/archive/${COUSANCES}\\.html"`));
    assert.match(html, /hreflang="x-default"/);
    assert.doesNotMatch(html, /\{\{\w+\}\}/);
  }
  assert.match(en, new RegExp(`<option value="\\.\\./\\.\\./fr/archive/${COUSANCES}\\.html">FR</option>`));
});

test('an object page shows the title, photos, markings, dimensions, condition and the not-for-sale note', () => {
  const { read } = site();
  const en = read(`en/archive/${COUSANCES}.html`);
  assert.match(en, /<title>Sample: orange oval Cousances cocotte, marked 29 \| Cook &amp; Collect<\/title>/);
  assert.match(en, /<h1[^>]*>Sample: orange oval Cousances cocotte, marked 29<\/h1>/);
  assert.match(en, /<meta name="description" content="Sample archive record: an orange oval Cousances cocotte/);
  assert.match(en, /COUSANCES/);
  assert.match(en, /<th scope="row">Length<\/th>\s*<td>31\.5 cm<\/td>/);
  assert.match(read(`fr/archive/${COUSANCES}.html`), /<th scope="row">Longueur<\/th>\s*<td>31,5 cm<\/td>/);
  assert.match(en, /Sample: light marks of use on the base/);
  assert.match(en, /class="archive-not-for-sale"/);
  assert.doesNotMatch(en, /€|item-price|available-badge/, 'no price or availability');
});

test('photos come from the image host, with the small size in the thumbnails and the large one for the gallery', () => {
  const { read } = site();
  const en = read(`en/archive/${COUSANCES}.html`);
  const host = `https://images.cookandcollect.eu/archive/${COUSANCES}`;
  assert.match(en, new RegExp(`<img src="${host}/1-1600\\.jpg" alt="Sample: orange oval Cousances cocotte with its lid, side view" class="main-image" id="mainImage" width="400" height="300"`));
  assert.match(en, new RegExp(`<img src="${host}/2-800\\.jpg" data-full="${host}/2-1600\\.jpg" alt="Sample: COUSANCES marking cast into the base" width="200" height="150" class="" onclick="switchImage\\(1\\)" loading="lazy">`));
  assert.match(en, /id="lightbox"/);
  assert.match(en, /<body data-page="collection-item">/);
  assert.match(en, /src="\.\.\/\.\.\/js\/app\.js\?v=3"/);
  // A photo without a small size uses the large one in its thumbnail.
  const lc = read(`en/archive/${LE_CREUSET}.html`);
  assert.match(lc, new RegExp(`<img src="https://images\\.cookandcollect\\.eu/archive/${LE_CREUSET}/2-1600\\.jpg" data-full="https://images\\.cookandcollect\\.eu/archive/${LE_CREUSET}/2-1600\\.jpg"`));
});

test('the image host can be overridden for local previews', () => {
  const { read } = site(FIXTURES, MANIFEST, '/tests/fixtures/archive-images/');
  assert.match(read(`en/archive/${COUSANCES}.html`), new RegExp(`src="/tests/fixtures/archive-images/archive/${COUSANCES}/1-1600\\.jpg"`));
});

test('breadcrumbs lead back to the collection and the archive hub', () => {
  const { read } = site();
  const crumbs = read(`en/archive/${COUSANCES}.html`).match(/<nav class="breadcrumbs" aria-label="Breadcrumb">\s*<ol>([\s\S]*?)<\/ol>/);
  assert.ok(crumbs);
  const items = crumbs[1].match(/<li[\s>]/g);
  assert.equal(items.length, 3);
  assert.equal((crumbs[1].match(/aria-current="page"/g) || []).length, 1);
  assert.deepEqual([...crumbs[1].matchAll(/href="([^"]+)"/g)].map(m => m[1]), ['../index.html', 'index.html']);
});

test('structured data is an article with its photos and a breadcrumb, never a product for sale', () => {
  const { read } = site();
  const [article, breadcrumb] = jsonLd(read(`en/archive/${COUSANCES}.html`));
  assert.equal(article['@type'], 'Article');
  assert.equal(article.inLanguage, 'en');
  assert.equal(article.headline, 'Sample: orange oval Cousances cocotte, marked 29');
  assert.equal(article.datePublished, '2026-10-20');
  assert.equal(article.dateModified, '2026-10-28');
  assert.equal(article.image.length, 4);
  assert.deepEqual(article.image[0], {
    '@type': 'ImageObject', url: `https://images.cookandcollect.eu/archive/${COUSANCES}/1-1600.jpg`,
    width: 400, height: 300, caption: 'Sample: orange oval Cousances cocotte with its lid, side view'
  });
  assert.equal(breadcrumb['@type'], 'BreadcrumbList');
  assert.equal(breadcrumb.itemListElement.length, 3);
  const html = read(`en/archive/${COUSANCES}.html`);
  assert.doesNotMatch(html, /"@type":"(Product|Offer)"/);
});

test('"Available now" shows up to four shop items for sale: same brand first, then the same kind of object', () => {
  const { read } = site();
  const block = read(`en/archive/${COUSANCES}.html`).match(/<section class="archive-available"[\s\S]*?<\/section>/)[0];
  const links = [...block.matchAll(/<a href="([^"]+)" class="item-card">/g)].map(m => m[1]);
  assert.deepEqual(links, [
    '../collection/fixture-cousances-skillet.html',
    '../collection/fixture-le-creuset-cocotte.html',
    '../collection/fixture-cocotte-generic.html',
    '../collection/fixture-staub-cocotte-for-sale.html'
  ]);
  assert.doesNotMatch(block, /fixture-cousances-sold/, 'sold items are never shown');
  assert.doesNotMatch(block, /card-price/, 'no prices on archive pages');
  assert.match(block, /href="\.\.\/index\.html"/, 'link to the whole collection');
  const fr = read(`fr/archive/${COUSANCES}.html`).match(/<section class="archive-available"[\s\S]*?<\/section>/)[0];
  assert.match(fr, /href="\.\.\/item\.html\?id=fixture-cousances-skillet"/);
});

test('"Available now" falls back to the latest shop items when nothing matches', () => {
  const source = copyFixtures();
  editObject(source, COUSANCES, object => { object.brand = 'other'; object.category = 'Terrines'; });
  const { read } = site(source);
  const block = read(`en/archive/${COUSANCES}.html`).match(/<section class="archive-available"[\s\S]*?<\/section>/)[0];
  const links = [...block.matchAll(/<a href="([^"]+)" class="item-card">/g)].map(m => m[1]);
  assert.deepEqual(links, ['../collection/fixture-le-creuset-cocotte.html', '../collection/fixture-cousances-skillet.html',
    '../collection/fixture-cocotte-generic.html', '../collection/fixture-staub-cocotte-for-sale.html']);
});

test('"Available now" is left out when the shop has nothing for sale', () => {
  const { read } = site(FIXTURES, { items: [{ id: 'x', title: 'Cousances', category: 'Cocottes', sold: true }] });
  const html = read(`en/archive/${COUSANCES}.html`);
  assert.doesNotMatch(html, /class="archive-available"/);
  assert.match(html, /href="\.\.\/index\.html"/, 'the collection stays one click away');
});

test('object pages link to the related guide when one exists, and to similar archive objects', () => {
  const { read } = site();
  assert.match(read(`en/archive/${LE_CREUSET}.html`), /<p class="archive-guide-link">[\s\S]*?href="\.\.\/guides\/vintage-le-creuset\.html"/);
  assert.doesNotMatch(read(`en/archive/${COUSANCES}.html`), /class="archive-guide-link"/, 'no guide covers Cousances yet');
  const source = copyFixtures();
  editObject(source, LE_CREUSET, object => { object.brand = 'cousances'; });
  const similar = site(source).read(`en/archive/${COUSANCES}.html`).match(/<section class="archive-similar"[\s\S]*?<\/section>/)[0];
  assert.match(similar, new RegExp(`href="${LE_CREUSET}\\.html"`));
  assert.doesNotMatch(similar, new RegExp(`href="${COUSANCES}\\.html"`), 'an object is not similar to itself');
});

test('the hub groups objects by brand in a fixed order with anchors and links to the collection', () => {
  const { read } = site();
  const hub = read('en/archive/index.html');
  const sections = [...hub.matchAll(/<section class="archive-group" id="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(sections, ['le-creuset', 'cousances', 'staub'], 'empty brand sections are left out');
  assert.match(hub, new RegExp(`href="${COUSANCES}\\.html"`));
  assert.match(hub, /class="archive-hub-banner"[\s\S]*?href="\.\.\/index\.html"/);
  assert.match(hub, /<link rel="canonical" href="https:\/\/cookandcollect\.eu\/en\/archive\/">/);
  const [collection] = jsonLd(hub);
  assert.equal(collection['@type'], 'CollectionPage');
  assert.equal(collection.mainEntity['@type'], 'ItemList');
  assert.equal(collection.mainEntity.itemListElement.length, 2, 'only objects with their own archive page');
  assert.match(hub, /loading="lazy"/);
  assert.match(read('fr/archive/index.html'), /<html lang="fr">/);
});

test('the archive sitemap lists hubs and pages with their photos, and robots.txt names it once', () => {
  const { read, outRoot } = site();
  const xml = read('sitemap-archive.xml');
  assert.match(xml, /xmlns:image="http:\/\/www\.google\.com\/schemas\/sitemap-image\/1\.1"/);
  for (const url of ['en/archive/', 'fr/archive/', `en/archive/${COUSANCES}.html`, `fr/archive/${LE_CREUSET}.html`]) {
    assert.match(xml, new RegExp(`<loc>https://cookandcollect\\.eu/${url.replace(/\./g, '\\.')}</loc>`));
  }
  assert.doesNotMatch(xml, /staub-cocotte-black/);
  assert.match(xml, new RegExp(`<lastmod>2026-10-28</lastmod>`));
  assert.match(xml, new RegExp(`<image:loc>https://images\\.cookandcollect\\.eu/archive/${COUSANCES}/1-1600\\.jpg</image:loc>`));
  const robots = read('robots.txt');
  assert.match(robots, /Sitemap: https:\/\/cookandcollect\.eu\/sitemap\.xml/);
  assert.equal((robots.match(/Sitemap: https:\/\/cookandcollect\.eu\/sitemap-archive\.xml/g) || []).length, 1);
  buildArchive({ sourceDir: FIXTURES, outRoot, manifest: MANIFEST });
  assert.equal((read('robots.txt').match(/sitemap-archive\.xml/g) || []).length, 1, 'a second build adds no duplicate line');
});

test('text from info.json is escaped in the page and in the structured data', () => {
  const source = copyFixtures();
  editObject(source, COUSANCES, object => {
    object.en.title = 'Cocotte <script>alert(1)</script> & lid';
    object.en.condition = '</script><img src=x onerror=alert(2)>';
  });
  const html = site(source).read(`en/archive/${COUSANCES}.html`);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.match(html, /Cocotte &lt;script&gt;alert\(1\)&lt;\/script&gt; &amp; lid/);
  assert.doesNotMatch(html, /<img src=x/);
  assert.equal(jsonLd(html)[0].headline, 'Cocotte <script>alert(1)</script> & lid');
});

test('removing an object removes its pages; with no objects nothing is published', () => {
  const source = copyFixtures();
  const first = site(source);
  fs.rmSync(path.join(source, LE_CREUSET), { recursive: true });
  buildArchive({ sourceDir: source, outRoot: first.outRoot, manifest: MANIFEST });
  assert.equal(first.exists(`en/archive/${LE_CREUSET}.html`), false);
  assert.equal(first.exists(`en/archive/${COUSANCES}.html`), true);

  const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'archive-empty-'));
  buildArchive({ sourceDir: empty, outRoot: first.outRoot, manifest: MANIFEST });
  assert.equal(first.exists('en/archive'), false);
  assert.equal(first.exists('fr/archive'), false);
  assert.equal(first.exists('sitemap-archive.xml'), false);
  assert.doesNotMatch(first.read('robots.txt'), /sitemap-archive/);
  // A missing source folder is the same as an empty archive.
  const none = site(path.join(empty, 'does-not-exist'));
  assert.equal(none.result.pages, 0);
  assert.equal(none.exists('en/archive'), false);
});

test('invalid records stop the build with the file and the field named', () => {
  const valid = JSON.parse(fs.readFileSync(path.join(FIXTURES, COUSANCES, 'info.json'), 'utf8'));
  const check = (change, pattern) => {
    const object = structuredClone(valid);
    change(object);
    assert.throws(() => validateObject(object, COUSANCES), pattern);
  };
  check(o => { o.slug = 'other'; }, /slug must match the folder name/);
  check(o => { o.brand = 'Le Creuset'; }, /brand/);
  check(o => { o.category = 'Pots'; }, /category/);
  check(o => { delete o.fr.title; }, /fr\.title/);
  check(o => { o.photos = []; }, /photos/);
  check(o => { o.photos[0].key = 'archive/other-object/1-1600.jpg'; }, /photos\[0\]\.key/);
  check(o => { o.photos[0].key = 'https://evil.example/x.jpg'; }, /photos\[0\]\.key/);
  check(o => { o.photos[0].width = 0; }, /photos\[0\]\.width/);
  check(o => { o.date_modified = '28/10/2026'; }, /date_modified/);
  check(o => { o.price = '150€'; }, /unknown field "price"/);
  check(o => { o.schema_version = '2'; }, /schema_version/);
  check(o => { o.en.title = 'x'.repeat(200); }, /en\.title/);

  const source = copyFixtures();
  editObject(source, COUSANCES, object => { delete object.en; });
  assert.throws(() => site(source), new RegExp(`${COUSANCES}/info\\.json`));
});

test('a shop item named in shop_item that no longer exists falls back to an archive page', () => {
  const { exists } = site(FIXTURES, { items: MANIFEST.items.filter(item => item.id !== 'fixture-staub-cocotte-for-sale') });
  assert.equal(exists('en/archive/staub-cocotte-black.html'), true);
});
