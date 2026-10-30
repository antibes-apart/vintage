const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const { test: base, expect } = require('@playwright/test');

// Same guard as site.spec.js: any page error or missing local asset fails the test.
const test = base.extend({
  browserErrors: [async ({ page, baseURL }, use) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.url().startsWith(baseURL) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '' }));
    await use(errors);
    expect(errors, 'Browser errors and missing local assets').toEqual([]);
  }, { auto: true }]
});

// The studio talks to the separate Worker API; tests replace it with this mock and never call a real service.
const API = 'https://api.studio.test';
const CORS = {
  'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};
const listing = (title, description, extra = {}) => ({
  status: 'COMPLETED', catawiki_text: `${title}\n\n${description}`, session: `session-${title.length}`,
  revisions_used: 0, revisions_remaining: 10, visitor: 'vis1.visitor-token',
  listing: { title, description, uncertain_details: ['Lid pairing not confirmed'], condition_observations: ['Light wear on the rim'] },
  ...extra
});

async function mockApi(page, handlers) {
  const requests = [];
  await page.route(`${API}/**`, async route => {
    const request = route.request();
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    const pathname = new URL(request.url()).pathname;
    const body = JSON.parse(request.postData() || '{}');
    requests.push({ path: pathname, body, authorization: request.headers().authorization });
    const [status, json] = await handlers[pathname](body);
    return route.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify(json) });
  });
  return requests;
}

async function photoFile() {
  const buffer = await sharp({ create: { width: 1200, height: 900, channels: 3, background: '#d2691e' } }).jpeg().toBuffer();
  return { name: 'cocotte.jpg', mimeType: 'image/jpeg', buffer };
}

test('the studio says it is not available until the API is configured', async ({ page }) => {
  for (const [url, text] of [['/en/studio.html', 'not available yet'], ['/fr/studio.html', 'pas encore disponible']]) {
    await page.goto(url);
    await expect(page.locator('#studio-unavailable')).toBeVisible();
    await expect(page.locator('#studio-unavailable')).toContainText(text);
    await expect(page.locator('#studio-form')).toBeHidden();
  }
});

test('the studio page is kept out of search results', async ({ page }) => {
  await page.goto('/en/studio.html');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  const sitemap = path.join(__dirname, '..', '..', 'sitemap.xml');
  if (fs.existsSync(sitemap)) expect(fs.readFileSync(sitemap, 'utf8')).not.toContain('studio');
});

