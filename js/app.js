const LANG = document.documentElement.lang === 'fr' ? 'fr' : 'en';

const STRINGS = {
  en: {
    allCategory: 'All Items',
    loadItemsError: '<h2>Unable to load items</h2><p>Please try again later.</p>',
    loadItemError: '<h2>Unable to load item</h2><p>Could not load manifest.</p><p><a href="index.html" class="back-link">&larr; Back to collection</a></p>',
    noMatch: '<h2>No items match your filter</h2><p>Try a different category or search term.</p>',
    noSold: '<h2>No sold items yet</h2><p>Check back later!</p>',
    noAvailable: '<h2>No items available</h2><p>New vintage treasures coming soon!</p>',
    notFound: '<h2>Item not found</h2><p><a href="index.html" class="back-link">&larr; Back to collection</a></p>',
    backCollection: '&larr; Back to collection',
    backSold: '&larr; Back to sold items',
    noPhotos: 'No photos available',
    sold: 'Sold',
    nounAvailable: 'available',
    nounSold: 'sold',
    itemWord: 'item',
    itemsWord: 'items',
    of: 'of',
    shippingNote: 'International shipping available — costs at buyer\'s expense. <a href="https://wa.me/33627335434" target="_blank" rel="noopener noreferrer">Contact us</a> for a quote!',
    titleSuffix: 'Vintage Collection'
  },
  fr: {
    allCategory: 'Tous les articles',
    loadItemsError: '<h2>Impossible de charger les articles</h2><p>Veuillez réessayer plus tard.</p>',
    loadItemError: '<h2>Impossible de charger l\'article</h2><p>Le manifeste n\'a pas pu être chargé.</p><p><a href="index.html" class="back-link">&larr; Retour à la collection</a></p>',
    noMatch: '<h2>Aucun article ne correspond à votre filtre</h2><p>Essayez une autre catégorie ou un autre terme de recherche.</p>',
    noSold: '<h2>Aucun article vendu pour l\'instant</h2><p>Revenez plus tard !</p>',
    noAvailable: '<h2>Aucun article disponible</h2><p>De nouveaux trésors vintage arrivent bientôt !</p>',
    notFound: '<h2>Article introuvable</h2><p><a href="index.html" class="back-link">&larr; Retour à la collection</a></p>',
    backCollection: '&larr; Retour à la collection',
    backSold: '&larr; Retour aux articles vendus',
    noPhotos: 'Aucune photo disponible',
    sold: 'Vendu',
    nounAvailable: 'disponible(s)',
    nounSold: 'vendu(s)',
    itemWord: 'article',
    itemsWord: 'articles',
    of: 'sur',
    shippingNote: 'Livraison internationale disponible — frais à la charge de l\'acheteur. <a href="https://wa.me/33627335434" target="_blank" rel="noopener noreferrer">Contactez-nous</a> pour un devis !',
    titleSuffix: 'Vintage Collection'
  }
};

// Manifest categories are stored in English; these are the display labels per language.
const CATEGORY_LABELS = {
  en: {},
  fr: {
    'Cocottes': 'Cocottes',
    'Skillets & Pans': 'Poêles & sauteuses',
    'Saucepans & Casseroles': 'Casseroles & fait-tout',
    'Baking & Serving Dishes': 'Plats de cuisson & de service',
    'Terrines': 'Terrines',
    'Grill Pans': 'Grils',
    'Fondues': 'Fondues',
    'Tea Light Holders': 'Photophores',
    'Copper': 'Cuivre',
    'Spare Parts': 'Pièces détachées',
    'Ice Buckets': 'Seaux à glace',
    'Other': 'Autres'
  }
};

const T = STRINGS[LANG];
const ALL_CATEGORY = T.allCategory;

function categoryLabel(cat) {
  if (cat === ALL_CATEGORY) return cat;
  return (CATEGORY_LABELS[LANG] && CATEGORY_LABELS[LANG][cat]) || cat;
}

// Prefix a manifest-relative asset path ("items/…") with the page's base ("" at root,
// "../" in /en/ and /fr/) so it resolves on file:// and when served.
const BASE = window.__BASE__ || '';
function assetUrl(p) {
  if (!p) return p;
  return p.startsWith('/') || /^https?:/.test(p) ? p : BASE + p;
}

