// Purchase enquiries, offers and first-party conversion events.
// The enquiry API is always mocked (?enquiry_api= is honoured on localhost only);
// no live service is called.
const { test: base, expect } = require('@playwright/test');

const API = 'http://127.0.0.1:9/api';
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'POST, OPTIONS' };

const test = base.extend({
  browserErrors: [async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await use(errors);
    expect(errors, 'Browser errors').toEqual([]);
  }, { auto: true }]
});

async function pickItem(page, { sold = false } = {}) {
  await page.goto(`/en/${sold ? 'sold' : 'index'}.html`);
  const item = await page.evaluate(sold => window.__MANIFEST__.items.find(item => Boolean(item.sold) === sold), sold);
  expect(item).toBeTruthy();
  return item;
}

// Routes POST <API>/enquiry to the given responses, in order; records the bodies.
async function mockEnquiry(page, responses) {
  const bodies = [];
  await page.route(`${API}/enquiry`, async route => {
    const request = route.request();
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    bodies.push(JSON.parse(request.postData()));
    const next = responses[Math.min(bodies.length - 1, responses.length - 1)];
    return route.fulfill({ status: next.status, headers: { ...CORS, 'content-type': 'application/json' }, body: JSON.stringify(next.body) });
  });
  return bodies;
}

const dataLayer = page => page.evaluate(() => (window.dataLayer || []).map(e => ({ ...e })));

test('without an API base the purchase buttons stay pre-filled WhatsApp links', async ({ page }) => {
  const item = await pickItem(page);
  await page.goto(`/en/collection/${item.id}.html`);
  const buy = page.locator('[data-enquiry="purchase"]');
  const offer = page.locator('[data-enquiry="offer"]');
  await expect(buy).toBeVisible();
  await expect(offer).toBeVisible();
  for (const link of [buy, offer]) {
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^https:\/\/wa\.me\/33627335434\?text=/);
    expect(decodeURIComponent(href)).toContain(item.id);
  }
  const box = await buy.boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(44);
});

test('sold pieces show no purchase or offer actions', async ({ page }) => {
  const item = await pickItem(page, { sold: true });
  for (const lang of ['en', 'fr']) {
    await page.goto(`/${lang}/collection/${item.id}.html?enquiry_api=${encodeURIComponent(API)}`);
    await expect(page.locator('.sold-note')).toBeVisible();
    await expect(page.locator('[data-enquiry]')).toHaveCount(0);
    await expect(page.locator('dialog.enquiry-dialog')).toHaveCount(0);
  }
});

test('EN purchase enquiry validates, sends the exact piece and confirms only after success', async ({ page }) => {
  const item = await pickItem(page);
  const bodies = await mockEnquiry(page, [{ status: 200, body: { ok: true, reference: 'CC-AB12CD34' } }]);
  await page.goto(`/en/collection/${item.id}.html?enquiry_api=${encodeURIComponent(API)}`);
  await page.locator('[data-enquiry="purchase"]').click();
  const dialog = page.locator('dialog.enquiry-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.enquiry-title')).toHaveText('Enquire to Purchase');
  await expect(dialog.locator('.enquiry-item-meta')).toContainText(item.id);
  await expect(dialog.locator('.enquiry-offer-row')).toBeHidden();
  // Honeypot: positioned off-screen and out of the tab order.
  const honeypot = dialog.locator('input[name="website"]');
  await expect(honeypot).toHaveAttribute('tabindex', '-1');
  expect((await honeypot.boundingBox()).x).toBeLessThan(0);

  // Mobile and desktop: the form fits the viewport.
  const box = await dialog.boundingBox();
  const viewport = page.viewportSize();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);

  await dialog.locator('.enquiry-submit').click();
  await expect(dialog.locator('[data-field="name"] .enquiry-field-error')).toBeVisible();
  await expect(dialog.locator('[data-field="consent"] .enquiry-field-error')).toBeVisible();
  expect(bodies).toHaveLength(0);

  await dialog.locator('#enquiry-name').fill('Ada Collector');
  await dialog.locator('#enquiry-email').fill('not-an-email');
  await dialog.locator('#enquiry-country').selectOption('US');
  await dialog.locator('#enquiry-consent').check();
  await dialog.locator('.enquiry-submit').click();
  await expect(dialog.locator('[data-field="email"] .enquiry-field-error')).toHaveText('Please enter a valid email address.');
  expect(bodies).toHaveLength(0);

  await dialog.locator('#enquiry-email').fill('ada@example.com');
  await dialog.locator('#enquiry-message').fill('Is shipping to Boston possible?');
  await dialog.locator('.enquiry-submit').click();
  await expect(dialog.locator('.enquiry-success')).toBeVisible();
  await expect(dialog.locator('.enquiry-reference')).toHaveText('CC-AB12CD34');

  expect(bodies).toHaveLength(1);
  const body = bodies[0];
  expect(body).toMatchObject({
    type: 'purchase', lang: 'en', item_id: item.id, name: 'Ada Collector', email: 'ada@example.com',
    country: 'US', message: 'Is shipping to Boston possible?', consent: true, website: ''
  });
  expect(body.request_id).toMatch(/^[0-9a-f-]{36}$/);
  expect(body.offer_amount).toBeUndefined();
  expect(body.attribution.source).toBeTruthy();

  const events = await dataLayer(page);
  expect(events.map(e => e.event)).toEqual(expect.arrayContaining(['view_item', 'begin_purchase_enquiry', 'submit_purchase_enquiry']));
  const serialized = JSON.stringify(events);
  for (const personal of ['Ada', 'ada@example.com', 'Boston']) expect(serialized).not.toContain(personal);
});

