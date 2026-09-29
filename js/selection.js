/* Curated Selection — premium dealer portfolio.
   Fully separate from the shop (js/app.js): its own data source
   (manifest.selection), no prices, no cart, no purchase actions. */

const SEL_LANG = document.documentElement.lang === 'fr' ? 'fr' : 'en';

const SEL_STRINGS = {
  en: {
    maker: 'Maker',
    designer: 'Designer',
    origin: 'Origin',
    period: 'Period',
    materials: 'Materials',
    dimensions: 'Dimensions',
    marks: 'Marks & signatures',
    condition: 'Condition',
    status: 'Status',
    noPhotos: 'No photos available',
    prev: 'Previous image',
    next: 'Next image',
    upcomingEyebrow: 'In preparation',
    upcomingLink: 'Looking for a specific piece? Send us a sourcing request',
    upcoming: {
      'French Copperware': ['More copper to come', 'Further pieces are being cleaned, researched and their stamps verified before joining the collection.'],
      'Rare Cast Iron': ['More cast iron to come', 'Further designer and early enamelled pieces are being documented from their base marks before joining the collection.'],
      'Champagne & Wine Objects': ['More champagne objects to come', 'Further coolers and wine accessories are being identified by maker and house before joining the collection.'],
      'French Design & Decorative Objects': ['More decorative pieces to come', 'Further faience, porcelain and design objects are being authenticated and photographed before joining the collection.'],
      '': ['More pieces to come', 'Further objects are being researched and documented before joining the collection.']
    }
  },
  fr: {
    maker: 'Fabricant',
    designer: 'Designer',
    origin: 'Origine',
    period: 'Période',
    materials: 'Matériaux',
    dimensions: 'Dimensions',
    marks: 'Marques & signatures',
    condition: 'État',
    status: 'Statut',
    noPhotos: 'Aucune photo disponible',
    prev: 'Image précédente',
    next: 'Image suivante',
    upcomingEyebrow: 'En préparation',
    upcomingLink: 'Vous recherchez une pièce précise ? Confiez-nous une recherche',
    upcoming: {
      'French Copperware': ['D’autres cuivres à venir', 'D’autres pièces sont en cours de nettoyage, d’étude et de vérification de leurs poinçons avant de rejoindre la collection.'],
      'Rare Cast Iron': ['D’autres fontes à venir', 'D’autres pièces émaillées, de designers ou anciennes, sont en cours de documentation à partir de leurs marques avant de rejoindre la collection.'],
      'Champagne & Wine Objects': ['D’autres objets de champagne à venir', 'D’autres rafraîchissoirs et accessoires du vin sont en cours d’identification, fabricant et maison, avant de rejoindre la collection.'],
      'French Design & Decorative Objects': ['D’autres pièces décoratives à venir', 'D’autres faïences, porcelaines et objets de design sont en cours d’authentification et de photographie avant de rejoindre la collection.'],
      '': ['D’autres pièces à venir', 'D’autres objets sont en cours d’étude et de documentation avant de rejoindre la collection.']
    }
  }
};

// Category display labels (English keys in data; FR labels for display).
const SEL_CATEGORY_LABELS = {
  en: {},
  fr: {
    'French Copperware': 'Cuivres français',
    'Champagne & Wine Objects': 'Objets de champagne & de vin',
    'French Design & Decorative Objects': 'Design & objets décoratifs français',
    'Rare Cast Iron': 'Fonte rare'
  }
};

// Status values are stored in English in info.json; FR labels for display.
const SEL_STATUS_LABELS = {
  en: {},
  fr: {
    'Available': 'Disponible',
    'Collection Archive': 'Archives de la collection'
  }
};

const ST = SEL_STRINGS[SEL_LANG];

// On French pages, overlay the item's optional `fr` translations (English fallback).
function selLocalize(item) {
  const localized = SEL_LANG === 'fr' && item.fr ? {...item, ...item.fr} : {...item};
  if (localized.status && !(SEL_LANG === 'fr' && item.fr && item.fr.status)) {
    localized.status = (SEL_STATUS_LABELS[SEL_LANG] || {})[item.status] || item.status;
  }
  return localized;
}
const SEL_BASE = window.__BASE__ || '';