(async function () {
  try {
    let data;
    // Use inlined manifest if available (works without a server), otherwise fetch
    if (window.__MANIFEST__) {
      data = window.__MANIFEST__;
    } else {
      const response = await fetch((window.__BASE__ || '') + 'manifest.json');
      if (!response.ok) throw new Error('Failed to load manifest');
      data = await response.json();
    }

    const page = document.body.dataset.page;
    window._categories = data.categories || [];

    if (page === 'home') {
      const available = data.items.filter(item => !item.sold);
      initListing(available, false, T.nounAvailable);
    } else if (page === 'sold') {
      const sold = data.items.filter(item => item.sold);
      initListing(sold, true, T.nounSold);
    } else if (page === 'item') {
      renderItemDetail(data.items);
    }
  } catch (error) {
    console.error('Error loading items:', error);
    const grid = document.getElementById('grid');
    const detail = document.getElementById('item-detail');
    if (grid) {
      grid.innerHTML = `<div class="empty-state">${T.loadItemsError}</div>`;
    }
    if (detail) {
      detail.innerHTML = `<div class="empty-state">${T.loadItemError}</div>`;
    }
  }
})();

/* ─── Listing (search + category filter) ─── */

function initListing(items, showSoldBadge, noun) {
  window._allItems = items;
  window._totalItems = items.length;
  window._showSoldBadge = showSoldBadge;
  window._listingNoun = noun;
  window._activeCategory = ALL_CATEGORY;
  window._searchQuery = '';

  renderCategoryNav(items);
  applyFilters();
  setupSearch();
}

function setupSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    window._searchQuery = e.target.value.trim().toLowerCase();
    applyFilters();
  });
}

function getVisibleCategories(items) {
  const all = window._categories || [];
  const present = new Set(items.map(item => item.category).filter(Boolean));
  return all.filter(cat => present.has(cat));
}

function countByCategory(items, category) {
  if (category === ALL_CATEGORY) return items.length;
  return items.filter(item => item.category === category).length;
}

function renderCategoryNav(items) {
  const nav = document.getElementById('category-nav');
  if (!nav) return;

  const visible = getVisibleCategories(items);
  const cats = [ALL_CATEGORY, ...visible];

  nav.innerHTML = cats.map(cat => {
    const count = countByCategory(items, cat);
    const isActive = cat === window._activeCategory;
    return `
      <button type="button"
              class="category-chip${isActive ? ' active' : ''}"
              data-category="${escapeHtml(cat)}">
        <span class="category-label">${escapeHtml(categoryLabel(cat))}</span>
        <span class="category-count">${count}</span>
      </button>
    `;
  }).join('');

  nav.querySelectorAll('.category-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      window._activeCategory = btn.dataset.category;
      nav.querySelectorAll('.category-chip').forEach(b => b.classList.toggle('active', b === btn));
      applyFilters();
    });
  });
}

function applyFilters() {
  const items = window._allItems || [];
  const query = window._searchQuery || '';
  const category = window._activeCategory || ALL_CATEGORY;

  let filtered = items;
  if (category !== ALL_CATEGORY) {
    filtered = filtered.filter(item => item.category === category);
  }
  if (query) {
    filtered = filtered.filter(item => {
      const searchableText = `${item.title} ${item.description} ${item.price}`.toLowerCase();
      return searchableText.includes(query);
    });
  }

  updateCount(filtered.length, query, category);
  renderGrid(filtered, !!window._showSoldBadge);
}

function updateCount(filteredCount, query, category) {
  const countEl = document.getElementById('item-count');
  if (!countEl) return;

  const total = window._totalItems || 0;
  const noun = window._listingNoun || T.nounAvailable;
  const isFiltered = query || category !== ALL_CATEGORY;

  if (isFiltered) {
    countEl.textContent = `${filteredCount} ${T.of} ${total}`;
  } else {
    countEl.textContent = `${total} ${total !== 1 ? T.itemsWord : T.itemWord} ${noun}`;
  }
}

/* ─── Grid Rendering ─── */

