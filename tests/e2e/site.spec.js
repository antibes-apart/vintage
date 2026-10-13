const fs = require('node:fs');
const path = require('node:path');
const { test: base, expect } = require('@playwright/test');

const test = base.extend({
  browserErrors: [async ({ page, baseURL }, use) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.url().startsWith(baseURL) && response.status() >= 400) {
        errors.push(`${response.status()} ${response.url()}`);
      }
    });
    await page.route('https://fonts.googleapis.com/**', route => route.fulfill({
      contentType: 'text/css', body: ''
    }));
    await use(errors);
    expect(errors, 'Browser errors and missing local assets').toEqual([]);
  }, { auto: true }]
});

async function catalogItem(page, sold = false) {
  await page.goto(`/en/${sold ? 'sold' : 'index'}.html`);
  const item = await page.evaluate(sold => window.__MANIFEST__.items.find(item =>
    Boolean(item.sold) === sold && item.images.length > 1
  ), sold);
  expect(item, 'The catalog must contain a multi-photo item for this scenario').toBeTruthy();
  return item;
}

async function loadedImage(image) {
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
}

async function checkImageFrame(page, selector = '#mainImage', ratio = 4 / 3) {
  const image = page.locator(selector);
  await loadedImage(image);
  const frame = await image.evaluate(img => ({
    width: img.getBoundingClientRect().width,
    height: img.getBoundingClientRect().height,
    container: img.parentElement.getBoundingClientRect().width,
    fit: getComputedStyle(img).objectFit,
    viewport: innerWidth,
    documentWidth: document.documentElement.scrollWidth
  }));
  expect(frame.width).toBeLessThanOrEqual(frame.container + 1);
  expect(Math.abs(frame.height - frame.width / ratio)).toBeLessThan(1);
  expect(frame.fit).toBe('contain');
  expect(frame.documentWidth).toBeLessThanOrEqual(frame.viewport);
}

async function checkLightbox(page, sources) {
  const lightbox = page.locator('#lightbox');
  const image = page.locator('#lightboxImg');
  await expect(lightbox).toBeVisible();
  await loadedImage(image);
  const dimensions = await image.evaluate(img => ({
    width: img.offsetWidth, height: img.offsetHeight,
    bounds: img.getBoundingClientRect().toJSON(),
    viewportWidth: innerWidth, viewportHeight: innerHeight
  }));
  expect(dimensions.bounds.x).toBeGreaterThanOrEqual(0);
  expect(dimensions.bounds.y).toBeGreaterThanOrEqual(0);
  expect(dimensions.bounds.right).toBeLessThanOrEqual(dimensions.viewportWidth);
  expect(dimensions.bounds.bottom).toBeLessThanOrEqual(dimensions.viewportHeight);
  await image.click();
  await expect(image).toHaveClass(/zoomed/);
  expect(await image.evaluate(img => [img.offsetWidth, img.offsetHeight]))
    .toEqual([dimensions.width, dimensions.height]);
  await page.locator('.lightbox-next').click();
  await expect(image).not.toHaveClass(/zoomed/);
  await expect(image).toHaveJSProperty('src', sources[0]);
  await page.keyboard.press('ArrowLeft');
  await expect(image).toHaveJSProperty('src', sources.at(-1));
  await page.keyboard.press('ArrowRight');
  await expect(image).toHaveJSProperty('src', sources[0]);
  await page.keyboard.press('Escape');
  await expect(lightbox).toBeHidden();
}

