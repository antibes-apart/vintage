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
  followups_remaining: 5,
  confidence: {
    identification: { level: 'high', reason: 'The size letter and handles agree.' },
    dating: { level: 'low', reason: 'The design spans several decades. <img src=x onerror=alert(1)>' },
    supporting_sources: 2, similarities: 1, ai_only: false
  },
  notice: 'AI-assisted identification and dating estimates, supported where possible by our reference archive.',
  message: 'The available documents support the identification and dating summary.', clarification: null,
  observations: [{ kind: 'reference', value: '<b>0437</b>', component: 'body', certainty: 'clear' }],
  period: { from: 1965, to: 1972, sources: 2 },
  ai_estimate: { identification: 'Le Creuset <i>oval</i> cocotte, size E', maker: 'Le Creuset', period: { from: 1960, to: 1975 },
    confidence: 'medium', archive_agreement: 'agrees', explanation: 'The size letter and handles fit the period.',
    next_detail: 'A lid photo would help, if you have one.',
    model: 'gemini-3.8-flash', version: 'identify-estimate-2' },
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
  await expect(agent).toContainText('conversation messages, additional photos');
  await expect(agent).toContainText('Google');
  await expect(page.locator('main')).toContainText('CNIL');
  await page.goto('/fr/index.html');
  await page.locator('footer a', { hasText: 'Confidentialité' }).click();
  await expect(page.locator('h1')).toHaveText('Politique de confidentialité');
  await expect(page.locator('#identification-agent')).toContainText('messages de conversation, photos supplémentaires');
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