function renderGrid(items, showSoldBadge) {
  const grid = document.getElementById('grid');
  if (!grid) return;

  const hasSearch = (window._searchQuery || '').length > 0;
  const hasCategoryFilter = window._activeCategory && window._activeCategory !== ALL_CATEGORY;

  if (items.length === 0) {
    if (hasSearch || hasCategoryFilter) {
      grid.innerHTML = `<div class="empty-state">${T.noMatch}</div>`;
    } else if (showSoldBadge) {
      grid.innerHTML = `<div class="empty-state">${T.noSold}</div>`;
    } else {
      grid.innerHTML = `<div class="empty-state">${T.noAvailable}</div>`;
    }
    return;
  }

  grid.innerHTML = items.map(item => `
    <a href="item.html?id=${encodeURIComponent(item.id)}" class="item-card">
      <div class="image-wrapper">
        ${item.cover
          ? `<img src="${assetUrl(item.cover)}" alt="${escapeHtml(item.title)}" loading="lazy">`
          : '<div class="no-cover">No photo</div>'}
        ${showSoldBadge ? `<span class="sold-badge">${T.sold}</span>` : ''}
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        <p class="card-price">${escapeHtml(item.price)}</p>
      </div>
    </a>
  `).join('');
}

/* ─── Item Detail Rendering ─── */

