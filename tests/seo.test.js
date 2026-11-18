// SEO and shop-integrity checks on the generated site (run after `npm run build`).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const SITE = 'https://cookandcollect.eu';
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const manifest = JSON.parse(read('manifest.json'));
const items = manifest.items;

// Public URL → file in the repository (GitHub Pages rules used by the site).
function fileFor(url) {
  let rel = url.replace(SITE, '').replace(/^\//, '');
  if (rel === '' || rel.endsWith('/')) rel += 'index.html';
  if (!path.extname(rel)) rel += '.html';
  return rel;
}
const canonicalOf = html => (html.match(/<link rel="canonical" href="([^"]+)">/) || [])[1];
const hreflangsOf = html => Object.fromEntries(
  [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map(m => [m[1], m[2]]));
const jsonLdOf = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(m => JSON.parse(m[1]));

const sitemapUrls = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

test('every sitemap URL exists, is indexable and is its own canonical', () => {
  assert.equal(new Set(sitemapUrls).size, sitemapUrls.length, 'no duplicate sitemap entries');
  for (const url of sitemapUrls) {
    const file = fileFor(url);
    assert.ok(fs.existsSync(path.join(root, file)), `${url} → ${file} missing`);
    const html = read(file);
    assert.doesNotMatch(html, /<meta name="robots" content="[^"]*noindex/, url);
    assert.equal(canonicalOf(html), url, `${url} canonical`);
  }
  assert.ok(!sitemapUrls.some(u => /item\.html|\/en\/index\.html$/.test(u)), 'no legacy or duplicate home URLs');
});

test('every published shop item has an EN and FR permanent page in the sitemap', () => {
  for (const item of items) {
    assert.ok(sitemapUrls.includes(`${SITE}/en/collection/${item.id}.html`), item.id);
    assert.ok(sitemapUrls.includes(`${SITE}/fr/collection/${item.id}.html`), item.id);
  }
});

test('hreflang annotations are reciprocal and point at self-canonical pages', () => {
  for (const url of sitemapUrls) {
    const html = read(fileFor(url));
    const alternates = hreflangsOf(html);
    if (!Object.keys(alternates).length) continue;
    assert.ok(alternates.en && alternates.fr && alternates['x-default'], `${url} has en/fr/x-default`);
    assert.ok(Object.values(alternates).includes(url), `${url} lists itself`);
    for (const lang of ['en', 'fr']) {
      const other = read(fileFor(alternates[lang]));
      assert.equal(canonicalOf(other), alternates[lang], `${alternates[lang]} self-canonical`);
      assert.deepEqual(hreflangsOf(other), alternates, `${url} ↔ ${alternates[lang]} reciprocal`);
      assert.match(other, new RegExp(`<html lang="${lang}"`), `${alternates[lang]} language`);
    }
  }
});

test('the /en/ home duplicate points to the root canonical', () => {
  assert.equal(canonicalOf(read('en/index.html')), `${SITE}/`);
  assert.equal(canonicalOf(read('index.html')), `${SITE}/`);
  assert.equal(canonicalOf(read('fr/index.html')), `${SITE}/fr/index.html`);
});

test('product structured data matches the item and its sale status', () => {
  for (const item of items) {
    for (const code of ['en', 'fr']) {
      const file = `${code}/collection/${item.id}.html`;
      const html = read(file);
      const data = jsonLdOf(html);
      const product = data.find(d => d['@type'] === 'Product');
      assert.ok(product, file);
      assert.ok(product.name && product.sku === item.id, file);
      assert.ok(Array.isArray(product.image) ? product.image.length : product.image, `${file} image`);
      const offer = product.offers;
      // A piece Cook & Collect does not sell directly (and that is not sold) has no Offer.
      if (!item.sold && item.directSale === false) {
        assert.equal(offer, undefined, `${file} has no Offer`);
        continue;
      }
      assert.ok(offer, `${file} has an Offer`);
      assert.equal(offer.availability, item.sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock', file);
      assert.equal(offer.url, `${SITE}/${file}`, file);
      if (offer.price !== undefined) {
        assert.equal(offer.priceCurrency, 'EUR', file);
        assert.equal(String(offer.price), item.price.replace(/[^\d.,]/g, '').replace(',', '.'), file);
      }
      assert.ok(!('aggregateRating' in product) && !('review' in product), `${file} has no invented reviews`);
      const crumbs = data.find(d => d['@type'] === 'BreadcrumbList');
      assert.ok(crumbs, file);
      assert.equal(crumbs.itemListElement.at(-1).item, `${SITE}/${file}`, file);
      for (const crumb of crumbs.itemListElement) {
        assert.equal(canonicalOf(read(fileFor(crumb.item))), crumb.item, `${file} breadcrumb ${crumb.item} canonical`);
      }
    }
  }
});

test('purchase actions appear only on available direct-sale pieces', () => {
  for (const item of items) {
    for (const code of ['en', 'fr']) {
      const html = read(`${code}/collection/${item.id}.html`);
      const purchasable = !item.sold && item.directSale !== false;
      assert.equal(/data-enquiry="purchase"/.test(html), purchasable, `${code}/${item.id} enquire`);
      assert.equal(/data-enquiry="offer"/.test(html), purchasable, `${code}/${item.id} offer`);
      assert.equal(/js\/enquiry\.js/.test(html), purchasable, `${code}/${item.id} enquiry.js`);
      assert.match(html, new RegExp(`data-purchasable="${purchasable}"`));
      if (item.sold) assert.match(html, /class="sold-note"/, `${code}/${item.id} sold note`);
    }
  }
});

test('legacy item.html?id= map covers every item with same-language targets', () => {
  const map = JSON.parse(read('legacy-redirects.json'));
  assert.equal(map.version, 1);
  assert.deepEqual(Object.keys(map.items).sort(), items.map(i => i.id).sort());
  for (const [id, targets] of Object.entries(map.items)) {
    assert.equal(targets.en, `/en/collection/${id}.html`);
    assert.equal(targets.fr, `/fr/collection/${id}.html`);
    for (const target of Object.values(targets)) {
      assert.doesNotMatch(target, /item\.html/, 'a target is never a legacy URL (no loop)');
      assert.ok(fs.existsSync(path.join(root, target.slice(1))), target);
    }
  }
});

test('shop collection pages list only available pieces and link to existing pages', () => {
  const shopFiles = sitemapUrls.filter(u => /\/shop\//.test(u)).map(fileFor);
  assert.ok(shopFiles.length >= 2);
  const available = new Set(items.filter(i => !i.sold && i.directSale !== false).map(i => i.id));
  for (const file of shopFiles) {
    const html = read(file);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${file} single h1`);
    const ids = [...html.matchAll(/data-item-id="([^"]+)"/g)].map(m => m[1]);
    assert.ok(ids.length >= 3, `${file} has enough pieces`);
    ids.forEach(id => assert.ok(available.has(id), `${file}: ${id} is available`));
    for (const [, href] of html.matchAll(/<a href="(\.\.\/[^"#?]+)"/g)) {
      const target = path.join(root, path.dirname(file), href);
      assert.ok(fs.existsSync(target) || fs.existsSync(`${target}.html`), `${file} → ${href}`);
    }
  }
});

test('guide product sections show only matching available pieces, or a fallback link', () => {
  const available = new Map(items.filter(i => !i.sold).map(i => [i.id, i]));
  for (const code of ['en', 'fr']) {
    for (const file of fs.readdirSync(path.join(root, code, 'guides'))) {
      if (file === 'index.html' || !file.endsWith('.html')) continue;
      const html = read(`${code}/guides/${file}`);
      const section = html.match(/<section class="guide-section guide-shop[^"]*"[\s\S]*?<\/section>/);
      assert.ok(section, `${code}/guides/${file} has a shop section`);
      const ids = [...section[0].matchAll(/data-item-id="([^"]+)"/g)].map(m => m[1]);
      assert.ok(ids.length <= 4, file);
      ids.forEach(id => {
        assert.ok(available.has(id), `${file}: ${id} available`);
        assert.ok(section[0].includes(`href="../collection/${id}.html"`), `${file}: canonical link`);
      });
      if (!ids.length) assert.match(section[0], /guide-shop-empty/, file);
      if (/le-creuset/.test(file)) ids.forEach(id => assert.match(available.get(id).title.toLowerCase(), /le creuset/, file));
      if (/copper|dehillerin|mauviel|lecellier/.test(file)) ids.forEach(id => assert.equal(available.get(id).category, 'Copper', file));
      assert.match(html, /js\/track\.js\?v=2/, file);
    }
  }
});

test('no generated page leaves a template token unresolved', () => {
  const dirs = ['.', 'en', 'fr', 'en/collection', 'fr/collection', 'en/shop', 'fr/shop', 'en/guides', 'fr/guides'];
  for (const dir of dirs) {
    for (const file of fs.readdirSync(path.join(root, dir)).filter(f => f.endsWith('.html'))) {
      assert.doesNotMatch(read(`${dir}/${file}`), /\{\{\w+\}\}/, `${dir}/${file}`);
    }
  }
});

const curated = items.filter(i => i.curated);
const curatedPage = {en: 'en/curatedselection.html', fr: 'fr/curated-selection.html'};

test('the home grid lists only available direct-sale shop pieces', () => {
  const expected = items.filter(i => !i.curated && !i.sold && i.directSale !== false).map(i => i.id);
  for (const file of ['index.html', 'en/index.html', 'fr/index.html']) {
    const grid = read(file).split('id="grid"')[1].split('</main>')[0];
    const ids = [...new Set([...grid.matchAll(/data-item-id="([^"]+)"/g)].map(m => m[1]))];
    assert.deepEqual(ids.sort(), [...expected].sort(), file);
  }
});

test('every available or sold curated piece has a product page with its documented details', () => {
  const selected = manifest.selection.filter(e => e.status === 'Available' || e.status === 'Sold');
  assert.equal(curated.length, selected.length, 'one product page per available or sold curated object');
  const shopIds = new Set(items.filter(i => !i.curated).map(i => i.id));
  for (const item of curated) {
    assert.ok(!shopIds.has(item.id), `${item.id} is not also a shop item`);
    const entry = manifest.selection.find(e => e.id === item.id);
    assert.equal(entry.productPage, true, item.id);
    assert.equal(item.sold, entry.status === 'Sold', item.id);
    assert.equal(item.directSale, true, item.id);
    for (const code of ['en', 'fr']) {
      const file = `${code}/collection/${item.id}.html`;
      const html = read(file);
      const title = code === 'fr' && entry.fr && entry.fr.title ? entry.fr.title : entry.title;
      assert.ok(html.includes(`<h1 class="item-title">${title.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')}</h1>`), `${file} h1`);
      if (entry.maker) assert.match(html, /class="sel-detail-fields item-details"/, `${file} details`);
      const crumbs = jsonLdOf(html).find(d => d['@type'] === 'BreadcrumbList').itemListElement;
      assert.equal(crumbs[1].item, code === 'en' ? `${SITE}/en/curatedselection` : `${SITE}/fr/curated-selection.html`, `${file} breadcrumb`);
      // Every image of the curated record is shown on the product page.
      for (const src of entry.images) assert.ok(html.includes(`../../${src}`), `${file} shows ${src}`);
    }
  }
});

test('the curated selection links each piece to its product page, with purchase links only when available', () => {
  for (const [code, file] of Object.entries(curatedPage)) {
    const html = read(file);
    for (const item of curated) {
      const href = `collection/${item.id}.html`;
      assert.ok(html.includes(`href="${href}"`), `${file} → ${href}`);
      assert.equal(html.includes(`href="${href}#enquire"`), !item.sold, `${file} enquire link for ${item.id}`);
      assert.equal(html.includes(`href="${href}#offer"`), !item.sold, `${file} offer link for ${item.id}`);
    }
    const list = jsonLdOf(html).find(d => d['@type'] === 'ItemList');
    for (const item of curated) {
      assert.ok(list.itemListElement.some(e => e.item.url === `${SITE}/${code}/collection/${item.id}.html`), `${file} JSON-LD url ${item.id}`);
    }
  }
});

test('the archive "available now" block only offers pieces sold directly', () => {
  const sellable = new Set(items.filter(i => !i.sold && i.directSale !== false).map(i => i.id));
  for (const code of ['en', 'fr']) {
    const dir = path.join(root, code, 'archive');
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
      const html = read(`${code}/archive/${file}`);
      for (const [, id] of html.matchAll(/collection\/([a-z0-9-]+)\.html/g)) {
        assert.ok(sellable.has(id), `${code}/archive/${file} → ${id} is for sale`);
      }
    }
  }
});

test('guide links to collection pages resolve, and each documented curated piece is linked in EN and FR', () => {
  const linked = { en: new Set(), fr: new Set() };
  for (const lang of ['en', 'fr']) {
    for (const file of fs.readdirSync(path.join(root, lang, 'guides')).filter(f => f.endsWith('.html'))) {
      const html = read(`${lang}/guides/${file}`);
      for (const [, id] of html.matchAll(/href="\.\.\/collection\/([^"#?]+)\.html/g)) {
        assert.ok(fs.existsSync(path.join(root, lang, 'collection', `${id}.html`)), `${lang}/guides/${file} → ${id}`);
        linked[lang].add(id);
      }
    }
  }
  // Objects the guides study and the curated selection sells: the guide text must lead to the piece.
  for (const id of [
    'veuve-clicquot-ponsardin-champagne-bucket-orange-fr',
    'jean-couzon-orfevre-champagne-cooler-stainless-18-10',
    'e-dehillerin-copper-saute-pan-29-cm-paris-france',
    'l-lecellier-cuivralec-graduated-copper-saucepans',
    'limoges-castel-cobalt-blue-gilt-porcelain-oval-box-o',
    'limoges-castel-red-gilt-porcelain-plate-galant-scene',
    'longwy-pair-hand-painted-faience-dishes-skier-waterm',
    'christian-dior-covered-maiolica-vessel-garofano-made',
  ]) {
    if (!items.some(i => i.id === id)) continue; // piece unpublished: no page to link
    assert.ok(linked.en.has(id) && linked.fr.has(id), `${id} linked from an EN and a FR guide`);
  }
});

test('item title and description carry a lang attribute only when not in the page language', () => {
  const langOf = (html, cls) => {
    const tag = (html.match(new RegExp(`<(?:h1|p) class="${cls}"[^>]*>`)) || [])[0];
    assert.ok(tag, cls);
    return (tag.match(/ lang="([a-z]+)"/) || [])[1] || null;
  };
  for (const item of items.filter(i => !i.curated)) {
    for (const code of ['en', 'fr']) {
      const html = read(`${code}/collection/${item.id}.html`);
      for (const [cls, field] of [['item-title', 'title'], ['item-description', 'description']]) {
        if (field === 'description' && !item.description && !(item.fr && item.fr.description)) continue;
        const shown = code === 'fr' && item.fr && item.fr[field] ? 'fr' : (item.language || 'en');
        assert.equal(langOf(html, cls), shown === code ? null : shown, `${code}/${item.id} ${field}`);
      }
    }
  }
});