test('FR offer validates the amount and retries a failed notification with the same request id', async ({ page }) => {
  const item = await pickItem(page);
  const bodies = await mockEnquiry(page, [
    { status: 502, body: { error: { code: 'NOTIFICATION_FAILED' } } },
    { status: 200, body: { ok: true, reference: 'CC-OFFER001' } }
  ]);
  await page.goto(`/fr/collection/${item.id}.html?enquiry_api=${encodeURIComponent(API)}`);
  await page.locator('[data-enquiry="offer"]').click();
  const dialog = page.locator('dialog.enquiry-dialog');
  await expect(dialog.locator('.enquiry-title')).toHaveText('Faire une offre');
  await expect(dialog.locator('.enquiry-notice')).toContainText('sans engagement');
  if (item.price) await expect(dialog.locator('.enquiry-item-meta')).toContainText(`Prix demandé ${item.price}`);

  await dialog.locator('#enquiry-name').fill('Camille');
  await dialog.locator('#enquiry-email').fill('camille@example.fr');
  await dialog.locator('#enquiry-country').selectOption('BE');
  await dialog.locator('#enquiry-amount').fill('-5');
  await dialog.locator('#enquiry-consent').check();
  await dialog.locator('.enquiry-submit').click();
  await expect(dialog.locator('[data-field="amount"] .enquiry-field-error')).toBeVisible();
  expect(bodies).toHaveLength(0);

  await dialog.locator('#enquiry-amount').fill('95,50');
  await dialog.locator('#enquiry-currency').selectOption('CHF');
  await dialog.locator('.enquiry-submit').click();
  await expect(dialog.locator('.enquiry-status.is-error')).toContainText('n’a pas pu être envoyée');
  await expect(dialog.locator('.enquiry-status a[href^="https://wa.me/"]')).toBeVisible();
  await expect(dialog.locator('.enquiry-success')).toBeHidden();

  await dialog.locator('.enquiry-submit').click();
  await expect(dialog.locator('.enquiry-reference')).toHaveText('CC-OFFER001');
  expect(bodies).toHaveLength(2);
  expect(bodies[1].request_id).toBe(bodies[0].request_id);
  expect(bodies[1]).toMatchObject({ type: 'offer', lang: 'fr', item_id: item.id, offer_amount: 95.5, currency: 'CHF', country: 'BE' });
  const events = (await dataLayer(page)).map(e => e.event);
  expect(events).toEqual(expect.arrayContaining(['begin_make_offer', 'submit_make_offer']));
});

for (const [status, code, text] of [
  [429, 'RATE_LIMITED', 'Too many requests'],
  [409, 'ITEM_NOT_AVAILABLE', 'no longer available']
]) {
  test(`a ${status} answer shows a clear error and no confirmation`, async ({ page }) => {
    const item = await pickItem(page);
    const bodies = await mockEnquiry(page, [{ status, body: { error: { code } } }]);
    await page.goto(`/en/collection/${item.id}.html?enquiry_api=${encodeURIComponent(API)}`);
    await page.locator('[data-enquiry="purchase"]').click();
    const dialog = page.locator('dialog.enquiry-dialog');
    await dialog.locator('#enquiry-name').fill('Sam');
    await dialog.locator('#enquiry-email').fill('sam@example.com');
    await dialog.locator('#enquiry-country').selectOption('GB');
    await dialog.locator('#enquiry-consent').check();
    await dialog.locator('.enquiry-submit').click();
    await expect(dialog.locator('.enquiry-status.is-error')).toContainText(text);
    await expect(dialog.locator('.enquiry-success')).toBeHidden();
    expect(bodies).toHaveLength(1);
    const events = (await dataLayer(page)).map(e => e.event);
    expect(events).not.toContain('submit_purchase_enquiry');
  });
}