function selAssetUrl(p) {
  if (!p) return p;
  return p.startsWith('/') || /^https?:/.test(p) ? p : SEL_BASE + p;
}

function selEscape(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

function selCategoryLabel(cat) {
  if (!cat) return '';
  return (SEL_CATEGORY_LABELS[SEL_LANG] && SEL_CATEGORY_LABELS[SEL_LANG][cat]) || cat;
}

/* ─── Boot ───
   The gallery markup itself is now rendered server-side by build.js from the
   SAME manifest.selection data (single source of truth), so the full
   inventory is present without JavaScript. This script only *enhances* the
   existing DOM: it wires clicks to the modal/gallery and appends the
   decorative "in preparation" teaser cards. It no longer builds the grid. */

(function () {
  hideEmptyStats();

  const selection = (window.__MANIFEST__ && Array.isArray(window.__MANIFEST__.selection))
    ? window.__MANIFEST__.selection.map(selLocalize)
    : [];
  window._selection = selection;

  enhanceSelectionGrid();
})();

// If a track-record stat has no value yet, hide that stat so no empty box shows.
function hideEmptyStats() {
  const list = document.getElementById('curated-stats');
  if (!list) return;
  let shown = 0;
  list.querySelectorAll('li').forEach(li => {
    const val = (li.getAttribute('data-value') || '').trim();
    if (!val) {
      li.remove();
    } else {
      shown++;
    }
  });
  if (shown === 0) list.remove();
}

/* ─── Grid enhancement ───
   Server-rendered <details class="curated-card"> elements already contain
   the full content. With JS enabled we intercept the native disclosure
   toggle and open the richer modal/gallery instead, and append the
   decorative "more to come" teaser card at the end of each group. */

function enhanceSelectionGrid() {
  const grid = document.getElementById('curated-grid');
  if (!grid) return;

  // Closing card per section: signals ongoing sourcing and invites requests.
  const renderUpcoming = (key) => {
    const [heading, text] = ST.upcoming[key] || ST.upcoming[''];
    return `
      <div class="curated-card curated-card--upcoming">
        <span class="curated-card-image curated-upcoming-panel">
          <span class="curated-upcoming-eyebrow">${selEscape(ST.upcomingEyebrow)}</span>
          <span class="curated-upcoming-title">${selEscape(heading)}</span>
          <span class="curated-upcoming-rule" aria-hidden="true"></span>
          <span class="curated-upcoming-text">${selEscape(text)}</span>
          <a class="curated-upcoming-link" href="#curated-enquiry">${selEscape(ST.upcomingLink)} →</a>
        </span>
      </div>
    `;
  };

  grid.querySelectorAll('.curated-group').forEach(groupEl => {
    const categoryKey = groupEl.dataset.category || '';
    const inner = groupEl.querySelector('.curated-grid');
    if (inner) inner.insertAdjacentHTML('beforeend', renderUpcoming(categoryKey));
  });

  grid.querySelectorAll('.curated-card[data-index]').forEach(card => {
    const summary = card.querySelector('summary.curated-card-summary');
    if (!summary) return;
    summary.addEventListener('click', (e) => {
      e.preventDefault(); // keep the modal experience instead of the native <details> toggle
      e.stopPropagation();
      openSelModal(Number(card.dataset.index));
    });
  });
}

/* ─── Detail modal ─── */

function selField(label, value) {
  if (!value) return '';
  return `
    <div class="sel-field">
      <dt>${selEscape(label)}</dt>
      <dd>${selEscape(value)}</dd>
    </div>`;
}

function openSelModal(index) {
  const item = (window._selection || [])[index];
  const modal = document.getElementById('sel-modal');
  const body = document.getElementById('sel-modal-body');
  if (!item || !modal || !body) return;

  const imgs = (item.images || []).map(selAssetUrl);
  const mainImage = imgs[0] || '';

  const details =
    selField(ST.maker, item.maker) +
    selField(ST.designer, item.designer) +
    selField(ST.origin, item.origin) +
    selField(ST.period, item.period) +
    selField(ST.materials, item.materials) +
    selField(ST.dimensions, item.dimensions) +
    selField(ST.marks, item.marks) +
    selField(ST.condition, item.condition) +
    selField(ST.status, item.status);

  const meta = [selCategoryLabel(item.category)].filter(Boolean).join('');

  body.innerHTML = `
    <div class="sel-detail">
      <div class="sel-detail-gallery">
        <div class="sel-main-frame">
          ${mainImage
            ? `<canvas class="sel-main-fill" id="selMainFill" aria-hidden="true"></canvas>
               <img src="${mainImage}" alt="${selEscape(item.title)}" class="sel-main-image" id="selMainImage" onload="selFillMargins()" onclick="openLightbox(window._selImageIndex || 0)">`
            : `<div class="sel-main-image no-cover">${ST.noPhotos}</div>`}
          ${imgs.length > 1 ? `
            <button type="button" class="sel-arrow sel-arrow-prev" onclick="selNavImage(-1)" aria-label="${ST.prev}">&#8249;</button>
            <button type="button" class="sel-arrow sel-arrow-next" onclick="selNavImage(1)" aria-label="${ST.next}">&#8250;</button>
          ` : ''}
        </div>
        ${imgs.length > 1 ? `
          <div class="sel-thumbnails">
            ${imgs.map((img, i) => `
              <img src="${img}" alt="${selEscape(item.title)} — ${i + 1}"
                   class="${i === 0 ? 'active' : ''}"
                   onclick="selSwitchImage(${i})" loading="lazy">
            `).join('')}
          </div>` : ''}
      </div>
      <div class="sel-detail-info">
        ${meta ? `<p class="sel-detail-category">${selEscape(meta)}</p>` : ''}
        <h2 class="sel-detail-title">${selEscape(item.title)}</h2>
        ${item.description ? `<p class="sel-detail-description">${selEscape(item.description)}</p>` : ''}
        ${details ? `<dl class="sel-detail-fields">${details}</dl>` : ''}
      </div>
    </div>
  `;

  window._selGalleryImages = imgs;
  window._selImageIndex = 0;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(selFillMargins);
}

function closeSelModal(event) {
  // When triggered by an overlay click, only close if the backdrop itself was clicked.
  if (event && event.target && !event.target.classList.contains('sel-modal')) return;
  const modal = document.getElementById('sel-modal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function selSwitchImage(index) {
  const mainImg = document.getElementById('selMainImage');
  if (!mainImg || !window._selGalleryImages) return;
  mainImg.src = window._selGalleryImages[index];
  window._selImageIndex = index;
  document.querySelectorAll('.sel-thumbnails img').forEach((thumb, i) => {
    thumb.classList.toggle('active', i === index);
  });
}

// Step through the modal's main image with the overlay arrows (wraps around).
function selNavImage(direction) {
  const imgs = window._selGalleryImages || [];
  if (imgs.length < 2) return;
  const next = ((window._selImageIndex || 0) + direction + imgs.length) % imgs.length;
  selSwitchImage(next);
}

// The main image is letterboxed (object-fit: contain). Fill the empty bars behind it
// with a softened mirror of the photo's own edges, so no white margins show.
function selFillMargins() {
  const img = document.getElementById('selMainImage');
  const canvas = document.getElementById('selMainFill');
  if (!img || !canvas || !img.complete || !img.naturalWidth) return;
  const cw = canvas.clientWidth, ch = canvas.clientHeight;
  if (!cw || !ch) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(cw * dpr);
  canvas.height = Math.round(ch * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cw, ch);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const iw = img.naturalWidth, ih = img.naturalHeight;
  const scale = Math.min(cw / iw, ch / ih);
  const dw = iw * scale, dh = ih * scale;
  const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
  const soft = 16; // blur strength in CSS px (via downscale then smooth upscale)

  // Mirror the photo region next to the bar into it, softened, so the seam is continuous.
  const mirror = (sx, sy, sw, sh, flipX, x, y, w, h) => {
    const tmp = document.createElement('canvas');
    tmp.width = Math.max(1, Math.round(w / soft));
    tmp.height = Math.max(1, Math.round(h / soft));
    const t = tmp.getContext('2d');
    t.imageSmoothingEnabled = true;
    t.imageSmoothingQuality = 'high';
    if (flipX) { t.translate(tmp.width, 0); t.scale(-1, 1); }
    else { t.translate(0, tmp.height); t.scale(1, -1); }
    t.drawImage(img, sx, sy, sw, sh, 0, 0, tmp.width, tmp.height);
    ctx.drawImage(tmp, x, y, w, h);
  };

  if (dx > 0.5) {
    const sw = Math.min(iw, dx / scale);
    mirror(0, 0, sw, ih, true, 0, 0, dx + 1, ch);
    mirror(iw - sw, 0, sw, ih, true, dx + dw - 1, 0, dx + 1, ch);
  }
  if (dy > 0.5) {
    const sh = Math.min(ih, dy / scale);
    mirror(0, 0, iw, sh, false, 0, 0, cw, dy + 1);
    mirror(0, ih - sh, iw, sh, false, 0, dy + dh - 1, cw, dy + 1);
  }
}

window.addEventListener('resize', selFillMargins);

/* ─── Lightbox (image zoom) — self-contained for this page ─── */

function openLightbox(index) {
  const imgs = window._selGalleryImages || [];
  if (!imgs.length) return;
  window._selImageIndex = index;
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src = imgs[index];
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  selResetZoom();
  lightbox.classList.remove('open');
  // Keep scroll locked if the detail modal is still open behind the lightbox.
  const modal = document.getElementById('sel-modal');
  if (!modal || !modal.classList.contains('open')) {
    document.body.style.overflow = '';
  }
}

function navigateLightbox(direction) {
  const imgs = window._selGalleryImages || [];
  if (!imgs.length) return;
  selResetZoom();
  window._selImageIndex = (window._selImageIndex + direction + imgs.length) % imgs.length;
  const lightboxImg = document.getElementById('lightboxImg');
  if (lightboxImg) lightboxImg.src = imgs[window._selImageIndex];
}

function selResetZoom() {
  const img = document.getElementById('lightboxImg');
  if (!img) return;
  img.classList.remove('zoomed', 'dragging');
  img.style.transform = '';
  window._selZoom = null;
}

function selToggleZoom(e) {
  const img = document.getElementById('lightboxImg');
  if (!img) return;
  if (img.classList.contains('zoomed')) {
    selResetZoom();
    return;
  }
  const rect = img.getBoundingClientRect();
  const xPct = (e.clientX - rect.left) / rect.width;
  const yPct = (e.clientY - rect.top) / rect.height;
  const scale = 2.5;
  const offsetX = (0.5 - xPct) * rect.width * (scale - 1);
  const offsetY = (0.5 - yPct) * rect.height * (scale - 1);
  img.classList.add('zoomed');
  img.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  window._selZoom = {scale, offsetX, offsetY};
}

(function () {
  let dragging = false, didDrag = false, startX, startY, startOX, startOY;

  document.addEventListener('mousedown', function (e) {
    const img = document.getElementById('lightboxImg');
    if (!img || e.target !== img) return;
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
    didDrag = false;
    if (img.classList.contains('zoomed') && window._selZoom) {
      dragging = true;
      img.classList.add('dragging');
      startOX = window._selZoom.offsetX;
      startOY = window._selZoom.offsetY;
    }
  });

  document.addEventListener('mousemove', function (e) {
    if (!dragging || !window._selZoom) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag = true;
    window._selZoom.offsetX = startOX + dx;
    window._selZoom.offsetY = startOY + dy;
    const img = document.getElementById('lightboxImg');
    if (img) img.style.transform = `translate(${window._selZoom.offsetX}px, ${window._selZoom.offsetY}px) scale(${window._selZoom.scale})`;
  });

  document.addEventListener('mouseup', function (e) {
    const img = document.getElementById('lightboxImg');
    if (dragging) {
      dragging = false;
      if (img) img.classList.remove('dragging');
      if (didDrag) return;
    }
    if (img && e.target === img) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) selToggleZoom(e);
    }
  });
})();

document.addEventListener('keydown', function (e) {
  const lightbox = document.getElementById('lightbox');
  if (lightbox && lightbox.classList.contains('open')) {
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') navigateLightbox(-1);
    else if (e.key === 'ArrowRight') navigateLightbox(1);
    return;
  }
  const modal = document.getElementById('sel-modal');
  if (modal && modal.classList.contains('open')) {
    if (e.key === 'Escape') closeSelModal();
    else if (e.key === 'ArrowLeft') selNavImage(-1);
    else if (e.key === 'ArrowRight') selNavImage(1);
  }
});
