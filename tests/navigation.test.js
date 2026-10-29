const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');

test('permanent item breadcrumbs use the shared ordered-list structure', () => {
  const directory = path.join(root, 'en/collection');
  const files = fs.readdirSync(directory).filter(file => file.endsWith('.html'));
  assert.ok(files.length > 0);
  for (const file of files) {
    const html = fs.readFileSync(path.join(directory, file), 'utf8');
    const breadcrumbs = html.match(/<nav class="breadcrumbs"[^>]*>([\s\S]*?)<\/nav>/);
    assert.ok(breadcrumbs, file);
    assert.match(breadcrumbs[1], /<ol>[\s\S]*<\/ol>/, file);
    assert.equal((breadcrumbs[1].match(/<li\b/g) || []).length, 3, file);
    assert.match(breadcrumbs[1], /<li aria-current="page">[^<]+<\/li>/, file);
    const links = [...breadcrumbs[1].matchAll(/href="([^"]+)"/g)].map(match => match[1]);
    const list = html.includes('class="sold-badge"') ? '../sold.html' : '../index.html';
    assert.deepEqual(links, ['../index.html', list], file);
  }
});

test('every guide breadcrumb retains an ordered list and a current-page label', () => {
  for (const locale of ['en', 'fr']) {
    const directory = path.join(root, locale, 'guides');
    for (const file of fs.readdirSync(directory).filter(file => file.endsWith('.html'))) {
      const html = fs.readFileSync(path.join(directory, file), 'utf8');
      const breadcrumbs = html.match(/<nav class="guide-breadcrumb"[^>]*>([\s\S]*?)<\/nav>/);
      assert.ok(breadcrumbs, `${locale}/${file}`);
      assert.match(breadcrumbs[1], /<ol>[\s\S]*<\/ol>/);
      assert.match(breadcrumbs[1], /<li aria-current="page">[^<]+<\/li>/);
    }
  }
});

test('sticky navigation styling is limited to the top-level menu', () => {
  const css = fs.readFileSync(path.join(root, 'css/style.css'), 'utf8');
  assert.match(css, /body > nav\s*\{[^}]*position: sticky;/);
  assert.doesNotMatch(css, /(?:^|\n)nav\s*\{/);
  assert.match(css, /\.breadcrumbs ol,\s*\.guide-breadcrumb ol\s*\{/);
});

test('the cast iron makers guide is built in both languages and listed in the sitemap', () => {
  const file = 'european-enamelled-cast-iron-makers.html';
  const makers = ['le-creuset', 'cousances', 'staub', 'invicta', 'fontignac', 'descoware', 'dru'];
  for (const locale of ['en', 'fr']) {
    const page = path.join(root, locale, 'guides', file);
    assert.ok(fs.existsSync(page), `${locale}/guides/${file}`);
    const html = fs.readFileSync(page, 'utf8');
    assert.doesNotMatch(html, /\{\{\w+\}\}/, `${locale}: unresolved template token`);
    assert.match(html, /href="vintage-le-creuset\.html"/, `${locale}: link to the Le Creuset guide`);
    assert.match(html, /href="le-creuset-dating-guide\.html"/, `${locale}: link to the dating guide`);
    assert.match(html, /class="guide-section guide-references"/, `${locale}: references section`);
    const ids = [...html.matchAll(/<h2 id="maker-([a-z-]+)"/g)].map(m => m[1]);
    assert.deepEqual(ids, makers, `${locale}: one profile per maker, in order`);
    assert.doesNotMatch(html, /href="[^"]*archive\//, `${locale}: no archive link until the archive is published`);
  }
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  assert.match(sitemap, new RegExp(`/en/guides/${file.replace(/\./g, '\\.')}<`));
  assert.match(sitemap, new RegExp(`/fr/guides/${file.replace(/\./g, '\\.')}<`));
});
