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
    await use(errors);
    expect(errors, 'Browser errors and missing local assets').toEqual([]);
  }, { auto: true }]
});

// The page talks to the identify-agent Worker; tests replace it with this mock and never call a real service.
const API = 'https://api.identify.test';
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type' };
const PAGE = `/en/identify.html?api=${encodeURIComponent(API)}`;

async function mockApi(page, respond) {
  const requests = [];
  await page.route(`${API}/**`, async route => {
    const request = route.request();
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    const body = JSON.parse(request.postData() || '{}');
    requests.push(body);
    const reply = respond(body, requests.length);
    if (reply === 'drop') return route.abort('failed');
    const [status, json] = reply;
    return route.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify(json) });
  });
  return requests;
}
async function photo(name) {
  const buffer = await sharp({ create: { width: 1600, height: 1200, channels: 3, background: '#d2691e' } }).jpeg().toBuffer();
  return { name, mimeType: 'image/jpeg', buffer };
}
const answer = {
  status: 'COMPLETED', case_reference: '00000000-0000-4000-8000-000000000001', visitor: 'vis1.visitor-token',
  identifications_remaining_today: 5, photos_used: 1, outcome: 'candidates',
  notice: 'Documentary possibilities from our reference archive: not an identification.',
  message: 'These are documentary possibilities, not an identification.', clarification: null,
  observations: [{ kind: 'reference', value: '<b>0437</b>', component: 'body', certainty: 'clear' }],
  period: { from: 1965, to: 1972, sources: 2 },
  ai_estimate: { identification: 'Le Creuset <i>oval</i> cocotte, size E', maker: 'Le Creuset', period: { from: 1960, to: 1975 },
    confidence: 'medium', archive_agreement: 'agrees', explanation: 'The size letter and handles fit the period.',
    model: 'gemini-3.8-flash', version: 'identify-estimate-1' },
  possibilities: [{ source_title: 'Le Creuset catalogue 1965', reliability_level: 'PRIMARY', component: 'unknown',
    supporting_observations: 1, conflicting_observations: 0, documented_years: [1965],
    matched: [{ kind: 'marking', value: 'E' }, { kind: 'measurement', value: 29, unit: 'cm', property: 'LENGTH' }], close_match: true,
    evidence: [{ property: 'ITEM_REFERENCE_CODE', value: '0437', documented_year: 1965, page_label: '7', validation_status: 'OWNER_TRANSCRIBED' }] }]
};

test('the identification page is hidden: English only, noindex, unlinked and outside the sitemap', async ({ page }) => {
  await page.goto('/en/identify.html');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.locator('#identify-unavailable')).toBeVisible();
  await expect(page.locator('#identify-form')).toBeHidden();
  await expect(page.locator('.lang-switch')).toHaveCount(0);
  const root = path.join(__dirname, '..', '..');
  expect(fs.existsSync(path.join(root, 'fr', 'identify.html'))).toBe(false);
  expect(fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8')).not.toContain('identify');
  for (const file of ['index.html', 'en/index.html', 'en/guides/le-creuset-dating-guide.html', 'en/privacy.html', 'fr/privacy.html']) {
    expect(fs.readFileSync(path.join(root, file), 'utf8'), file).not.toContain('identify.html');
  }
});

test('every footer links the privacy notice, which covers the agent, its legal basis, retention and erasure', async ({ page }) => {
  await page.goto('/en/guides/le-creuset-dating-guide.html');
  await page.locator('footer a', { hasText: 'Privacy' }).click();
  await expect(page).toHaveURL(/\/en\/privacy\.html$/);
  const agent = page.locator('#identification-agent');
  await expect(agent).toContainText('legitimate interest');
  await expect(agent).toContainText('5 years after submission');
  await expect(agent).toContainText('Google');
  await expect(page.locator('main')).toContainText('CNIL');
  await page.goto('/fr/index.html');
  await page.locator('footer a', { hasText: 'Confidentialité' }).click();
  await expect(page.locator('h1')).toHaveText('Politique de confidentialité');
  await page.goto(PAGE);
  await expect(page.locator('.studio-privacy a')).toHaveAttribute('href', 'privacy.html#identification-agent');
});

test('fonts are self-hosted: no page contacts Google Fonts', async ({ page }) => {
  const external = [];
  page.on('request', request => { if (/fonts\.(googleapis|gstatic)\.com/.test(request.url())) external.push(request.url()); });
  const local = [];
  page.on('response', response => { if (response.url().includes('/fonts/') && response.ok()) local.push(response.url()); });
  for (const url of ['/index.html', '/fr/privacy.html', '/en/guides/le-creuset-dating-guide.html']) {
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
  }
  expect(external).toEqual([]);
  expect(local.some(url => url.endsWith('inter-latin.woff2'))).toBe(true);
  expect(local.some(url => url.endsWith('playfair-display-latin.woff2'))).toBe(true);
});