async function checkItemGallery(page, item) {
  const sources = item.images.map(src => new URL(src, `${new URL(page.url()).origin}/`).href);
  const thumbnails = page.locator('.thumbnails img');
  const image = page.locator('#mainImage');
  await expect(thumbnails).toHaveCount(sources.length);
  for (let index = 0; index < sources.length; index++) {
    await thumbnails.nth(index).click();
    await expect(image).toHaveJSProperty('src', sources[index]);
    await expect(thumbnails.nth(index)).toHaveClass('active');
    await expect(page.locator('.thumbnails img.active')).toHaveCount(1);
    await checkImageFrame(page);
  }
  await image.click();
  await checkLightbox(page, sources);
  await expect(image).toHaveJSProperty('src', sources[0]);
  await expect(thumbnails.first()).toHaveClass('active');
  await expect(page.locator('body')).toHaveCSS('overflow', 'visible');
  await image.click();
  await page.locator('.lightbox-close').click();
  await expect(page.locator('#lightbox')).toBeHidden();
  await expect(page.locator('body')).toHaveCSS('overflow', 'visible');
}

async function checkNavigationScroll(page) {
  const menu = page.locator('body > nav');
  await expect(menu).toHaveCSS('position', 'sticky');
  const nested = page.locator('main nav');
  for (const nav of await nested.all()) {
    await expect(nav).toHaveCSS('position', 'static');
    await expect(nav).toHaveCSS('z-index', 'auto');
  }
  for (const breadcrumb of await page.locator('.breadcrumbs, .guide-breadcrumb').all()) {
    await expect(breadcrumb).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(breadcrumb).toHaveCSS('border-bottom-width', '0px');
    await expect(breadcrumb.locator('ol')).toHaveCSS('list-style-type', 'none');
    await expect(breadcrumb.locator('a').first()).toHaveCSS('color', 'rgb(107, 83, 68)');
    await expect(breadcrumb.locator('a').first()).toHaveCSS('text-decoration-line', 'none');
    await expect(breadcrumb.locator('[aria-current="page"]')).toHaveCount(1);
  }
  const before = await nested.evaluateAll(navs => navs.map(nav => nav.getBoundingClientRect().top));
  await page.evaluate(() => scrollTo(0, 600));
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  const after = await page.evaluate(() => ({
    scroll: scrollY,
    menuTop: document.querySelector('body > nav').getBoundingClientRect().top,
    nested: [...document.querySelectorAll('main nav')].map(nav => nav.getBoundingClientRect().top)
  }));
  expect(Math.abs(after.menuTop)).toBeLessThan(1);
  after.nested.forEach((top, i) => {
    expect(Math.abs(before[i] - top - after.scroll), 'In-page navigation must scroll with the document')
      .toBeLessThan(1);
  });
  return after;
}

test('catalog opens a working, correctly sized permanent item gallery without fetching the manifest', async ({ page }) => {
  const item = await catalogItem(page);
  const manifestRequests = [];
  page.on('request', request => {
    if (new URL(request.url()).pathname.endsWith('/manifest.json')) manifestRequests.push(request.url());
  });
  await page.locator(`.item-card[href="collection/${item.id}.html"]`).click();
  await expect(page).toHaveURL(new RegExp(`/en/collection/${item.id}\\.html$`));
  await checkItemGallery(page, item);
  expect(manifestRequests).toEqual([]);
});

for (const locale of ['', 'en/', 'fr/']) {
  test(`legacy ${locale || 'root/'}item gallery stays functional`, async ({ page }) => {
    const item = await catalogItem(page);
    await page.goto(`/${locale}item.html?id=${encodeURIComponent(item.id)}`);
    await checkItemGallery(page, item);
  });
}

for (const sold of [false, true]) {
  test(`${sold ? 'sold' : 'available'} item breadcrumbs are styled, scroll away, and link to the correct catalog`, async ({ page }) => {
    const item = await catalogItem(page, sold);
    await page.locator(`.item-card[href="collection/${item.id}.html"]`).click();
    await checkImageFrame(page);
    const breadcrumbs = page.locator('.breadcrumbs');
    await expect(breadcrumbs.locator('li')).toHaveCount(3);
    await expect(breadcrumbs.locator('a').nth(1)).toHaveAttribute('href', `../${sold ? 'sold' : 'index'}.html`);
    const after = await checkNavigationScroll(page);
    expect(after.nested[0]).toBeLessThan(0);
    await page.evaluate(() => scrollTo(0, 0));
    await breadcrumbs.locator('a').nth(1).click();
    await expect(page).toHaveURL(new RegExp(`/en/${sold ? 'sold' : 'index'}\\.html$`));
  });
}

