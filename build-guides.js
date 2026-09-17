/*
 * build-guides.js — editorial collector guides (SEO landing pages).
 *
 * Kept separate from build.js on purpose: build.js owns the shop/app
 * (manifest + item grid + locale pages) and is already large. Guides are a
 * distinct, growing content area (target: ~10 guides), so they get their own
 * small, self-contained generator.
 *
 * How it scales — to add guide #2..#10:
 *   1. Append an entry to the GUIDES registry below.
 *   2. Create its template in templates/guides/<file>.html (use {{guideHead}},
 *      {{nav}}, {{contactButtons}}, {{footer}}, {{BASE}}, {{curatedHref}}).
 *   3. Add its strings to i18n.js under a unique `strKey` prefix.
 * The <head> (canonical, hreflang, Open Graph, Twitter, Article +
 * BreadcrumbList JSON-LD), navigation and bilingual wiring are generated here.
 *
 * Output: one file per locale, same filename in each language folder
 * (language is implied by the folder), e.g.
 *   en/guides/vintage-french-champagne-buckets.html   (English, canonical)
 *   fr/guides/vintage-french-champagne-buckets.html   (French)
 *
 * Run:  node build-guides.js   (or: npm run build:guides)
 */

const fs = require('fs');
const path = require('path');
const i18n = require('./i18n.js');

const TEMPLATES_DIR = path.join(__dirname, 'templates');
const SITE_URL = 'https://cookandcollect.eu';

/* ─── Guide registry ─── */
const GUIDES = [
  {
    // i18n key prefix. All of this guide's strings live in i18n.js as
    // `${strKey}...` (e.g. guideChampagneDocTitle, guideChampagneH1, …).
    strKey: 'guideChampagne',
    template: 'guides/vintage-french-champagne-buckets.html',
    // Same filename in every language folder; the folder encodes the language.
    file: 'vintage-french-champagne-buckets.html',
    // Hero / Open Graph image (site-root-relative). This is the same file used
    // as the page hero, so replacing the photo updates the social preview too.
    ogImage: 'img/guides/champagne-buckets/veuve-clicquot/1-full.jpeg',
    // Manually managed publication dates (ISO 8601) for Article schema.
    // Bump `dateModified` whenever the guide's content is meaningfully revised.
    datePublished: '2026-09-17',
    dateModified: '2026-09-17'
  }
];

/* ─── Locales ─── */
// English is the canonical language for guides and lives at /en/guides/.
const LOCALES = [
  {code: 'en', dir: 'en/guides', legalFile: 'legal-notice.html'},
  {code: 'fr', dir: 'fr/guides', legalFile: 'mentions-legales.html'}
];

/* ─── Shared partials (mirror build.js so guides look native) ─── */
const CONTACT_BUTTONS = `<!-- Floating Contact Buttons -->
  <div class="contact-buttons">
    <a href="https://wa.me/33627335434" target="_blank" rel="noopener noreferrer" class="contact-btn whatsapp" aria-label="{{ariaWhatsApp}}">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    </a>
    <a href="https://m.me/cookncollect" target="_blank" rel="noopener noreferrer" class="contact-btn messenger" aria-label="{{ariaMessenger}}">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.2l3.131 3.259L19.752 8.2l-6.561 6.763z"/></svg>
    </a>
  </div>`;

const FOOTER = `<footer>
    <p>&copy; 2026 Cook &amp; Collect</p>
    <p><a href="{{legalHref}}">{{legal}}</a></p>
  </footer>`;

// Guides sit at <locale>/guides/, one level below the locale root, so links
// to the locale root need "../". The lang switch keeps the same filename and
// only swaps the language folder.
function renderNav(rootPrefix, langSwitch) {
  return `<nav>
    <div class="nav-inner">
      <a href="${rootPrefix}index.html" class="logo">Cook &amp; Collect</a>
      <ul class="nav-links">
        <li><a href="${rootPrefix}index.html">{{navCollection}}</a></li>
        <li><a href="${rootPrefix}about.html">{{navAbout}}</a></li>
        <li><a href="${rootPrefix}shipping.html">{{navShipping}}</a></li>
        <li><a href="${rootPrefix}sold.html">{{navSold}}</a></li>
        ${langSwitch}
      </ul>
    </div>
  </nav>`;
}