test('storage consent is required, then cited possibilities and the case reference are shown', async ({ page }) => {
  const requests = await mockApi(page, () => [200, answer]);
  await page.goto(PAGE);
  await expect(page.locator('label[for="identify-consent"]')).toContainText('stores the photos');
  await page.locator('#identify-submit').click();
  await expect(page.locator('#identify-status')).toHaveText('Add at least one photo.');

  await page.locator('#identify-photos').setInputFiles([await photo('base.jpg')]);
  await expect(page.locator('#identify-thumbs li')).toHaveCount(1);
  await page.locator('#identify-notes').fill('Orange oval, 29 cm');
  await page.locator('#identify-submit').click();
  await expect(page.locator('#identify-status')).toContainText('tick the box');
  expect(requests).toHaveLength(0);

  await page.locator('#identify-consent').check();
  await page.locator('#identify-submit').click();
  await expect(page.locator('#identify-result')).toBeVisible();
  expect(requests).toHaveLength(1);
  expect(requests[0].consent).toEqual({ accepted: true, version: '2026-11-identify-2' });
  expect(requests[0].notes).toBe('Orange oval, 29 cm');
  expect(requests[0].photos[0].media_type).toBe('image/jpeg');
  await expect(page.locator('#identify-period')).toHaveText(/^Pieces matching yours are documented between 1965 and 1972 \(2 sources\)\./);
  const estimate = page.locator('#identify-estimate');
  await expect(estimate).toContainText('AI estimate (opinion, not documented)');
  await expect(estimate).toContainText('Le Creuset <i>oval</i> cocotte, size E');
  await expect(estimate).toContainText('Probably made between 1960 and 1975 · medium confidence.');
  await expect(estimate).toContainText('Consistent with the documents found in our archive.');
  await expect(estimate).toContainText('only the documents below are evidence');
  await expect(page.locator('.identify-possibility h3')).toHaveText('Le Creuset catalogue 1965');
  await expect(page.locator('.identify-matched')).toHaveText('Matches: marking E, length 29 cm.');
  await expect(page.locator('.identify-possibility')).toContainText('Close match: your measurements are within 5%');
  await expect(page.locator('.identify-possibility li')).toHaveText('item reference code: 0437 (1965) — page 7');
  // API text is never rendered as HTML.
  await expect(page.locator('#identify-observations li')).toHaveText('reference: <b>0437</b> (body)');
  await expect(page.locator('#identify-reference')).toContainText(answer.case_reference);
  await expect(page.locator('#identify-status')).toContainText('5 identifications left today');
  expect(await page.evaluate(() => localStorage.getItem('identify-visitor'))).toBe('vis1.visitor-token');
  await expect(page.locator('.identify-shop a').first()).toHaveAttribute('href', 'index.html');
});

test('at most six photos are sent and errors keep the case reference for deletion requests', async ({ page }) => {
  const requests = await mockApi(page, () => [502, { error: { code: 'PROVIDER_FAILED' }, case_reference: 'case-ref-42' }]);
  await page.goto(PAGE);
  const files = await Promise.all(Array.from({ length: 7 }, (_, i) => photo(`p${i}.jpg`)));
  await page.locator('#identify-photos').setInputFiles(files);
  await expect(page.locator('#identify-thumbs li')).toHaveCount(6);
  await expect(page.locator('#identify-status')).toHaveText('You can add up to 6 photos.');
  await page.locator('#identify-consent').check();
  await page.locator('#identify-submit').click();
  await expect(page.locator('#identify-status')).toContainText('could not be read this time');
  await expect(page.locator('#identify-status')).toContainText('case-ref-42');
  expect(requests[0].photos).toHaveLength(6);
});

test('a dropped upload is retried once; matches without dated documents say no period can be given', async ({ page }) => {
  const undated = { ...answer, period: null, ai_estimate: null, possibilities: [{ ...answer.possibilities[0], documented_years: [], close_match: false }] };
  const requests = await mockApi(page, (body, count) => count === 1 ? 'drop' : [200, undated]);
  await page.goto(PAGE);
  await page.locator('#identify-photos').setInputFiles([await photo('base.jpg')]);
  await page.locator('#identify-consent').check();
  await page.locator('#identify-submit').click();
  await expect(page.locator('#identify-result')).toBeVisible();
  expect(requests).toHaveLength(2);
  expect(requests[1]).toEqual(requests[0]);
  await expect(page.locator('#identify-period')).toHaveText('The matching documents are not dated yet in our archive, so no period can be given.');
  await expect(page.locator('.identify-possibility')).not.toContainText('Close match');
  await expect(page.locator('#identify-estimate')).toBeHidden();
});

test('a second dropped upload reports the connection problem', async ({ page }) => {
  const requests = await mockApi(page, () => 'drop');
  await page.goto(PAGE);
  await page.locator('#identify-photos').setInputFiles([await photo('base.jpg')]);
  await page.locator('#identify-consent').check();
  await page.locator('#identify-submit').click();
  await expect(page.locator('#identify-status')).toHaveText('The agent could not be reached, even after a second try. Check your connection and try again.');
  expect(requests).toHaveLength(2);
  await expect(page.locator('#identify-result')).toBeHidden();
});