test('a product opened from a guide is attributed to that guide', async ({ page }) => {
  await page.goto('/en/guides/le-creuset-dating-guide.html');
  const card = page.locator('.guide-shop .item-card').first();
  await card.scrollIntoViewIfNeeded();
  const id = await card.getAttribute('data-item-id');
  const image = card.locator('img');
  await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  await card.click();
  await expect(page).toHaveURL(new RegExp(`/en/collection/${id}\\.html$`));
  const view = (await dataLayer(page)).find(e => e.event === 'view_item');
  expect(view).toMatchObject({ item_id: id, list: 'guide:le-creuset-dating-guide', source: 'guide', lang: 'en' });
});

test('a product opened from a shop collection page is attributed to the category', async ({ page }) => {
  await page.goto('/fr/shop/vintage-cousances.html');
  await expect(page.locator('h1')).toBeVisible();
  const card = page.locator('[data-list="category:vintage-cousances"] .item-card').first();
  const id = await card.getAttribute('data-item-id');
  await card.click();
  await expect(page).toHaveURL(new RegExp(`/fr/collection/${id}\\.html$`));
  const view = (await dataLayer(page)).find(e => e.event === 'view_item');
  expect(view).toMatchObject({ item_id: id, list: 'category:vintage-cousances', source: 'category', lang: 'fr' });
});

test('UTM campaign tags are kept as the visit attribution', async ({ page }) => {
  const item = await pickItem(page);
  await page.evaluate(() => sessionStorage.clear());
  await page.goto(`/en/collection/${item.id}.html?utm_source=pinterest&utm_medium=social&utm_campaign=autumn`);
  const view = (await dataLayer(page)).find(e => e.event === 'view_item');
  expect(view).toMatchObject({ item_id: item.id, source: 'pinterest', utm_source: 'pinterest', utm_medium: 'social', utm_campaign: 'autumn' });
});

async function curatedPiece(page) {
  await page.goto('/en/curatedselection.html');
  const item = await page.evaluate(() => window.__MANIFEST__.items.find(item => item.curated && !item.sold));
  expect(item).toBeTruthy();
  return item;
}

test('a curated piece links from the Curated Selection to its product page, attributed to the selection', async ({ page }) => {
  const item = await curatedPiece(page);
  await page.evaluate(() => sessionStorage.clear());
  const actions = page.locator(`.curated-card-actions [data-item-id="${item.id}"]`);
  await expect(actions).toHaveCount(3);
  const enquire = page.locator(`.curated-card-actions a[href$="${item.id}.html#enquire"]`).first();
  await enquire.scrollIntoViewIfNeeded();
  await enquire.click();
  await expect(page).toHaveURL(new RegExp(`/en/collection/${item.id}\\.html#enquire$`));
  await expect(page.locator('h1')).toHaveText(item.title);
  await expect(page.locator('#enquire')).toBeVisible();
  await expect(page.locator('#offer')).toBeVisible();
  const events = await dataLayer(page);
  expect(events.find(e => e.event === 'view_item')).toMatchObject({ item_id: item.id, list: 'curated', source: 'internal' });
});

test('the curated modal also leads to the product page', async ({ page }) => {
  const item = await curatedPiece(page);
  const index = await page.evaluate(id => window._selection.findIndex(entry => entry.id === id), item.id);
  await page.locator(`.curated-card[data-index="${index}"] summary`).click();
  const modal = page.locator('#sel-modal');
  await expect(modal.locator('.curated-action-primary')).toHaveAttribute('href', `collection/${item.id}.html`);
  await expect(modal.locator(`a[href="collection/${item.id}.html#offer"]`)).toBeVisible();
});

for (const [lang, title] of [['en', 'Make an Offer'], ['fr', 'Faire une offre']]) {
  test(`${lang} curated product page shows its documented details and #offer opens the offer form`, async ({ page }) => {
    const item = await curatedPiece(page);
    await mockEnquiry(page, [{ status: 200, body: { ok: true, reference: 'CC-CURATED1' } }]);
    await page.goto(`/${lang}/collection/${item.id}.html?enquiry_api=${encodeURIComponent(API)}#offer`);
    await expect(page.locator('.item-details')).toBeVisible();
    await expect(page.locator('.breadcrumbs li').nth(1).locator('a')).toHaveAttribute('href',
      lang === 'en' ? '../curatedselection' : '../curated-selection.html');
    const dialog = page.locator('dialog.enquiry-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.enquiry-title')).toHaveText(title);
    await expect(dialog.locator('.enquiry-item-meta')).toContainText(item.id);
    expect(new URL(page.url()).hash).toBe('');
    const events = (await dataLayer(page)).map(e => e.event);
    expect(events).toContain('begin_make_offer');
  });
}