function renderLangSwitch(currentCode, enHref, frHref) {
  const sel = code => (code === currentCode ? ' selected' : '');
  return `<li class="lang-switch">
          <select onchange="location.href=this.value" aria-label="{{ariaLanguage}}">
            <option value="${enHref}"${sel('en')}>EN</option>
            <option value="${frHref}"${sel('fr')}>FR</option>
          </select>
        </li>`;
}

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Canonical + hreflang + Open Graph + Twitter + Article/BreadcrumbList JSON-LD.
// `s` is the locale's i18n strings; `k` is the guide's strKey prefix.
function renderGuideHead(guide, code, s, k) {
  const get = suffix => s[`${k}${suffix}`] || '';
  const enUrl = `${SITE_URL}/en/guides/${guide.file}`;
  const frUrl = `${SITE_URL}/fr/guides/${guide.file}`;
  const canonical = code === 'fr' ? frUrl : enUrl;
  const ogImageUrl = `${SITE_URL}/${guide.ogImage}`;
  const desc = get('MetaDesc');
  const ogTitle = get('OgTitle') || get('DocTitle');
  const ogDesc = get('OgDesc') || desc;
  const ogLocale = code === 'fr' ? 'fr_FR' : 'en_GB';
  const homeUrl = code === 'fr' ? `${SITE_URL}/fr/` : `${SITE_URL}/en/`;

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: get('H1'),
    description: desc,
    image: [ogImageUrl],
    inLanguage: code,
    author: {'@type': 'Organization', name: 'Cook & Collect'},
    publisher: {'@type': 'Organization', name: 'Cook & Collect'},
    mainEntityOfPage: {'@type': 'WebPage', '@id': canonical},
    ...(guide.datePublished ? {datePublished: guide.datePublished} : {}),
    ...(guide.dateModified ? {dateModified: guide.dateModified} : {}),
    isAccessibleForFree: true
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {'@type': 'ListItem', position: 1, name: s.navCollection, item: homeUrl},
      {'@type': 'ListItem', position: 2, name: get('BreadcrumbGuides'), item: `${homeUrl}guides/`},
      {'@type': 'ListItem', position: 3, name: get('BreadcrumbCurrent')}
    ]
  };

  return `  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="fr" href="${frUrl}">
  <link rel="alternate" hreflang="x-default" href="${enUrl}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Cook & Collect">
  <meta property="og:locale" content="${ogLocale}">
  <meta property="og:title" content="${escapeAttr(ogTitle)}">
  <meta property="og:description" content="${escapeAttr(ogDesc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeAttr(ogTitle)}">
  <meta name="twitter:description" content="${escapeAttr(ogDesc)}">
  <meta name="twitter:image" content="${ogImageUrl}">
  <script type="application/ld+json">${JSON.stringify(article)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>`;
}

function substitute(html, ctx) {
  return html.replace(/\{\{(\w+)\}\}/g, (m, key) => (key in ctx ? ctx[key] : m));
}

const tpl = name => fs.readFileSync(path.join(TEMPLATES_DIR, name), 'utf-8');

/* ─── Generate ─── */
let generated = 0;
GUIDES.forEach(guide => {
  const template = tpl(guide.template);
  LOCALES.forEach(locale => {
    const strings = i18n[locale.code];
    // Same filename, different language folder.
    const enHref = `../../en/guides/${guide.file}`;
    const frHref = `../../fr/guides/${guide.file}`;
    const langSwitch = renderLangSwitch(locale.code, enHref, frHref);

    // Assets/root paths: guides are two folders deep (e.g. en/guides/), so
    // site-root assets resolve with "../../" and the locale root with "../".
    const base = '../../';
    const rootPrefix = '../';

    let html = template
      .replace('{{nav}}', renderNav(rootPrefix, langSwitch))
      .replace('{{contactButtons}}', CONTACT_BUTTONS)
      .replace('{{footer}}', FOOTER)
      .replace('{{guideHead}}', renderGuideHead(guide, locale.code, strings, guide.strKey));

    const ctx = {
      ...strings,
      LANG: locale.code,
      BASE: base,
      legalHref: `${rootPrefix}${locale.legalFile}`,
      curatedHref: `${rootPrefix}curated-selection.html`
    };
    html = substitute(html, ctx);

    const outDir = path.join(__dirname, locale.dir);
    fs.mkdirSync(outDir, {recursive: true});
    fs.writeFileSync(path.join(outDir, guide.file), html);
    generated++;
  });
});

console.log(`Generated ${generated} guide page(s) from ${GUIDES.length} guide(s) across ${LOCALES.length} locale(s).`);