test('photos and notice are required initially; the transcript answers safely without raw matches', async ({ page, isMobile }) => {
  const requests = await mockApi(page, () => [200, answer]);
  await page.goto(PAGE);
  await expect(page.locator('label[for="identify-consent"]')).toContainText('stores the photos');
  await page.locator('#identify-submit').click();
  await expect(page.locator('#identify-status')).toHaveText('Add at least one photo.');

  const attachment = page.locator('#identify-photos');
  await expect(page.locator('.identify-attachment-button')).toHaveText('Add photos');
  await attachment.focus();
  await expect(attachment).toBeFocused();
  await expect(page.locator('.identify-attachment-button')).toHaveCSS('outline-style', 'solid');
  const chooserEvent = page.waitForEvent('filechooser');
  await attachment.click();
  await (await chooserEvent).setFiles([await photo('base.jpg')]);
  await expect(page.locator('#identify-thumbs li')).toHaveCount(1);
  await page.locator('#identify-notes').fill('Orange oval, 29 cm');
  await page.locator('#identify-submit').click();
  await expect(page.locator('#identify-status')).toContainText('tick the box');
  expect(requests).toHaveLength(0);

  await page.locator('#identify-consent').check();
  await page.locator('#identify-submit').click();
  await expect(page.locator('.identify-turn-agent')).toHaveCount(1);
  expect(requests).toHaveLength(1);
  expect(requests[0].consent).toEqual({ accepted: true, version: '2026-11-identify-2' });
  expect(requests[0].notes).toBe('Orange oval, 29 cm');
  expect(requests[0].photos[0].media_type).toBe('image/jpeg');
  expect(requests[0].request_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  const visitor = page.locator('.identify-turn-visitor');
  await expect(visitor).toContainText('Orange oval, 29 cm');
  await expect(visitor.locator('img')).toHaveCount(1);
  const estimate = page.locator('.identify-estimate');
  await expect(estimate).toContainText('Le Creuset <i>oval</i> cocotte, size E');
  await expect(estimate).toContainText('Probably made between 1960 and 1975');
  await expect(estimate).toContainText(answer.ai_estimate.explanation);
  await expect(page.locator('.identify-confidence')).toContainText('Identification: high confidence. The size letter and handles agree.');
  await expect(page.locator('.identify-confidence')).toContainText('Dating: low confidence. ' + answer.confidence.dating.reason);
  await expect(page.locator('.identify-turn-agent i, .identify-turn-agent img')).toHaveCount(0);
  await expect(page.locator('.identify-possibility, #identify-possibilities, #identify-observations')).toHaveCount(0);
  await expect(page.locator('.identify-turn-agent')).not.toContainText('Le Creuset catalogue 1965');
  await expect(page.locator('.identify-suggestion')).toContainText('Optional next detail');
  await expect(page.locator('#identify-reference')).toContainText(answer.case_reference);
  await expect(page.locator('#identify-status')).toContainText('5 identifications left today');
  expect(await page.evaluate(() => localStorage.getItem('identify-visitor'))).toBe('vis1.visitor-token');
  const products = page.locator('.identify-shop-items a');
  await expect(products).toHaveCount(3);
  await expect(products.first()).toHaveAttribute('href', /^collection\/.+\.html$/);
  expect(await products.first().locator('img').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  const layout = await page.evaluate(() => {
    const shop = document.querySelector('.identify-shop').getBoundingClientRect();
    const chat = document.querySelector('.identify-chat').getBoundingClientRect();
    return { shopTop: shop.top, chatBottom: chat.bottom, shopLeft: shop.left, chatRight: chat.right };
  });
  if (isMobile) expect(layout.shopTop).toBeGreaterThanOrEqual(layout.chatBottom);
  else expect(layout.shopLeft).toBeGreaterThan(layout.chatRight);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(['identify-visitor']);
});

test('at most six photos are sent and errors keep the case reference for deletion requests', async ({ page }) => {
  const requests = await mockApi(page, () => [502, { error: { code: 'PROVIDER_FAILED' }, case_reference: 'case-ref-42',
    visitor: answer.visitor, followups_remaining: 5 }]);
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
  await expect(page.locator('#identify-status')).toContainText('Choose Identify another piece');
  await expect(page.locator('#identify-edit')).toBeHidden();
  await expect(page.locator('#identify-notes')).toBeDisabled();
  await page.locator('#identify-submit').click();
  await expect(page.locator('#identify-status')).toContainText('case-ref-42');
  expect(requests[1]).toEqual(requests[0]);
  await expect(page.locator('.identify-turn-visitor')).toHaveCount(1);
});

test('a dropped upload retries the exact UUID/body once; a null AI answer retains message and confidence', async ({ page }) => {
  const undated = { ...answer, period: null, ai_estimate: null, confidence: { ...answer.confidence, ai_only: true },
    message: 'The AI identification is unavailable this time. The documentary support summary is shown instead.',
    possibilities: [{ ...answer.possibilities[0], documented_years: [], close_match: false }] };
  const requests = await mockApi(page, (body, count) => count === 1 ? 'drop' : [200, undated]);
  await page.goto(PAGE);
  await page.locator('#identify-photos').setInputFiles([await photo('base.jpg')]);
  await page.locator('#identify-consent').check();
  await page.locator('#identify-submit').click();
  await expect(page.locator('.identify-turn-agent')).toHaveCount(1);
  expect(requests).toHaveLength(2);
  expect(requests[1]).toEqual(requests[0]);
  await expect(page.locator('.identify-turn-agent')).toContainText('The matching documents are not dated yet');
  await expect(page.locator('.identify-turn-agent')).toContainText(undated.message);
  await expect(page.locator('.identify-confidence')).toContainText(answer.confidence.identification.reason);
  await expect(page.locator('.identify-estimate')).toHaveCount(0);
  await expect(page.locator('.identify-turn-agent')).not.toContainText('AI-only estimate');
  await expect(page.locator('.identify-turn-visitor')).toHaveCount(1);
});

test('manual retry after ambiguous network failure keeps the original payload and one visitor bubble', async ({ page }) => {
  const requests = await mockApi(page, (body, count) => count <= 2 ? 'drop' : [200, answer]);
  await page.goto(PAGE);
  await page.locator('#identify-photos').setInputFiles([await photo('base.jpg')]);
  await page.locator('#identify-consent').check();
  await page.locator('#identify-submit').click();
  await expect(page.locator('#identify-status')).toHaveText('The agent could not be reached, even after a second try. Check your connection and try again.');
  expect(requests).toHaveLength(2);
  await expect(page.locator('#identify-notes')).toBeDisabled();
  await page.locator('#identify-submit').click();
  await expect(page.locator('.identify-turn-agent')).toHaveCount(1);
  expect(requests).toHaveLength(3);
  expect(requests[2]).toEqual(requests[0]);
  await expect(page.locator('.identify-turn-visitor')).toHaveCount(1);
});

async function begin(page) {
  await page.goto(PAGE);
  await page.locator('#identify-photos').setInputFiles([await photo('base.jpg')]);
  await page.locator('#identify-consent').check();
  await page.locator('#identify-submit').click();
  await expect(page.locator('.identify-turn-agent')).toHaveCount(1);
}

test('five optional follow-ups preserve the case and visitor, allow text-only and photos, then stop', async ({ page }) => {
  const { identifications_remaining_today, ...followupAnswer } = answer;
  const requests = await mockApi(page, (body, count) => [200, { ...(count === 1 ? answer : followupAnswer), followups_remaining: 6 - count }]);
  await begin(page);
  await expect(page.locator('#identify-thumbs li')).toHaveCount(0);
  for (let i = 1; i <= 5; i++) {
    await page.locator('#identify-notes').fill(i === 1 ? '<script>alert(1)</script>' : `Detail ${i}`);
    if (i === 2) await page.locator('#identify-photos').setInputFiles([await photo('lid.jpg')]);
    await page.locator('#identify-submit').click();
    await expect(page.locator('.identify-turn-agent')).toHaveCount(i + 1);
    expect(requests[i].case_reference).toBe(answer.case_reference);
    expect(requests[i].visitor).toBe(answer.visitor);
    expect(requests[i].photos).toHaveLength(i === 2 ? 1 : 0);
    await expect(page.locator('#identify-status')).not.toContainText('identifications left today');
  }
  expect(new Set(requests.map(request => request.request_id)).size).toBe(6);
  await expect(page.locator('.identify-turn-visitor').nth(1)).toContainText('<script>alert(1)</script>');
  await expect(page.locator('#identify-transcript script')).toHaveCount(0);
  await expect(page.locator('#identify-submit')).toBeDisabled();
  await expect(page.locator('#identify-photos')).toBeDisabled();
  await page.locator('#identify-new').click();
  await expect(page.locator('#identify-submit')).toBeEnabled();
  await expect(page.locator('#identify-transcript article')).toHaveCount(0);
  await expect(page.locator('#identify-consent')).not.toBeChecked();
});

test('409 in progress keeps the initial request for explicit retry without starting a new case', async ({ page }) => {
  const requests = await mockApi(page, (body, count) => count === 1
    ? [409, { error: { code: 'REQUEST_IN_PROGRESS' } }] : [200, answer]);
  await page.goto(PAGE);
  await page.locator('#identify-photos').setInputFiles([await photo('base.jpg')]);
  await page.locator('#identify-consent').check();
  await page.locator('#identify-submit').click();
  await expect(page.locator('#identify-status')).toContainText('Retry in a moment');
  await page.locator('#identify-submit').click();
  await expect(page.locator('.identify-turn-agent')).toHaveCount(1);
  expect(requests[1]).toEqual(requests[0]);
  await expect(page.locator('.identify-turn-visitor')).toHaveCount(1);
});

for (const code of ['FOLLOWUP_LIMIT_REACHED', 'CONVERSATION_EXPIRED', 'NEW_IDENTIFICATION_REQUIRED', 'CASE_NOT_FOUND']) {
  test(`${code} disables continuation and offers an explicit new identification`, async ({ page }) => {
    const requests = await mockApi(page, (body, count) => count === 1 ? [200, answer] : [409, { error: { code } }]);
    await begin(page);
    await page.locator('#identify-notes').fill('Another detail');
    await page.locator('#identify-submit').click();
    await expect(page.locator('#identify-status')).toContainText(/new identification/i);
    await expect(page.locator('#identify-submit')).toBeDisabled();
    await page.locator('#identify-new').click();
    await expect(page.locator('#identify-submit')).toBeEnabled();
    expect(requests).toHaveLength(2);
  });
}

test('uploads enforce six at once and ten total photos without a mandatory questionnaire', async ({ page }) => {
  const requests = await mockApi(page, () => [200, answer]);
  await page.goto(PAGE);
  await page.locator('#identify-photos').setInputFiles(await Promise.all(Array.from({ length: 6 }, (_, i) => photo(`${i}.jpg`))));
  await page.locator('#identify-consent').check();
  await page.locator('#identify-submit').click();
  await expect(page.locator('.identify-turn-agent')).toHaveCount(1);
  await page.locator('#identify-photos').setInputFiles(await Promise.all(Array.from({ length: 5 }, (_, i) => photo(`extra${i}.jpg`))));
  await expect(page.locator('#identify-status')).toContainText('at most 10 photos');
  await expect(page.locator('#identify-thumbs li')).toHaveCount(4);
  await page.locator('#identify-submit').click();
  await expect(page.locator('.identify-turn-agent')).toHaveCount(2);
  expect(requests[1].photos).toHaveLength(4);
  await page.locator('#identify-photos').setInputFiles([await photo('too-many.jpg')]);
  await expect(page.locator('#identify-thumbs li')).toHaveCount(0);
  await expect(page.locator('#identify-status')).toContainText('at most 10 photos');
});

test('accepted provider failures preserve retry identity and use the returned remaining allowance', async ({ page }) => {
  const requests = await mockApi(page, (body, count) => count === 1 ? [200, answer]
    : [502, { error: { code: 'PROVIDER_FAILED' }, case_reference: answer.case_reference,
      visitor: answer.visitor, followups_remaining: count <= 3 ? 4 : 0 }]);
  await begin(page);
  await page.locator('#identify-notes').fill('Can you read the lid?');
  await page.locator('#identify-submit').click();
  await expect(page.locator('#identify-followups')).toContainText('4 optional follow-up');
  await page.locator('#identify-submit').click();
  await expect(page.locator('#identify-edit')).toBeVisible();
  expect(requests[2]).toEqual(requests[1]);
  await expect(page.locator('.identify-turn-visitor')).toHaveCount(2);
  await page.locator('#identify-edit').click();
  await page.locator('#identify-notes').fill('Here is another detail');
  await page.locator('#identify-submit').click();
  await expect(page.locator('#identify-submit')).toBeDisabled();
  await expect(page.locator('#identify-followups')).toContainText('0 optional follow-up');
  expect(requests[3].request_id).not.toBe(requests[1].request_id);
  expect(requests[3].case_reference).toBe(answer.case_reference);
  await page.locator('#identify-new').click();
  await page.locator('#identify-photos').setInputFiles([await photo('new-piece.jpg')]);
  await page.locator('#identify-consent').check();
  await page.locator('#identify-submit').click();
  await expect(page.locator('#identify-status')).toContainText('Choose Identify another piece');
  expect(requests[4].case_reference).toBeUndefined();
  expect(requests[4].notes).toBe('');
  expect(requests[4].request_id).not.toBe(requests[3].request_id);
  expect(requests[4].photos).toHaveLength(1);
});

test('separate budget and follow-up daily limits give clear errors, without automatic new cases', async ({ page }) => {
  const codes = ['DAILY_BUDGET_REACHED', 'VISITOR_FOLLOWUP_DAILY_LIMIT', 'IP_FOLLOWUP_DAILY_LIMIT', 'TOO_MANY_CASE_PHOTOS'];
  const messages = ['daily budget', 'today’s follow-up limit', 'from this connection', 'at most 10 photos'];
  const requests = await mockApi(page, (body, count) => count === 1 ? [200, answer]
    : [429, { error: { code: codes[count - 2] } }]);
  await begin(page);
  for (let i = 0; i < codes.length; i++) {
    if (i) await page.locator('#identify-edit').click();
    await page.locator('#identify-notes').fill(`Detail ${i}`);
    await page.locator('#identify-submit').click();
    await expect(page.locator('#identify-status')).toContainText(messages[i]);
    expect(requests[i + 1].case_reference).toBe(answer.case_reference);
  }
});

test('legacy confidence and nullable next detail still render an answer', async ({ page }) => {
  await mockApi(page, () => [200, { ...answer, confidence: undefined, ai_estimate: { ...answer.ai_estimate, next_detail: null } }]);
  await begin(page);
  await expect(page.locator('.identify-turn-agent')).toContainText('AI estimate: medium confidence.');
  await expect(page.locator('.identify-suggestion')).toHaveCount(0);
});

test('Turnstile refreshes after success, but an ambiguous retry retains its original token and payload', async ({ page }) => {
  await page.route('**/en/identify.html?*', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace(/data-turnstile-sitekey="[^"]*"/, 'data-turnstile-sitekey="test-key"') });
  });
  await page.route('https://challenges.cloudflare.com/**', route => route.fulfill({
    contentType: 'application/javascript', body: `window.tokenResets = 0; window.turnstile = {
      render: () => 1, getResponse: () => 'token-' + window.tokenResets,
      reset: () => window.tokenResets++
    };`
  }));
  const requests = await mockApi(page, (body, count) => count <= 2 ? 'drop' : [200, answer]);
  await page.goto(PAGE);
  await expect.poll(() => page.evaluate(() => !!window.turnstile)).toBe(true);
  await page.locator('#identify-photos').setInputFiles([await photo('base.jpg')]);
  await page.locator('#identify-consent').check();
  await page.locator('#identify-submit').click();
  await expect(page.locator('#identify-status')).toContainText('even after a second try');
  expect(await page.evaluate(() => window.tokenResets)).toBe(0);
  await page.locator('#identify-submit').click();
  await expect(page.locator('.identify-turn-agent')).toHaveCount(1);
  expect(requests[2]).toEqual(requests[0]);
  expect(requests[0].turnstile_token).toBe('token-0');
  expect(await page.evaluate(() => window.tokenResets)).toBe(1);
  await page.locator('#identify-notes').fill('Follow-up');
  await page.locator('#identify-submit').click();
  await expect(page.locator('.identify-turn-agent')).toHaveCount(2);
  expect(requests[3].turnstile_token).toBe('token-1');
});
