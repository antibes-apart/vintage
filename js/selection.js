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
    otherPieces: 'Other pieces',
    noPhotos: 'No photos available',
    empty: 'New pieces are being prepared for this collection. Please check back soon.',
    viewLabel: 'View details',
    prev: 'Previous image',
    next: 'Next image'
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
    otherPieces: 'Autres pièces',
    noPhotos: 'Aucune photo disponible',
    empty: 'De nouvelles pièces sont en préparation pour cette collection. Revenez bientôt.',
    viewLabel: 'Voir les détails',
    prev: 'Image précédente',
    next: 'Image suivante'
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

const ST = SEL_STRINGS[SEL_LANG];
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

/* ─── Boot ─── */

(async function () {
  hideEmptyStats();

  let selection = [];
  try {
    if (window.__MANIFEST__ && Array.isArray(window.__MANIFEST__.selection)) {
      selection = window.__MANIFEST__.selection;
    } else {
      const response = await fetch(SEL_BASE + 'manifest.json');
      if (response.ok) {
        const data = await response.json();
        selection = Array.isArray(data.selection) ? data.selection : [];
      }
    }
  } catch (err) {
    console.error('Error loading selection:', err);
  }

  window._selection = selection;
  renderSelectionGrid(selection);
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

/* ─── Grid ─── */

function renderSelectionGrid(items) {
  const grid = document.getElementById('curated-grid');
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = `<div class="empty-state"><p>${ST.empty}</p></div>`;
    return;
  }

  grid.innerHTML = items.map((item, i) => {
    const cover = item.cover ? selAssetUrl(item.cover) : null;
    const meta = [selCategoryLabel(item.category), item.period].filter(Boolean).join(' · ');
    return `
      <button type="button" class="curated-card" data-index="${i}" aria-label="${selEscape(item.title)} — ${ST.viewLabel}">
        <span class="curated-card-image">
          ${cover
            ? `<img src="${cover}" alt="${selEscape(item.title)}" loading="lazy">`
            : `<span class="no-cover">${ST.noPhotos}</span>`}
          ${item.status ? `<span class="curated-status">${selEscape(item.status)}</span>` : ''}
        </span>
        <span class="curated-card-body">
          <span class="curated-card-title">${selEscape(item.title)}</span>
          ${meta ? `<span class="curated-card-meta">${selEscape(meta)}</span>` : ''}
        </span>
      </button>
    `;
  }).join('');

  grid.querySelectorAll('.curated-card').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openSelModal(Number(btn.dataset.index));
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
            ? `<img src="${mainImage}" alt="${selEscape(item.title)}" class="sel-main-image" id="selMainImage" onclick="openLightbox(window._selImageIndex || 0)">`
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