function renderItemDetail(allItems) {
  const container = document.getElementById('item-detail');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const item = allItems.find(i => i.id === id);

  if (!item) {
    container.innerHTML = `<div class="empty-state">${T.notFound}</div>`;
    return;
  }

  document.title = `${item.title} — ${T.titleSuffix}`;
  updateLangSwitchForItem(item.id);

  const imgs = item.images.map(assetUrl);
  const mainImage = imgs[0] || '';

  container.innerHTML = `
    <a href="${item.sold ? 'sold.html' : 'index.html'}" class="back-link">${item.sold ? T.backSold : T.backCollection}</a>
    <div class="item-layout">
      <div class="gallery">
        ${mainImage
          ? `<img src="${mainImage}" alt="${escapeHtml(item.title)}" class="main-image" id="mainImage" onclick="openLightbox(window._currentImageIndex || 0)">`
          : `<div class="main-image no-cover">${T.noPhotos}</div>`}
        ${imgs.length > 1 ? `
          <div class="thumbnails">
            ${imgs.map((img, i) => `
              <img src="${img}" alt="${escapeHtml(item.title)} - photo ${i + 1}"
                   class="${i === 0 ? 'active' : ''}"
                   onclick="switchImage(${i})" loading="lazy">
            `).join('')}
          </div>
        ` : ''}
      </div>
      <div class="item-info">
        ${item.sold ? `<span class="sold-badge">${T.sold}</span>` : ''}
        <h1 class="item-title">${escapeHtml(item.title)}</h1>
        <p class="item-price">${escapeHtml(item.price)}</p>
        ${item.description ? `<p class="item-description">${escapeHtml(item.description)}</p>` : ''}
        ${!item.sold ? `<div class="shipping-note"><span class="shipping-icon">&#9992;</span> ${T.shippingNote}</div>` : ''}
      </div>
    </div>
  `;

  window._galleryImages = imgs;
  window._currentImageIndex = 0;
}

// Keep the ?id when switching language from an item page.
function updateLangSwitchForItem(id) {
  const select = document.querySelector('.lang-switch select');
  if (!select) return;
  Array.from(select.options).forEach(opt => {
    opt.value = `${opt.value.split('?')[0]}?id=${encodeURIComponent(id)}`;
  });
}

/* ─── Image Gallery Controls ─── */

function switchImage(index) {
  const mainImg = document.getElementById('mainImage');
  if (!mainImg || !window._galleryImages) return;

  mainImg.src = window._galleryImages[index];
  window._currentImageIndex = index;

  document.querySelectorAll('.thumbnails img').forEach((thumb, i) => {
    thumb.classList.toggle('active', i === index);
  });
}

/* ─── Lightbox ─── */

function openLightbox(index) {
  if (!window._galleryImages || window._galleryImages.length === 0) return;

  window._currentImageIndex = index;
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  if (!lightbox || !lightboxImg) return;

  lightboxImg.src = window._galleryImages[index];
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  resetZoom();
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function navigateLightbox(direction) {
  if (!window._galleryImages) return;

  resetZoom();
  const len = window._galleryImages.length;
  window._currentImageIndex = (window._currentImageIndex + direction + len) % len;

  const lightboxImg = document.getElementById('lightboxImg');
  if (lightboxImg) {
    lightboxImg.src = window._galleryImages[window._currentImageIndex];
  }
}

/* ─── Lightbox Zoom & Pan ─── */

function resetZoom() {
  const img = document.getElementById('lightboxImg');
  if (!img) return;
  img.classList.remove('zoomed', 'dragging');
  img.style.transform = '';
  window._zoom = null;
}

function toggleZoom(e) {
  const img = document.getElementById('lightboxImg');
  if (!img) return;

  if (img.classList.contains('zoomed')) {
    resetZoom();
    return;
  }

  // Zoom to 2x centered on click position
  const rect = img.getBoundingClientRect();
  const xPct = (e.clientX - rect.left) / rect.width;
  const yPct = (e.clientY - rect.top) / rect.height;
  const scale = 2.5;

  const offsetX = (0.5 - xPct) * rect.width * (scale - 1);
  const offsetY = (0.5 - yPct) * rect.height * (scale - 1);

  img.classList.add('zoomed');
  img.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  window._zoom = {scale, offsetX, offsetY, imgWidth: rect.width, imgHeight: rect.height};
}

// Pan when zoomed (mouse drag) + click-to-zoom
(function () {
  let dragging = false, didDrag = false, startX, startY, startOX, startOY;

  document.addEventListener('mousedown', function (e) {
    const img = document.getElementById('lightboxImg');
    if (!img || e.target !== img) return;
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
    didDrag = false;

    if (img.classList.contains('zoomed')) {
      dragging = true;
      img.classList.add('dragging');
      startOX = window._zoom.offsetX;
      startOY = window._zoom.offsetY;
    }
  });

  document.addEventListener('mousemove', function (e) {
    if (!dragging || !window._zoom) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag = true;
    window._zoom.offsetX = startOX + dx;
    window._zoom.offsetY = startOY + dy;
    const img = document.getElementById('lightboxImg');
    if (img) {
      img.style.transform = `translate(${window._zoom.offsetX}px, ${window._zoom.offsetY}px) scale(${window._zoom.scale})`;
    }
  });

  document.addEventListener('mouseup', function (e) {
    const img = document.getElementById('lightboxImg');
    if (dragging) {
      dragging = false;
      if (img) img.classList.remove('dragging');
      if (didDrag) return; // was a drag, not a click
    }

    // Only toggle zoom on a genuine click (no drag)
    if (img && e.target === img) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) {
        toggleZoom(e);
      }
    }
  });
})();

// Scroll wheel zoom
document.addEventListener('wheel', function (e) {
  const img = document.getElementById('lightboxImg');
  const lightbox = document.getElementById('lightbox');
  if (!img || !lightbox || !lightbox.classList.contains('open') || e.target !== img) return;
  e.preventDefault();

  const rect = img.getBoundingClientRect();
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  if (!window._zoom) {
    // Start zooming from 1x
    window._zoom = {scale: 1, offsetX: 0, offsetY: 0, imgWidth: rect.width, imgHeight: rect.height};
  }

  const oldScale = window._zoom.scale;
  const delta = e.deltaY > 0 ? 0.8 : 1.25;
  const newScale = Math.min(Math.max(oldScale * delta, 1), 6);

  if (newScale <= 1) {
    resetZoom();
    return;
  }

  // Zoom toward cursor position
  const imgCenterX = rect.left + rect.width / 2;
  const imgCenterY = rect.top + rect.height / 2;
  const dx = mouseX - imgCenterX;
  const dy = mouseY - imgCenterY;

  window._zoom.offsetX = dx - (dx - window._zoom.offsetX) * (newScale / oldScale);
  window._zoom.offsetY = dy - (dy - window._zoom.offsetY) * (newScale / oldScale);
  window._zoom.scale = newScale;

  img.classList.add('zoomed');
  img.style.transform = `translate(${window._zoom.offsetX}px, ${window._zoom.offsetY}px) scale(${newScale})`;
}, {passive: false});

// Keyboard navigation for lightbox
document.addEventListener('keydown', function (e) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox || !lightbox.classList.contains('open')) return;

  if (e.key === 'Escape') closeLightbox();
  else if (e.key === 'ArrowLeft') navigateLightbox(-1);
  else if (e.key === 'ArrowRight') navigateLightbox(1);
});

/* ─── Utility ─── */

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}