for (const locale of ['en', 'fr']) {
  test(`${locale} guide breadcrumbs and period navigation scroll normally`, async ({ page }) => {
    const directory = path.join(__dirname, '../..', locale, 'guides');
    for (const file of fs.readdirSync(directory).filter(file => file.endsWith('.html'))) {
      await page.goto(`/${locale}/guides/${file}`);
      await checkNavigationScroll(page);
    }
  });

  test(`${locale} catalog category filters remain non-sticky and usable`, async ({ page }) => {
    for (const file of ['index.html', 'sold.html']) {
      await page.goto(`/${locale}/${file}`);
      await expect(page.locator('.item-card').first()).toBeVisible();
      const chips = page.locator('.category-chip');
      await chips.nth(1).click();
      await expect(chips.nth(1)).toHaveClass(/active/);
      await expect(page.locator('.item-card').first()).toBeVisible();
      await chips.first().click();
      await expect(chips.first()).toHaveClass(/active/);
      await checkNavigationScroll(page);
    }
  });

  test(`${locale} curated galleries preserve their frames, controls, and modal scroll locking`, async ({ page, isMobile }) => {
    await page.goto(`/${locale}/${locale === 'en' ? 'curatedselection' : 'curated-selection'}.html`);
    const items = await page.evaluate(() => window._selection);
    expect(items.length).toBeGreaterThan(0);
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      expect(item.images.length).toBeGreaterThan(0);
      await page.locator(`.curated-card[data-index="${index}"] summary`).click();
      const modal = page.locator('#sel-modal');
      const image = modal.locator('#selMainImage');
      await expect(modal).toHaveAttribute('aria-hidden', 'false');
      await checkImageFrame(page, '#selMainImage', isMobile ? 4 / 3 : 4 / 5);
      const sources = item.images.map(src => new URL(`../${src}`, page.url()).href);
      if (sources.length > 1) {
        const thumbnails = modal.locator('.sel-thumbnails img');
        await expect(thumbnails).toHaveCount(sources.length);
        await thumbnails.last().click();
        await expect(image).toHaveJSProperty('src', sources.at(-1));
        await loadedImage(image);
        await modal.locator('.sel-arrow-next').click();
        await expect(image).toHaveJSProperty('src', sources[0]);
        await modal.locator('.sel-arrow-prev').click();
        await expect(image).toHaveJSProperty('src', sources.at(-1));
      }
      await image.click();
      await checkLightbox(page, sources);
      await expect(modal).toBeVisible();
      await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
      await page.keyboard.press('Escape');
      await expect(modal).toHaveAttribute('aria-hidden', 'true');
      await expect(page.locator('body')).toHaveCSS('overflow', 'visible');
    }
  });
}

test('permanent item content and breadcrumb navigation work without JavaScript', async ({ page, browser }) => {
  const item = await catalogItem(page);
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: page.viewportSize(),
    baseURL: new URL(page.url()).origin
  });
  try {
    const staticPage = await context.newPage();
    await staticPage.route('https://fonts.googleapis.com/**', route => route.fulfill({
      contentType: 'text/css', body: ''
    }));
    await staticPage.goto(`/en/collection/${item.id}.html`);
    await expect(staticPage.locator('h1')).toHaveText(item.title);
    await checkImageFrame(staticPage);
    await checkNavigationScroll(staticPage);
    await staticPage.locator('.breadcrumbs a').first().click();
    await expect(staticPage).toHaveURL(/\/en\/index\.html$/);
  } finally {
    await context.close();
  }
});
