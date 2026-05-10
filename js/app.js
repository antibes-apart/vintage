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
      const available = data.items.filter(item => !item.sold);
      window._allItems = available;
      const countEl = document.getElementById('item-count');
      if (countEl) countEl.textContent = `${available.length} item${available.length !== 1 ? 's' : ''} available`;
      renderGrid(available, false);
      setupSearch(available);
    } else if (page === 'sold') {
      const sold = data.items.filter(item => item.sold);
      window._allItems = sold;
      const countEl = document.getElementById('item-count');
      if (countEl) countEl.textContent = `${sold.length} item${sold.length !== 1 ? 's' : ''} sold`;
      renderGrid(sold, true);
      setupSearch(sold);
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

/* ─── Search Functionality ─── */

function setupSearch(allItems) {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    const filteredItems = filterItems(allItems, query);
    
    const countEl = document.getElementById('item-count');
    const page = document.body.dataset.page;
    if (countEl) {
      if (query) {
        countEl.textContent = `${filteredItems.length} result${filteredItems.length !== 1 ? 's' : ''} found`;
      } else {
        if (page === 'sold') {
          countEl.textContent = `${allItems.length} item${allItems.length !== 1 ? 's' : ''} sold`;
        } else {
          countEl.textContent = `${allItems.length} item${allItems.length !== 1 ? 's' : ''} available`;
        }
      }
    }
    
    const showSoldBadge = page === 'sold';
    renderGrid(filteredItems, showSoldBadge);
  });
}

function filterItems(items, query) {
  if (!query) return items;
  
  return items.filter(item => {
    const searchableText = `${item.title} ${item.description} ${item.price}`.toLowerCase();
    return searchableText.includes(query);
  });
}

/* ─── Grid Rendering ─── */

function renderGrid(items, showSoldBadge) {
  const grid = document.getElementById('grid');
  if (!grid) return;

  const searchInput = document.getElementById('search-input');
  const hasSearch = searchInput && searchInput.value.trim() !== '';

  if (items.length === 0) {
    if (hasSearch) {
      grid.innerHTML = '<div class="empty-state"><h2>No items match your search</h2><p>Try different keywords.</p></div>';
    } else if (showSoldBadge) {
      grid.innerHTML = '<div class="empty-state"><h2>No sold items yet</h2><p>Check back later!</p></div>';
    } else {
      grid.innerHTML = '<div class="empty-state"><h2>No items available</h2><p>New vintage treasures coming soon!</p></div>';
    }
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