test('photos and notes become a description that can be copied and adjusted by chat', async ({ page, context, browserName }) => {
  if (browserName === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const requests = await mockApi(page, {
    '/listing': async () => [200, listing('Vintage Cousances Le Creuset Oval Cocotte',
      'A handsome black cocotte.\n\nAs with all vintage items, some signs of age and use may be present.')],
    '/listing/revise': async body => [200, listing('Vintage Cousances Le Creuset Cocotte', `Shorter text for: ${body.request}`,
      { revisions_used: 1, revisions_remaining: 9 })]
  });
  await page.goto(`/en/studio.html?api=${encodeURIComponent(API)}`);
  // Owner-only studio: the form appears only after the owner key is saved.
  await expect(page.locator('#studio-form')).toBeHidden();
  await expect(page.locator('#studio-owner')).toBeVisible();
  await page.locator('#studio-owner-key').fill('owner-admin-key-0123456789abcdef');
  await page.locator('#studio-owner-save').click();
  await expect(page.locator('#studio-form')).toBeVisible();
  await page.locator('#studio-photos').setInputFiles([await photoFile()]);
  await expect(page.locator('#studio-thumbs img')).toHaveCount(1);
  await page.locator('#studio-notes').fill('vintage cousances le creuset cocotte 31.5x24.5x12 cm');
  await page.locator('#studio-generate').click();

  await expect(page.locator('#studio-listing-title')).toHaveText('Vintage Cousances Le Creuset Oval Cocotte');
  await expect(page.locator('#studio-listing-text p')).toHaveCount(2);
  await expect(page.locator('#studio-form')).toBeHidden();
  const created = requests[0];
  expect(created.path).toBe('/listing');
  expect(created.body.notes).toBe('vintage cousances le creuset cocotte 31.5x24.5x12 cm');
  expect(created.body.language).toBe('en');
  expect(created.body.photos).toHaveLength(1);
  expect(created.body.photos[0].media_type).toBe('image/jpeg');
  // Resized in the browser: a JPEG within the 1 MiB upload limit.
  const uploaded = Buffer.from(created.body.photos[0].data, 'base64');
  expect(uploaded.length).toBeLessThanOrEqual(1024 * 1024);
  expect(uploaded.subarray(0, 2).toString('hex')).toBe('ffd8');
  // Owner-only: every request carries the saved admin key.
  expect(created.authorization).toBe('Bearer owner-admin-key-0123456789abcdef');

  await page.locator('#studio-details summary').click();
  await expect(page.locator('#studio-uncertain li')).toHaveText(['Lid pairing not confirmed']);

  if (browserName === 'chromium') {
    await page.locator('#studio-copy').click();
    await expect(page.locator('#studio-status')).toHaveText('Text copied.');
    expect(await page.evaluate(() => navigator.clipboard.readText()))
      .toBe('Vintage Cousances Le Creuset Oval Cocotte\n\nA handsome black cocotte.\n\nAs with all vintage items, some signs of age and use may be present.');
  }

  await page.locator('#studio-chat-input').fill('Make it shorter.');
  await page.locator('#studio-send').click();
  await expect(page.locator('#studio-listing-text')).toHaveText('Shorter text for: Make it shorter.');
  await expect(page.locator('#studio-chat-log li')).toHaveText(['Make it shorter.']);
  await expect(page.locator('#studio-remaining')).toHaveText('9 adjustments left for this object.');
  expect(requests[1].body).toEqual({ session: 'session-41', request: 'Make it shorter.' });

  // A reload in the same tab keeps the current object.
  await page.reload();
  await expect(page.locator('#studio-listing-text')).toHaveText('Shorter text for: Make it shorter.');
  await page.locator('#studio-new').click();
  await expect(page.locator('#studio-form')).toBeVisible();
  await expect(page.locator('#studio-thumbs img')).toHaveCount(0);
});

test('API errors are explained in plain words for the owner', async ({ page }) => {
  let calls = 0;
  const requests = await mockApi(page, {
    '/listing': async () => (++calls === 1
      ? [200, listing('Le Creuset Cocotte', 'Text.')]
      : [503, { error: { code: 'PROVIDER_BUSY' } }])
  });
  await page.goto(`/fr/studio.html?api=${encodeURIComponent(API)}`);
  await page.locator('#studio-owner-key').fill('owner-admin-key-0123456789abcdef');
  await page.locator('#studio-owner-save').click();
  await page.locator('#studio-photos').setInputFiles([await photoFile()]);
  await page.locator('#studio-generate').click();
  await expect(page.locator('#studio-listing-title')).toHaveText('Le Creuset Cocotte');
  await page.locator('#studio-new').click();
  await page.locator('#studio-photos').setInputFiles([await photoFile()]);
  await page.locator('#studio-generate').click();
  await expect(page.locator('#studio-status')).toHaveText('Le service de rédaction est occupé. Réessayez dans une minute.');
  await expect(page.locator('#studio-status')).toHaveClass(/studio-status-error/);
  // Owner-only: every request carries the saved admin key.
  expect(requests[0].authorization).toBe('Bearer owner-admin-key-0123456789abcdef');
  expect(requests[1].authorization).toBe('Bearer owner-admin-key-0123456789abcdef');
});

test('the studio is owner-only: the form appears only after the key is saved, and API text is never HTML', async ({ page }) => {
  const requests = await mockApi(page, {
    '/listing': async () => [200, listing('<img src=x onerror="window.__xss=1">Cocotte', '<script>window.__xss=2</script>Text')]
  });
  // Without a key the form is hidden and the owner panel prompts for the key.
  await page.goto(`/en/studio.html?api=${encodeURIComponent(API)}`);
  await expect(page.locator('#studio-form')).toBeHidden();
  await expect(page.locator('#studio-owner')).toBeVisible();
  await expect(page.locator('#studio-owner-key')).toBeVisible();
  await expect(page.locator('#studio-status')).toContainText('reserved for the site owner');
  await page.locator('#studio-owner-key').fill('owner-admin-key-0123456789abcdef');
  await page.locator('#studio-owner-save').click();
  await expect(page.locator('#studio-owner-status')).toHaveText('Owner access active in this browser.');
  // The form is now available.
  await expect(page.locator('#studio-form')).toBeVisible();
  await page.locator('#studio-photos').setInputFiles([await photoFile()]);
  await page.locator('#studio-generate').click();
  await expect(page.locator('#studio-listing-title')).toContainText('<img src=x');
  expect(await page.locator('#studio-result img').count()).toBe(0);
  expect(await page.evaluate(() => window.__xss)).toBeUndefined();
  expect(requests[0].authorization).toBe('Bearer owner-admin-key-0123456789abcdef');
  // A reload keeps the key and the current object, so the result stays shown (form hidden behind it).
  await page.goto(`/en/studio.html?api=${encodeURIComponent(API)}`);
  await expect(page.locator('#studio-result')).toBeVisible();
  await expect(page.locator('#studio-owner')).toBeVisible();
  // Start a new object to get back to the form, confirming the key still unlocks it.
  await page.locator('#studio-new').click();
  await expect(page.locator('#studio-form')).toBeVisible();
  // Removing the key hides the form again.
  await page.locator('#studio-owner summary').click();
  await page.locator('#studio-owner-remove').click();
  await expect(page.locator('#studio-owner-status')).toHaveText('Owner access not set.');
  await expect(page.locator('#studio-form')).toBeHidden();
  await page.reload();
  await expect(page.locator('#studio-form')).toBeHidden();
  await expect(page.locator('#studio-owner')).toBeVisible();
});

test('the owner saves the object to the archive with both photo sizes prepared in the browser', async ({ page }) => {
  const requests = await mockApi(page, {
    '/listing': async () => [200, listing('Vintage Cousances Cocotte', 'A handsome cocotte.')],
    '/listing/save': async () => [200, { status: 'SAVED', slug: 'vintage-cousances-cocotte-abc123', publish_status: 'NOT_PUBLISHED', record: {} }]
  });
  await page.goto(`/en/studio.html?api=${encodeURIComponent(API)}`);
  await page.locator('#studio-owner-key').fill('owner-admin-key-0123456789abcdef');
  await page.locator('#studio-owner-save').click();
  // A large photo, so both archive sizes are real reductions.
  const big = await sharp({ create: { width: 3000, height: 2000, channels: 3, background: '#d2691e' } }).jpeg().toBuffer();
  await page.locator('#studio-photos').setInputFiles([{ name: 'big.jpg', mimeType: 'image/jpeg', buffer: big }]);
  await page.locator('#studio-generate').click();
  await expect(page.locator('#studio-listing-title')).toHaveText('Vintage Cousances Cocotte');

  await expect(page.locator('#studio-save')).toBeEnabled();
  await page.locator('#studio-save').click();
  await expect(page.locator('#studio-save-status')).toHaveText('Saved to the archive. It will appear on the website once publishing is switched on.');
  // The save messages sit right under the button, not in the status line at the top of the result.
  await expect(page.locator('.studio-archive #studio-save-status')).toBeVisible();
  await expect(page.locator('#studio-status')).toHaveText('');
  const saved = requests.find(r => r.path === '/listing/save');
  expect(saved.authorization).toBe('Bearer owner-admin-key-0123456789abcdef');
  expect(saved.body.session).toBe('session-25');
  expect(saved.body.photos).toHaveLength(1);
  const large = Buffer.from(saved.body.photos[0].large.data, 'base64');
  const small = Buffer.from(saved.body.photos[0].small.data, 'base64');
  expect(saved.body.photos[0].large.media_type).toBe('image/jpeg');
  expect(large.length).toBeLessThanOrEqual(700 * 1024);
  expect(small.length).toBeLessThanOrEqual(200 * 1024);
  const [l, s] = await Promise.all([sharp(large).metadata(), sharp(small).metadata()]);
  expect([l.width, l.height]).toEqual([1600, 1067]);
  expect([s.width, s.height]).toEqual([800, 533]);

  // After a reload the photos are no longer in memory: saving needs them again, so the button says so.
  await page.reload();
  await expect(page.locator('#studio-listing-title')).toHaveText('Vintage Cousances Cocotte');
  await expect(page.locator('#studio-save')).toBeDisabled();
  await expect(page.locator('#studio-save-hint')).toContainText('photos');
});

test('archive save errors are explained to the owner', async ({ page }) => {
  await mockApi(page, {
    '/listing': async () => [200, listing('Le Creuset Cocotte', 'Text.')],
    '/listing/save': async () => [502, { error: { code: 'CONTENT_SEO_REJECTED' } }]
  });
  await page.goto(`/fr/studio.html?api=${encodeURIComponent(API)}`);
  await page.locator('#studio-owner-key').fill('owner-admin-key-0123456789abcdef');
  await page.locator('#studio-owner-save').click();
  await page.locator('#studio-photos').setInputFiles([await photoFile()]);
  await page.locator('#studio-generate').click();
  await expect(page.locator('#studio-listing-title')).toHaveText('Le Creuset Cocotte');
  await page.locator('#studio-save').click();
  await expect(page.locator('#studio-save-status')).toHaveText('Le texte de la page d’archive n’a pas passé les contrôles. Réessayez ou ajustez la description.');
  await expect(page.locator('#studio-save-status')).toHaveClass(/studio-status-error/);
});

test('after saving, the studio follows the publication until the page is live', async ({ page }) => {
  await page.clock.install();
  let checks = 0;
  const requests = await mockApi(page, {
    '/listing': async () => [200, listing('Vintage Cousances Cocotte', 'A handsome cocotte.')],
    '/listing/save': async () => [200, { status: 'SAVED', slug: 'vintage-cousances-cocotte-abc123', publish_status: 'PUBLISHED',
      commit_sha: 'a'.repeat(40), page_url: 'https://cookandcollect.eu/en/archive/vintage-cousances-cocotte-abc123.html', record: {} }],
    '/listing/publish-status': async () => [200, { slug: 'vintage-cousances-cocotte-abc123', publish_status: 'PUBLISHED',
      deployment: ++checks < 2 ? 'BUILDING' : 'LIVE', page_url: 'https://cookandcollect.eu/en/archive/vintage-cousances-cocotte-abc123.html' }]
  });
  await page.goto(`/en/studio.html?api=${encodeURIComponent(API)}`);
  await page.locator('#studio-owner-key').fill('owner-admin-key-0123456789abcdef');
  await page.locator('#studio-owner-save').click();
  await page.locator('#studio-photos').setInputFiles([await photoFile()]);
  await page.locator('#studio-generate').click();
  await expect(page.locator('#studio-listing-title')).toHaveText('Vintage Cousances Cocotte');
  await page.locator('#studio-save').click();
  await expect(page.locator('#studio-save-status')).toHaveText('Saved and sent to the website. The page is being built…');
  await page.clock.fastForward(20_000);
  await expect(page.locator('#studio-save-status')).toHaveText('Saved and sent to the website. The page is being built…');
  await page.clock.fastForward(20_000);
  await expect(page.locator('#studio-save-status')).toHaveText('The page is live: https://cookandcollect.eu/en/archive/vintage-cousances-cocotte-abc123.html');
  await expect(page.locator('#studio-save-status a')).toHaveAttribute('href', 'https://cookandcollect.eu/en/archive/vintage-cousances-cocotte-abc123.html');
  expect(requests.filter(r => r.path === '/listing/publish-status').map(r => r.body)).toEqual([
    { slug: 'vintage-cousances-cocotte-abc123' }, { slug: 'vintage-cousances-cocotte-abc123' }]);
});

test('a failed publication can be retried from the studio', async ({ page }) => {
  const requests = await mockApi(page, {
    '/listing': async () => [200, listing('Le Creuset Cocotte', 'Text.')],
    '/listing/save': async () => [200, { status: 'SAVED', slug: 'le-creuset-cocotte-abc123', publish_status: 'FAILED',
      publish_error: 'GITHUB_FAILED:500', record: {} }],
    '/listing/publish': async () => [200, { slug: 'le-creuset-cocotte-abc123', publish_status: 'PUBLISHED', commit_sha: 'b'.repeat(40),
      page_url: 'https://cookandcollect.eu/en/archive/le-creuset-cocotte-abc123.html' }],
    '/listing/publish-status': async () => [200, { slug: 'le-creuset-cocotte-abc123', publish_status: 'PUBLISHED', deployment: 'BUILDING' }]
  });
  await page.goto(`/fr/studio.html?api=${encodeURIComponent(API)}`);
  await page.locator('#studio-owner-key').fill('owner-admin-key-0123456789abcdef');
  await page.locator('#studio-owner-save').click();
  await page.locator('#studio-photos').setInputFiles([await photoFile()]);
  await page.locator('#studio-generate').click();
  await expect(page.locator('#studio-listing-title')).toHaveText('Le Creuset Cocotte');
  await expect(page.locator('#studio-publish-retry')).toBeHidden();
  await page.locator('#studio-save').click();
  await expect(page.locator('#studio-save-status')).toHaveText('Enregistré, mais la publication sur le site a échoué (GITHUB_FAILED:500). Vous pouvez réessayer.');
  await expect(page.locator('#studio-publish-retry')).toBeVisible();
  await page.locator('#studio-publish-retry').click();
  await expect(page.locator('#studio-save-status')).toHaveText('Enregistré et envoyé au site. La page est en cours de construction…');
  await expect(page.locator('#studio-publish-retry')).toBeHidden();
  expect(requests.find(r => r.path === '/listing/publish').body).toEqual({ slug: 'le-creuset-cocotte-abc123' });
});

test('the API address can only be overridden on a local development host', async ({ page }) => {
  await page.goto(`/en/studio.html?api=${encodeURIComponent('javascript:alert(1)')}`);
  await expect(page.locator('#studio-unavailable')).toBeVisible();
});
