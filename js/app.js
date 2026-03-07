(async function () {
  try {
    let data;
    // Use inlined manifest if available (works without a server), otherwise fetch
    if (window.__MANIFEST__) {
      data = window.__MANIFEST__;
    } else {
      const response = await fetch('./manifest.json');
      if (!response.ok) throw new Error('Failed to load manifest');
      data = await response.json();
    }

    const page = document.body.dataset.page;

    if (page === 'home') {
      renderGrid(data.items.filter(item => !item.sold), false);
    } else if (page === 'sold') {
      renderGrid(data.items.filter(item => item.sold), true);
    } else if (page === 'item') {
      renderItemDetail(data.items);
    }
  } catch (error) {
    console.error('Error loading items:', error);
    const grid = document.getElementById('grid');
    const detail = document.getElementById('item-detail');
    if (grid) {
      grid.innerHTML = '<div class="empty-state"><h2>Unable to load items</h2><p>Please try again later.</p></div>';
    }
    if (detail) {
      detail.innerHTML = '<div class="empty-state"><h2>Unable to load item</h2><p>Could not load manifest.</p><p><a href="index.html" class="back-link">&larr; Back to collection</a></p></div>';
    }
  }
})();

/* ─── Grid Rendering ─── */

function renderGrid(items, showSoldBadge) {
  const grid = document.getElementById('grid');
  if (!grid) return;

  if (items.length === 0) {
    grid.innerHTML = showSoldBadge
      ? '<div class="empty-state"><h2>No sold items yet</h2><p>Check back later!</p></div>'
      : '<div class="empty-state"><h2>No items available</h2><p>New vintage treasures coming soon!</p></div>';
    return;
  }

  grid.innerHTML = items.map(item => `
    <a href="item.html?id=${encodeURIComponent(item.id)}" class="item-card">
      <div class="image-wrapper">
        ${item.cover
          ? `<img src="${item.cover}" alt="${escapeHtml(item.title)}" loading="lazy">`
          : '<div class="no-cover">No photo</div>'}
        ${showSoldBadge ? '<span class="sold-badge">Sold</span>' : ''}
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
    container.innerHTML = '<div class="empty-state"><h2>Item not found</h2><p><a href="index.html" class="back-link">&larr; Back to collection</a></p></div>';
    return;
  }

  document.title = `${item.title} — Vintage Collection`;

  const mainImage = item.images[0] || '';

  container.innerHTML = `
    <a href="${item.sold ? 'sold.html' : 'index.html'}" class="back-link">&larr; Back to ${item.sold ? 'sold items' : 'collection'}</a>
    <div class="item-layout">
      <div class="gallery">
        ${mainImage
          ? `<img src="${mainImage}" alt="${escapeHtml(item.title)}" class="main-image" id="mainImage" onclick="openLightbox(window._currentImageIndex || 0)">`
          : '<div class="main-image no-cover">No photos available</div>'}
        ${item.images.length > 1 ? `
          <div class="thumbnails">
            ${item.images.map((img, i) => `
              <img src="${img}" alt="${escapeHtml(item.title)} - photo ${i + 1}"
                   class="${i === 0 ? 'active' : ''}"
                   onclick="switchImage(${i})" loading="lazy">
            `).join('')}
          </div>
        ` : ''}
      </div>
      <div class="item-info">
        ${item.sold ? '<span class="sold-badge">Sold</span>' : ''}
        <h1 class="item-title">${escapeHtml(item.title)}</h1>
        <p class="item-price">${escapeHtml(item.price)}</p>
        ${item.description ? `<p class="item-description">${escapeHtml(item.description)}</p>` : ''}
        ${!item.sold ? '<div class="shipping-note"><span class="shipping-icon">&#9992;</span> International shipping available — costs at buyer\'s expense. <a href="https://wa.me/33627335434" target="_blank" rel="noopener noreferrer">Contact us</a> for a quote!</div>' : ''}
      </div>
    </div>
  `;

  window._galleryImages = item.images;
  window._currentImageIndex = 0;
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

  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function navigateLightbox(direction) {
  if (!window._galleryImages) return;

  const len = window._galleryImages.length;
  window._currentImageIndex = (window._currentImageIndex + direction + len) % len;

  const lightboxImg = document.getElementById('lightboxImg');
  if (lightboxImg) {
    lightboxImg.src = window._galleryImages[window._currentImageIndex];
  }
}

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
