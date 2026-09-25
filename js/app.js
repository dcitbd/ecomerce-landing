// Dream Cart BD - Storefront Client Logic
// Slogan: স্মার্ট অফিস ও প্রযুক্তির বিশ্বস্ত ঠিকানা — you make.
// Hotlines: 01581 703 822 | 0181 827 3838
// Logo: https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

let currentProducts = [];
let cart = [];
let activeCategory = 'all';
let currentSearch = '';
let currentSort = 'default';
let activeModalProduct = null;
let activeModalImageIndex = 0;
let modalAutoSlideTimer = null;

// Checkout State
let checkoutState = {
  selectedDeliveryArea: 'cumilla',
  baseDeliveryFee: 90,
  deliveryFee: 90,
  isFreeDelivery: false,
  paymentMethod: 'cod',
  isOnline: false,
  onlineDiscountPercent: 4, // 4% discount on online payment
  onlineDiscountAmount: 0,
  subtotal: 0,
  totalPayable: 0,
  directBuyItem: null
};

function initApp() {
  currentProducts = getStoredProducts();
  loadCart();
  renderCategoryTabs();
  renderProducts();
  initOfferCountdown();
  initVisitorCounter();
  initCheckout();
  initSearchAndFilter();
  updateCartBadge();
}

/* ==========================================================================
   Countdown Timer (24h Urgent Cycle)
   ========================================================================== */
function initOfferCountdown() {
  function updateTimer() {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    let diff = endOfDay - now;
    if (diff < 0) diff = 24 * 3600 * 1000;

    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    const pad = (n) => String(n).padStart(2, '0');

    const dEl = document.getElementById('timer-days');
    const hEl = document.getElementById('timer-hours');
    const mEl = document.getElementById('timer-minutes');
    const sEl = document.getElementById('timer-seconds');

    if (dEl) dEl.innerText = '01';
    if (hEl) hEl.innerText = pad(hours);
    if (mEl) mEl.innerText = pad(minutes);
    if (sEl) sEl.innerText = pad(seconds);
  }
  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================================================
   Live Visitors Counter Simulation
   ========================================================================== */
function initVisitorCounter() {
  let baseVisitors = 132;
  const visitorCountEl = document.getElementById('live-visitor-count');
  if (visitorCountEl) {
    setInterval(() => {
      const change = Math.floor(Math.random() * 7) - 3;
      baseVisitors = Math.max(98, Math.min(195, baseVisitors + change));
      visitorCountEl.innerText = baseVisitors;
    }, 4500);
  }
}

/* ==========================================================================
   Category Tabs & Filter
   ========================================================================== */
function renderCategoryTabs() {
  const container = document.getElementById('category-tabs-container');
  if (!container) return;
  const categoriesList = typeof getStoredCategories === 'function' ? getStoredCategories() : INITIAL_CATEGORIES;
  container.innerHTML = categoriesList.map(cat => `
    <button class="filter-btn ${activeCategory === cat.id ? 'active' : ''}" onclick="selectCategory('${cat.id}')">
      <i class="bi ${cat.icon || 'bi-tag-fill'}"></i> ${cat.name}
    </button>
  `).join('');
}

window.selectCategory = function(catId) {
  activeCategory = catId;
  renderCategoryTabs();
  renderProducts();
};

function initSearchAndFilter() {
  const searchInput = document.getElementById('product-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.toLowerCase().trim();
      renderProducts();
    });
  }

  const sortSelect = document.getElementById('product-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderProducts();
    });
  }
}

/* ==========================================================================
   Render Products Grid (Active Products Only)
   ========================================================================== */
function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  // Filter out deactivated products (Requirement 4)
  let filtered = currentProducts.filter(p => p.isActive !== false);

  filtered = filtered.filter(p => {
    const matchCategory = (activeCategory === 'all') || (p.category === activeCategory);
    const matchSearch = !currentSearch || 
      p.title.toLowerCase().includes(currentSearch) || 
      p.categoryBn.toLowerCase().includes(currentSearch) ||
      (p.englishTitle && p.englishTitle.toLowerCase().includes(currentSearch));
    return matchCategory && matchSearch;
  });

  if (currentSort === 'price-low') {
    filtered.sort((a, b) => a.salePrice - b.salePrice);
  } else if (currentSort === 'price-high') {
    filtered.sort((a, b) => b.salePrice - a.salePrice);
  } else if (currentSort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  const countBadge = document.getElementById('filtered-product-count');
  if (countBadge) {
    countBadge.innerText = `${filtered.length} টি প্রোডাক্ট প্রদর্শিত হচ্ছে`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="mb-3 text-muted" style="font-size: 3rem;"><i class="bi bi-search"></i></div>
        <h4 class="fw-bold">কোনো প্রোডাক্ট খুঁজে পাওয়া যায়নি!</h4>
        <p class="text-muted">দয়া করে অন্য কোনো নাম বা ক্যাটাগরি দিয়ে চেষ্টা করুন।</p>
        <button class="btn btn-outline-primary mt-2" onclick="resetFilters()">সকল প্রোডাক্ট দেখুন</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const discountPct = Math.round(((p.regularPrice - p.salePrice) / p.regularPrice) * 100);
    const onlineSave4 = Math.round(p.salePrice * 0.04);

    return `
      <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
        <div class="product-card">
          <div class="product-img-wrapper" onclick="openProductModal('${p.id}')">
            <img src="${p.images[0]}" alt="${p.title}" class="product-img" loading="lazy">
            <span class="badge-discount">${discountPct}% ছাড়</span>
            ${p.badge ? `<span class="badge-custom">${p.badge}</span>` : ''}
            <span class="gallery-count-pill"><i class="bi bi-images"></i> ${p.images.length} ছবি</span>
          </div>

          <div class="product-content">
            <div class="d-flex justify-content-between align-items-center">
              <span class="product-category-text">${p.categoryBn}</span>
              <span class="badge ${p.stock > 0 ? (p.stock <= 5 ? 'bg-warning-subtle text-dark border border-warning' : 'bg-success-subtle text-success') : 'bg-danger-subtle text-danger'} rounded-pill px-2 py-1" style="font-size: 0.72rem;">
                ${p.stock > 0 ? (p.stock <= 5 ? `সীমিত স্টক: ${p.stock}` : `স্টক: ${p.stock}`) : 'স্টক আউট'}
              </span>
            </div>

            <h3 class="product-title" onclick="openProductModal('${p.id}')" title="${p.title}">
              ${p.title}
            </h3>

            <div class="product-rating-bar">
              <div>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
              </div>
              <span class="fw-bold text-dark ms-1">${p.rating}</span>
              <span class="rating-count">(${p.reviewsCount})</span>
            </div>

            <div class="price-block">
              <span class="current-price">৳${p.salePrice.toLocaleString()}</span>
              <span class="original-price">৳${p.regularPrice.toLocaleString()}</span>
            </div>

            <!-- Requirement 3: 4% online discount & Requirement 2: Free Delivery > 2000 -->
            <div class="online-save-chip">
              <i class="bi bi-lightning-charge-fill"></i> অনলাইনে পেমেন্টে ৪% ছাড়: <strong>-৳${onlineSave4.toLocaleString()}</strong>
            </div>
            ${p.salePrice >= 2000 ? `
              <div class="badge bg-success-subtle text-success border border-success mb-2 text-start p-1 px-2" style="font-size: 0.75rem;">
                <i class="bi bi-truck me-1"></i> এই পণ্যে <strong>ফ্রি হোম ডেলিভারি!</strong>
              </div>
            ` : ''}

            <div class="card-actions-grid">
              <button class="btn-order-now" onclick="quickOrder('${p.id}')">
                <i class="bi bi-bag-check-fill"></i> অর্ডার করুন
              </button>
              <button class="btn-add-cart" onclick="addToCart('${p.id}')">
                <i class="bi bi-cart-plus"></i> কার্ট
              </button>
            </div>

            <!-- Requirement 7: Dual Hotline Support for WhatsApp and Call (01581703822 & 01818273838) -->
            <div class="secondary-actions-bar">
              <button class="btn-quick-view flex-grow-1" onclick="openProductModal('${p.id}')" title="ছবি ও বিস্তারিত দেখুন">
                <i class="bi bi-eye"></i> বিস্তারিত
              </button>
              <div class="dropdown">
                <button class="btn btn-quick-wa dropdown-toggle" type="button" data-bs-toggle="dropdown" title="WhatsApp অর্ডার">
                  <i class="bi bi-whatsapp"></i> WA
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow border-0 p-2" style="border-radius: 10px; font-size: 0.85rem;">
                  <li><a class="dropdown-item py-2 rounded text-success fw-bold" href="https://wa.me/8801581703822?text=${encodeURIComponent('Hello Dream Cart BD, ' + p.title + ' (মূল্য: ৳' + p.salePrice + ') অর্ডার করতে চাই')}" target="_blank"><i class="bi bi-whatsapp me-2"></i> WhatsApp ১ (01581 703 822)</a></li>
                  <li><a class="dropdown-item py-2 rounded text-success fw-bold" href="https://wa.me/8801818273838?text=${encodeURIComponent('Hello Dream Cart BD, ' + p.title + ' (মূল্য: ৳' + p.salePrice + ') অর্ডার করতে চাই')}" target="_blank"><i class="bi bi-whatsapp me-2"></i> WhatsApp ২ (0181 827 3838)</a></li>
                </ul>
              </div>
              <div class="dropdown">
                <button class="btn btn-quick-call dropdown-toggle" type="button" data-bs-toggle="dropdown" title="কল করুন">
                  <i class="bi bi-telephone-fill"></i> কল
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow border-0 p-2" style="border-radius: 10px; font-size: 0.85rem;">
                  <li><a class="dropdown-item py-2 rounded text-primary fw-bold" href="tel:01581703822"><i class="bi bi-telephone-fill me-2"></i> কল ১: 01581 703 822</a></li>
                  <li><a class="dropdown-item py-2 rounded text-primary fw-bold" href="tel:01818273838"><i class="bi bi-telephone-fill me-2"></i> কল ২: 0181 827 3838</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.resetFilters = function() {
  activeCategory = 'all';
  currentSearch = '';
  const searchInput = document.getElementById('product-search-input');
  if (searchInput) searchInput.value = '';
  renderCategoryTabs();
  renderProducts();
};

/* ==========================================================================
   Product Single View Modal & Carousel
   ========================================================================== */
window.openProductModal = function(productId) {
  const product = currentProducts.find(p => p.id === productId);
  if (!product) return;

  activeModalProduct = product;
  activeModalImageIndex = 0;

  document.getElementById('modal-product-title').innerText = product.title;
  document.getElementById('modal-product-category').innerText = `${product.categoryBn} | কোড: ${product.id}`;
  document.getElementById('modal-product-price').innerText = `৳${product.salePrice.toLocaleString()}`;
  document.getElementById('modal-product-original-price').innerText = `৳${product.regularPrice.toLocaleString()}`;
  
  const discountPct = Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100);
  document.getElementById('modal-product-discount').innerText = `${discountPct}% ছাড়`;
  
  const onlineSave4 = Math.round(product.salePrice * 0.04);
  document.getElementById('modal-online-save-amount').innerText = `৳${onlineSave4.toLocaleString()}`;

  document.getElementById('modal-product-desc').innerText = product.description;
  document.getElementById('modal-product-warranty').innerText = product.warranty || '১ বছরের অফিসিয়াল সার্ভিস ওয়ারেন্টি';
  document.getElementById('modal-product-qty').value = 1;

  // Free delivery tag if >= 2000
  const freeDelBadge = document.getElementById('modal-free-delivery-badge');
  if (freeDelBadge) {
    if (product.salePrice >= 2000) {
      freeDelBadge.style.display = 'inline-block';
      freeDelBadge.innerHTML = `<i class="bi bi-truck me-1"></i> ২০০০৳+ শপিংয়ে <strong>ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!</strong>`;
    } else {
      freeDelBadge.style.display = 'none';
    }
  }

  // Stock
  const stockEl = document.getElementById('modal-product-stock');
  if (stockEl) {
    stockEl.innerHTML = `
      <span class="badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'} px-3 py-2">
        <i class="bi bi-box-seam me-1"></i> ${product.stock > 0 ? `ইন স্টক (${product.stock} টি)` : 'স্টক আউট'}
      </span>
      <span class="text-danger fw-bold ms-2" style="font-size: 0.85rem;">
        ⚡ সীমিত স্টক!
      </span>
    `;
  }

  // Highlights
  const highlightsEl = document.getElementById('modal-product-highlights');
  if (highlightsEl) {
    highlightsEl.innerHTML = product.highlights.map(h => `
      <li class="mb-2"><i class="bi bi-check2-circle text-primary me-2 fw-bold"></i>${h}</li>
    `).join('');
  }

  // Colors
  const colorsEl = document.getElementById('modal-product-colors');
  if (colorsEl) {
    colorsEl.innerHTML = product.colors.map((c, i) => `
      <div class="variant-chip ${i === 0 ? 'active' : ''}" onclick="selectModalColor(this, '${c}')">
        <i class="bi bi-palette me-1"></i>${c}
      </div>
    `).join('');
  }

  // Sizes
  const sizesEl = document.getElementById('modal-product-sizes');
  if (sizesEl) {
    sizesEl.innerHTML = product.sizes.map((s, i) => `
      <div class="variant-chip ${i === 0 ? 'active' : ''}" onclick="selectModalSize(this, '${s}')">
        <i class="bi bi-aspect-ratio me-1"></i>${s}
      </div>
    `).join('');
  }

  // Setup Dual WhatsApp links
  const wa1 = document.getElementById('modal-btn-wa1');
  const wa2 = document.getElementById('modal-btn-wa2');
  const msg = encodeURIComponent(`আসসালামু আলাইকুম Dream Cart BD, আমি '${product.title}' (কোড: ${product.id}, মূল্য: ৳${product.salePrice}) অর্ডার করতে চাই।`);
  if (wa1) wa1.href = `https://wa.me/8801581703822?text=${msg}`;
  if (wa2) wa2.href = `https://wa.me/8801818273838?text=${msg}`;

  renderModalGallery();
  startModalAutoSlide();

  const modalEl = document.getElementById('productViewModal');
  if (modalEl) {
    let modal = bootstrap.Modal.getInstance(modalEl);
    if (!modal) {
      modal = new bootstrap.Modal(modalEl);
    }
    modal.show();
    modalEl.addEventListener('hidden.bs.modal', stopModalAutoSlide, { once: true });
  }
};

window.closeProductModal = function() {
  stopModalAutoSlide();
  const modalEl = document.getElementById('productViewModal');
  if (modalEl) {
    let modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) {
      modal.hide();
    }
    // Fail-safe cleanup to ensure backdrop and display close instantly
    setTimeout(() => {
      modalEl.classList.remove('show');
      modalEl.style.display = 'none';
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');
      document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
    }, 200);
  }
};

function renderModalGallery() {
  if (!activeModalProduct) return;
  const mainImg = document.getElementById('modal-main-image');
  const thumbsContainer = document.getElementById('modal-gallery-thumbs');
  const counterEl = document.getElementById('modal-gallery-counter');

  if (mainImg) mainImg.src = activeModalProduct.images[activeModalImageIndex];
  if (counterEl) counterEl.innerText = `${activeModalImageIndex + 1} / ${activeModalProduct.images.length}`;

  if (thumbsContainer) {
    thumbsContainer.innerHTML = activeModalProduct.images.map((img, idx) => `
      <div class="thumb-item ${idx === activeModalImageIndex ? 'active' : ''}" onclick="setModalImage(${idx})">
        <img src="${img}" alt="thumbnail ${idx + 1}">
      </div>
    `).join('');
  }
}

window.setModalImage = function(index) {
  if (!activeModalProduct) return;
  activeModalImageIndex = index;
  renderModalGallery();
};

window.prevModalImage = function() {
  if (!activeModalProduct) return;
  activeModalImageIndex = (activeModalImageIndex - 1 + activeModalProduct.images.length) % activeModalProduct.images.length;
  renderModalGallery();
};

window.nextModalImage = function() {
  if (!activeModalProduct) return;
  activeModalImageIndex = (activeModalImageIndex + 1) % activeModalProduct.images.length;
  renderModalGallery();
};

function startModalAutoSlide() {
  stopModalAutoSlide();
  modalAutoSlideTimer = setInterval(nextModalImage, 3500);
}

function stopModalAutoSlide() {
  if (modalAutoSlideTimer) {
    clearInterval(modalAutoSlideTimer);
    modalAutoSlideTimer = null;
  }
}

window.selectModalColor = function(el, color) {
  document.querySelectorAll('#modal-product-colors .variant-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
};

window.selectModalSize = function(el, size) {
  document.querySelectorAll('#modal-product-sizes .variant-chip').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
};

window.adjustModalQty = function(delta) {
  const input = document.getElementById('modal-product-qty');
  if (!input) return;
  let val = parseInt(input.value) || 1;
  input.value = Math.max(1, val + delta);
};

window.orderNowFromModal = function() {
  if (!activeModalProduct) return;
  const colorEl = document.querySelector('#modal-product-colors .variant-chip.active');
  const sizeEl = document.querySelector('#modal-product-sizes .variant-chip.active');
  const qtyInput = document.getElementById('modal-product-qty');

  checkoutState.directBuyItem = {
    productId: activeModalProduct.id,
    title: activeModalProduct.title,
    color: colorEl ? colorEl.innerText.trim() : activeModalProduct.colors[0],
    size: sizeEl ? sizeEl.innerText.trim() : activeModalProduct.sizes[0],
    price: activeModalProduct.salePrice,
    regularPrice: activeModalProduct.regularPrice,
    image: activeModalProduct.images[0],
    quantity: qtyInput ? parseInt(qtyInput.value) || 1 : 1
  };

  const modalEl = document.getElementById('productViewModal');
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();

  renderCheckoutItems();
  scrollToCheckout();
};

window.addToCartFromModal = function() {
  if (!activeModalProduct) return;
  const colorEl = document.querySelector('#modal-product-colors .variant-chip.active');
  const sizeEl = document.querySelector('#modal-product-sizes .variant-chip.active');
  const qtyInput = document.getElementById('modal-product-qty');

  addItemToCart(
    activeModalProduct,
    colorEl ? colorEl.innerText.trim() : activeModalProduct.colors[0],
    sizeEl ? sizeEl.innerText.trim() : activeModalProduct.sizes[0],
    qtyInput ? parseInt(qtyInput.value) || 1 : 1
  );

  const modalEl = document.getElementById('productViewModal');
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();

  openCartDrawer();
};

/* ==========================================================================
   Cart Operations & Free Delivery Progress
   ========================================================================== */
function loadCart() {
  const stored = localStorage.getItem('dreamcart_cart');
  cart = stored ? JSON.parse(stored) : [];
}

function saveCart() {
  localStorage.setItem('dreamcart_cart', JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
  if (!checkoutState.directBuyItem) renderCheckoutItems();
}

window.addToCart = function(productId) {
  const product = currentProducts.find(p => p.id === productId);
  if (!product) return;
  addItemToCart(product, product.colors[0], product.sizes[0], 1);
  showToast(`"${product.title.slice(0, 30)}..." কার্টে যোগ হয়েছে!`);
};

function addItemToCart(product, color, size, quantity) {
  const existing = cart.find(item => item.productId === product.id && item.color === color && item.size === size);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      productId: product.id,
      title: product.title,
      color: color,
      size: size,
      price: product.salePrice,
      regularPrice: product.regularPrice,
      image: product.images[0],
      quantity: quantity
    });
  }
  saveCart();
}

window.quickOrder = function(productId) {
  const product = currentProducts.find(p => p.id === productId);
  if (!product) return;
  checkoutState.directBuyItem = {
    productId: product.id,
    title: product.title,
    color: product.colors[0],
    size: product.sizes[0],
    price: product.salePrice,
    regularPrice: product.regularPrice,
    image: product.images[0],
    quantity: 1
  };
  renderCheckoutItems();
  scrollToCheckout();
};

function updateCartBadge() {
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  const h = document.getElementById('header-cart-count');
  const f = document.getElementById('floating-cart-count');
  if (h) h.innerText = count;
  if (f) f.innerText = count;
}

window.openCartDrawer = function() {
  renderCartDrawer();
  const drawerEl = document.getElementById('cartOffcanvas');
  if (drawerEl) new bootstrap.Offcanvas(drawerEl).show();
};

function renderCartDrawer() {
  const container = document.getElementById('cart-drawer-items');
  const totalEl = document.getElementById('cart-drawer-subtotal');
  const freeDelBar = document.getElementById('cart-drawer-free-delivery');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-cart-x text-muted" style="font-size: 3.5rem;"></i>
        <h5 class="fw-bold mt-3">আপনার কার্ট খালি আছে!</h5>
        <p class="text-muted">পছন্দের যেকোনো অফিস ইকুইপমেন্ট কার্টে যোগ করুন।</p>
      </div>
    `;
    if (totalEl) totalEl.innerText = '৳০';
    if (freeDelBar) freeDelBar.style.display = 'none';
    return;
  }

  let subtotal = 0;
  container.innerHTML = cart.map((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    return `
      <div class="card mb-3 border-light shadow-sm">
        <div class="card-body p-2 d-flex gap-3 align-items-center">
          <img src="${item.image}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
          <div class="flex-grow-1">
            <h6 class="mb-1 text-truncate" style="max-width: 190px; font-size: 0.9rem;">${item.title}</h6>
            <div class="text-muted" style="font-size: 0.76rem;">
              <span>${item.color}</span> | <span>${item.size}</span>
            </div>
            <div class="fw-bold text-primary mt-1">৳${item.price.toLocaleString()} × ${item.quantity} = ৳${itemTotal.toLocaleString()}</div>
          </div>
          <div class="d-flex flex-column align-items-end gap-1">
            <button class="btn btn-sm btn-outline-danger border-0 p-1" onclick="removeCartItem(${index})" title="মুছে ফেলুন">
              <i class="bi bi-trash"></i>
            </button>
            <div class="btn-group btn-group-sm border rounded">
              <button class="btn btn-light py-0 px-2" onclick="updateCartItemQty(${index}, -1)">-</button>
              <span class="px-2 py-0 d-flex align-items-center bg-white">${item.quantity}</span>
              <button class="btn btn-light py-0 px-2" onclick="updateCartItemQty(${index}, 1)">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (totalEl) totalEl.innerText = `৳${subtotal.toLocaleString()}`;

  // Requirement 2: Free Delivery Progress Bar (>2000 BDT)
  if (freeDelBar) {
    freeDelBar.style.display = 'block';
    const threshold = 2000;
    if (subtotal >= threshold) {
      freeDelBar.innerHTML = `
        <div class="free-delivery-box mb-2">
          <div class="d-flex align-items-center gap-2 text-success fw-bold small">
            <i class="bi bi-check-circle-fill fs-5"></i>
            <span>🎉 অভিনন্দন! ২০০০৳+ অর্ডারে আপনার <strong>ডেলিভারি সম্পূর্ণ ফ্রি (৳০)!</strong></span>
          </div>
          <div class="free-delivery-progress">
            <div class="free-delivery-progress-bar" style="width: 100%;"></div>
          </div>
        </div>
      `;
    } else {
      const remaining = threshold - subtotal;
      const pct = Math.round((subtotal / threshold) * 100);
      freeDelBar.innerHTML = `
        <div class="free-delivery-box mb-2">
          <div class="d-flex justify-content-between text-dark fw-bold small">
            <span>ফ্রি ডেলিভারি পেতে বাকি:</span>
            <span class="text-danger fw-bold">৳${remaining.toLocaleString()}</span>
          </div>
          <div class="free-delivery-progress">
            <div class="free-delivery-progress-bar" style="width: ${pct}%;"></div>
          </div>
          <div class="text-muted mt-1" style="font-size: 0.75rem;">
            আর মাত্র ৳${remaining.toLocaleString()} টাকার শপিং করলেই ডেলিভারি সম্পূর্ণ ফ্রি!
          </div>
        </div>
      `;
    }
  }
}

window.updateCartItemQty = function(index, delta) {
  if (!cart[index]) return;
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  saveCart();
};

window.removeCartItem = function(index) {
  cart.splice(index, 1);
  saveCart();
};

window.proceedToCheckoutFromCart = function() {
  checkoutState.directBuyItem = null;
  renderCheckoutItems();
  const drawerEl = document.getElementById('cartOffcanvas');
  const offcanvas = bootstrap.Offcanvas.getInstance(drawerEl);
  if (offcanvas) offcanvas.hide();
  scrollToCheckout();
};

/* ==========================================================================
   Checkout System: AI Address, 4% Online Discount, Free Delivery >= 2000
   ========================================================================== */
function initCheckout() {
  const addressInput = document.getElementById('customerAddress');
  if (addressInput) {
    addressInput.addEventListener('input', (e) => {
      runAIAddressAnalysis(e.target.value);
    });
  }

  document.querySelectorAll('input[name="deliveryArea"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      selectDeliveryArea(e.target.value, false);
    });
  });

  document.querySelectorAll('.payment-card-opt').forEach(card => {
    card.addEventListener('click', () => {
      selectPaymentMethod(card.getAttribute('data-method'));
    });
  });

  const form = document.getElementById('checkout-form');
  if (form) form.addEventListener('submit', handleOrderSubmit);

  renderCheckoutItems();
  recalculateOrderTotals();
}

function runAIAddressAnalysis(addressText) {
  const text = (addressText || '').toLowerCase().trim();
  const aiStatusBox = document.getElementById('ai-address-status');
  const aiStatusText = document.getElementById('ai-detected-text');

  if (!text || text.length < 3) {
    if (aiStatusBox) aiStatusBox.style.display = 'none';
    return;
  }

  const cumillaKeywords = [
    'কুমিল্লা', 'comilla', 'cumilla', 'পদুয়ার বাজার', 'paduar bazar', 'শাসনগাছা', 'shasongacha', 
    'কান্দিরপাড়', 'kandirpar', 'টমসমব্রিজ', 'tomsom', 'লাকসাম', 'laksam', 'বরুড়া', 'barura', 
    'চৌদ্দগ্রাম', 'chauddagram', 'মুরাদনগর', 'muradnagar', 'দাউদকান্দি', 'daudkandi', 
    'চান্দিনা', 'chandina', 'আদর্শ সদর', 'adarsha sadar', 'বুড়িচং', 'burichang', 'ব্রাহ্মণপাড়া', 'দেবিদ্বার'
  ];

  const dhakaKeywords = [
    'ঢাকা', 'dhaka', 'ঢাকার', 'মিরপুর', 'mirpur', 'উত্তরা', 'uttara', 'ধানমন্ডি', 'dhanmondi', 
    'গুলশান', 'gulshan', 'বনানী', 'banani', 'মতিঝিল', 'motijheel', 'গাজীপুর', 'gazipur', 
    'সাভার', 'savar', 'বাড্ডা', 'badda', 'মোহাম্মদপুর', 'mohammadpur', 'কেরানীগঞ্জ', 'keraniganj', 
    'খিলগাঁও', 'khilgaon', 'যাত্রাবাড়ী', 'jatrabari', 'রমনা', 'ramna', 'তেজগাঁও', 'tejgaon', 
    'পল্টন', 'paltan', 'মগবাজার', 'বসুন্ধরা', 'bashundhara', 'শ্যামলী', 'shyamoli', 'কাকরাইল'
  ];

  let detectedArea = 'outside';
  let detectedReason = '';

  const matchCumilla = cumillaKeywords.find(k => text.includes(k));
  const matchDhaka = dhakaKeywords.find(k => text.includes(k));

  if (matchCumilla) {
    detectedArea = 'cumilla';
    detectedReason = `ঠিকানায় "${matchCumilla}" সনাক্ত → কুমিল্লার ভিতর`;
  } else if (matchDhaka) {
    detectedArea = 'dhaka';
    detectedReason = `ঠিকানায় "${matchDhaka}" সনাক্ত → ঢাকার ভিতরে`;
  } else {
    detectedArea = 'outside';
    detectedReason = `কুমিল্লা ও ঢাকার বাইরের জেলা সনাক্ত`;
  }

  selectDeliveryArea(detectedArea, true);

  if (aiStatusBox && aiStatusText) {
    aiStatusBox.style.display = 'flex';
    aiStatusText.innerHTML = `<strong>✨ এআই ডিটেকশন:</strong> ${detectedReason} ${checkoutState.isFreeDelivery ? '(২০০০৳+ শপিংয়ে চার্জ সম্পূর্ণ ফ্রি!)' : ''}`;
  }
}

function selectDeliveryArea(areaId, fromAI = false) {
  checkoutState.selectedDeliveryArea = areaId;

  if (areaId === 'cumilla') checkoutState.baseDeliveryFee = 90;
  else if (areaId === 'dhaka') checkoutState.baseDeliveryFee = 110;
  else checkoutState.baseDeliveryFee = 135;

  const radio = document.querySelector(`input[name="deliveryArea"][value="${areaId}"]`);
  if (radio) radio.checked = true;

  document.querySelectorAll('.delivery-radio-card').forEach(card => card.classList.remove('active'));
  if (radio) {
    const parentCard = radio.closest('.delivery-radio-card');
    if (parentCard) parentCard.classList.add('active');
  }

  recalculateOrderTotals();
}

function selectPaymentMethod(method) {
  checkoutState.paymentMethod = method;
  checkoutState.isOnline = (method !== 'cod');

  document.querySelectorAll('.payment-card-opt').forEach(card => {
    card.classList.toggle('active', card.getAttribute('data-method') === method);
  });

  const discountBanner = document.getElementById('online-discount-banner');
  const instructionsBox = document.getElementById('payment-instructions-box');
  const onlineInputs = document.getElementById('online-payment-inputs');
  const methodTitle = document.getElementById('selected-method-title');
  const detailsContent = document.getElementById('payment-details-content');

  if (checkoutState.isOnline) {
    if (discountBanner) discountBanner.style.display = 'flex';
    if (instructionsBox) instructionsBox.style.display = 'block';
    if (onlineInputs) onlineInputs.style.display = 'block';

    if (method === 'bkash') {
      if (methodTitle) methodTitle.innerText = 'বিকাশ (bKash) পেমেন্ট নির্দেশিকা:';
      if (detailsContent) {
        detailsContent.innerHTML = `
          <div class="mb-2">
            <div><strong>১. পার্সোনাল বিকাশ (Send Money):</strong></div>
            <div class="account-copy-box">
              <span>০১৮৭৯৬৫৩১৪৩</span>
              <button type="button" class="btn btn-sm btn-outline-danger" onclick="copyText('01879653143')">কপি</button>
            </div>
          </div>
          <div>
            <div><strong>২. বিকাশ পেমেন্ট শুধুমাত্র (Make Payment):</strong></div>
            <div class="account-copy-box">
              <span>০১৫৮১৭০৩৮২২</span>
              <button type="button" class="btn btn-sm btn-outline-danger" onclick="copyText('01581703822')">কপি</button>
            </div>
          </div>
          <div class="text-muted mt-2" style="font-size: 0.82rem;">
            * টাকা পাঠিয়ে TrxID ও প্রেরকের নম্বর নিচে দিন। মোট বিল থেকে <strong>৪% ক্যাশ ডিসকাউন্ট</strong> পাচ্ছেন!
          </div>
        `;
      }
    } else if (method === 'nagad') {
      if (methodTitle) methodTitle.innerText = 'নগদ (Nagad) পেমেন্ট নির্দেশিকা:';
      if (detailsContent) {
        detailsContent.innerHTML = `
          <div>
            <div><strong>নগদ পার্সোনাল (Send Money মাত্র):</strong></div>
            <div class="account-copy-box">
              <span>০১৮৭৯৬৫৩১৪৩</span>
              <button type="button" class="btn btn-sm btn-outline-warning text-dark" onclick="copyText('01879653143')">কপি</button>
            </div>
          </div>
          <div class="text-muted mt-2" style="font-size: 0.82rem;">
            * টাকা পাঠিয়ে TrxID ও প্রেরকের নম্বর দিন। মোট বিল থেকে <strong>৪% ক্যাশ ডিসকাউন্ট</strong> পাচ্ছেন!
          </div>
        `;
      }
    } else if (method === 'rocket') {
      if (methodTitle) methodTitle.innerText = 'রকেট (Rocket) পেমেন্ট নির্দেশিকা:';
      if (detailsContent) {
        detailsContent.innerHTML = `
          <div>
            <div><strong>রকেট পার্সোনাল (Send Money):</strong></div>
            <div class="account-copy-box">
              <span>০১৫৮১৭০৩৮২২</span>
              <button type="button" class="btn btn-sm btn-outline-primary" onclick="copyText('01581703822')">কপি</button>
            </div>
          </div>
          <div class="text-muted mt-2" style="font-size: 0.82rem;">
            * টাকা পাঠিয়ে TrxID ও নম্বর দিন। মোট বিল থেকে <strong>৪% ক্যাশ ডিসকাউন্ট</strong> পাবেন!
          </div>
        `;
      }
    } else if (method === 'bank') {
      if (methodTitle) methodTitle.innerText = 'ব্যাংক পেমেন্ট নির্দেশিকা:';
      if (detailsContent) {
        detailsContent.innerHTML = `
          <div class="p-2 border rounded bg-white">
            <div><strong>ব্যাংক:</strong> Islami Bank BD Limited (Comilla Branch)</div>
            <div><strong>একাউন্ট নাম:</strong> Jainal Abedin</div>
            <div class="d-flex justify-content-between align-items-center mt-1">
              <span><strong>একাউন্ট নম্বর:</strong> 20508070200030208</span>
              <button type="button" class="btn btn-sm btn-outline-success" onclick="copyText('20508070200030208')">কপি</button>
            </div>
          </div>
          <div class="text-muted mt-2" style="font-size: 0.82rem;">
            * ট্রান্সফার বা জমা করার পর TrxID বা রেফারেন্স নিচে দিন। মোট বিল থেকে <strong>৪% ক্যাশ ডিসকাউন্ট</strong> পাবেন!
          </div>
        `;
      }
    }
  } else {
    if (discountBanner) discountBanner.style.display = 'none';
    if (instructionsBox) instructionsBox.style.display = 'none';
    if (onlineInputs) onlineInputs.style.display = 'none';
  }

  recalculateOrderTotals();
}

function renderCheckoutItems() {
  const container = document.getElementById('checkout-items-list');
  if (!container) return;

  const items = checkoutState.directBuyItem ? [checkoutState.directBuyItem] : cart;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="alert alert-warning py-3">
        <i class="bi bi-info-circle me-1"></i> আপনার কার্টে কোনো প্রোডাক্ট নেই। উপরে যেকোনো প্রোডাক্টে 'অর্ডার করুন' চাপুন।
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="d-flex align-items-center gap-3 py-2 border-bottom">
      <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;">
      <div class="flex-grow-1">
        <h6 class="mb-0 text-truncate" style="max-width: 220px; font-size: 0.9rem;">${item.title}</h6>
        <div class="text-muted" style="font-size: 0.78rem;">${item.color} | ${item.size}</div>
      </div>
      <div class="text-end">
        <div class="fw-bold" style="font-size: 0.92rem;">৳${(item.price * item.quantity).toLocaleString()}</div>
        <div class="text-muted" style="font-size: 0.75rem;">পরিমাণ: ${item.quantity} টি</div>
      </div>
    </div>
  `).join('');

  if (checkoutState.directBuyItem) {
    container.innerHTML += `
      <div class="text-end mt-2">
        <button type="button" class="btn btn-sm btn-link text-decoration-none text-muted" onclick="clearDirectBuy()">
          <i class="bi bi-x-circle me-1"></i> পুরো কার্ট লোড করুন
        </button>
      </div>
    `;
  }

  recalculateOrderTotals();
}

window.clearDirectBuy = function() {
  checkoutState.directBuyItem = null;
  renderCheckoutItems();
};

function recalculateOrderTotals() {
  const items = checkoutState.directBuyItem ? [checkoutState.directBuyItem] : cart;
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  checkoutState.subtotal = subtotal;

  // Requirement 2: Free delivery if subtotal >= 2000 BDT
  if (subtotal >= 2000) {
    checkoutState.isFreeDelivery = true;
    checkoutState.deliveryFee = 0;
  } else {
    checkoutState.isFreeDelivery = false;
    checkoutState.deliveryFee = checkoutState.baseDeliveryFee;
  }

  // Requirement 3: 4% Discount for Online Payment
  if (checkoutState.isOnline && subtotal > 0) {
    checkoutState.onlineDiscountAmount = Math.round(subtotal * 0.04);
  } else {
    checkoutState.onlineDiscountAmount = 0;
  }

  checkoutState.totalPayable = Math.max(0, subtotal - checkoutState.onlineDiscountAmount + checkoutState.deliveryFee);

  const subtotalEl = document.getElementById('checkout-subtotal');
  const discountRow = document.getElementById('checkout-discount-row');
  const discountEl = document.getElementById('checkout-discount-amount');
  const deliveryEl = document.getElementById('checkout-delivery-fee');
  const totalEl = document.getElementById('checkout-total-payable');
  const freeDelBadge = document.getElementById('checkout-free-delivery-badge');

  if (subtotalEl) subtotalEl.innerText = `৳${subtotal.toLocaleString()}`;
  if (totalEl) totalEl.innerText = `৳${checkoutState.totalPayable.toLocaleString()}`;

  if (deliveryEl) {
    if (checkoutState.isFreeDelivery) {
      deliveryEl.innerHTML = `<span class="badge bg-success">ফ্রি (৳০)</span> <span class="text-muted text-decoration-line-through small">৳${checkoutState.baseDeliveryFee}</span>`;
    } else {
      deliveryEl.innerText = `৳${checkoutState.deliveryFee.toLocaleString()}`;
    }
  }

  if (freeDelBadge) {
    if (checkoutState.isFreeDelivery) {
      freeDelBadge.style.display = 'block';
      freeDelBadge.innerHTML = `🎉 অভিনন্দন! ২০০০৳+ অর্ডারে আপনার <strong>ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!</strong>`;
    } else if (subtotal > 0) {
      freeDelBadge.style.display = 'block';
      const need = 2000 - subtotal;
      freeDelBadge.innerHTML = `💡 আর মাত্র <strong>৳${need.toLocaleString()}</strong> টাকার শপিং করলেই ডেলিভারি সম্পূর্ণ ফ্রি পাবেন!`;
    } else {
      freeDelBadge.style.display = 'none';
    }
  }

  if (discountRow && discountEl) {
    if (checkoutState.isOnline && checkoutState.onlineDiscountAmount > 0) {
      discountRow.style.display = 'flex';
      discountEl.innerText = `-৳${checkoutState.onlineDiscountAmount.toLocaleString()}`;
    } else {
      discountRow.style.display = 'none';
    }
  }
}

/* ==========================================================================
   Order Submission & Confirmation System
   ========================================================================== */
function handleOrderSubmit(e) {
  e.preventDefault();
  const items = checkoutState.directBuyItem ? [checkoutState.directBuyItem] : cart;

  if (items.length === 0) {
    alert('অনুগ্রহ করে অর্ডার করার আগে অন্তত একটি প্রোডাক্ট নির্বাচন করুন।');
    return;
  }

  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const email = document.getElementById('customerEmail')?.value.trim() || '';
  const address = document.getElementById('customerAddress').value.trim();
  const notes = document.getElementById('customerNotes')?.value.trim() || '';

  if (!name) { alert('অনুগ্রহ করে আপনার নাম লিখুন।'); return; }
  if (!phone || phone.length < 11) { alert('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: 01818273838)।'); return; }
  if (!address) { alert('অনুগ্রহ করে আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।'); return; }

  let senderNumber = '';
  let trxId = '';

  if (checkoutState.isOnline) {
    senderNumber = document.getElementById('senderPhone').value.trim();
    trxId = document.getElementById('transactionId').value.trim();

    if (!senderNumber) { alert('অনলাইন পেমেন্টে আপনার প্রেরক নম্বর প্রদান করুন।'); return; }
    if (!trxId) { alert('অনলাইন পেমেন্ট ভেরিফিকেশনের জন্য TrxID দেওয়া বাধ্যতামূলক।'); return; }
  }

  const orderId = `DCB-${Math.floor(10000 + Math.random() * 90000)}`;

  const areaNames = {
    'cumilla': 'কুমিল্লার ভিতর',
    'dhaka': 'ঢাকার ভিতরে',
    'outside': 'কুমিল্লা ও ঢাকার বাইরে'
  };

  const paymentNames = {
    'cod': 'ক্যাশ অন ডেলিভারি (Cash on Delivery)',
    'bkash': 'বিকাশ পেমেন্ট (bKash)',
    'nagad': 'নগদ পেমেন্ট (Nagad)',
    'rocket': 'রকেট পেমেন্ট (Rocket)',
    'bank': 'ব্যাংক পেমেন্ট (Islami Bank BD Ltd)'
  };

  const newOrder = {
    orderId: orderId,
    orderDate: new Date().toISOString(),
    customerName: name,
    phone: phone,
    email: email || 'দেওয়া হয়নি',
    fullAddress: address,
    deliveryAreaId: checkoutState.selectedDeliveryArea,
    deliveryAreaName: areaNames[checkoutState.selectedDeliveryArea],
    deliveryFee: checkoutState.deliveryFee,
    isFreeDelivery: checkoutState.isFreeDelivery,
    paymentMethod: checkoutState.paymentMethod,
    paymentMethodName: paymentNames[checkoutState.paymentMethod],
    senderNumber: senderNumber,
    trxId: trxId,
    isOnlinePayment: checkoutState.isOnline,
    items: JSON.parse(JSON.stringify(items)),
    subtotal: checkoutState.subtotal,
    discountPercent: checkoutState.isOnline ? 4 : 0,
    discountAmount: checkoutState.onlineDiscountAmount,
    totalPayable: checkoutState.totalPayable,
    status: 'Pending',
    statusBn: 'নতুন অর্ডার (অপেক্ষমাণ)',
    notes: notes
  };

  const allOrders = getStoredOrders();
  allOrders.unshift(newOrder);
  saveStoredOrders(allOrders);

  cart = [];
  checkoutState.directBuyItem = null;
  saveCart();
  e.target.reset();

  showOrderSuccessModal(newOrder);
}

function showOrderSuccessModal(order) {
  const modalEl = document.getElementById('orderSuccessModal');
  if (!modalEl) return;

  document.getElementById('conf-order-id').innerText = order.orderId;
  document.getElementById('conf-order-date').innerText = new Date(order.orderDate).toLocaleString('bn-BD');
  document.getElementById('conf-customer-name').innerText = order.customerName;
  document.getElementById('conf-customer-phone').innerText = order.phone;
  document.getElementById('conf-customer-address').innerText = order.fullAddress;
  document.getElementById('conf-payment-method').innerText = order.paymentMethodName;
  
  const trxRow = document.getElementById('conf-trx-row');
  if (trxRow) {
    if (order.isOnlinePayment && order.trxId) {
      trxRow.style.display = 'table-row';
      document.getElementById('conf-trx-id').innerText = `${order.trxId} (প্রেরক: ${order.senderNumber})`;
    } else {
      trxRow.style.display = 'none';
    }
  }

  const itemsContainer = document.getElementById('conf-items-list');
  if (itemsContainer) {
    itemsContainer.innerHTML = order.items.map(item => `
      <tr>
        <td>
          <strong>${item.title}</strong><br>
          <small class="text-muted">কালার: ${item.color} | সাইজ: ${item.size}</small>
        </td>
        <td class="text-center">${item.quantity}</td>
        <td class="text-end">৳${item.price.toLocaleString()}</td>
        <td class="text-end fw-bold">৳${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');
  }

  document.getElementById('conf-subtotal').innerText = `৳${order.subtotal.toLocaleString()}`;
  document.getElementById('conf-delivery').innerText = order.isFreeDelivery ? 'ফ্রি (৳০)' : `৳${order.deliveryFee.toLocaleString()}`;
  document.getElementById('conf-total').innerText = `৳${order.totalPayable.toLocaleString()}`;

  const discountRow = document.getElementById('conf-discount-row');
  if (discountRow) {
    if (order.discountAmount > 0) {
      discountRow.style.display = 'table-row';
      document.getElementById('conf-discount').innerText = `-৳${order.discountAmount.toLocaleString()}`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  generateCustomerEmailPreview(order);

  // Setup Dual WhatsApp Buttons in Confirmation Modal (Requirement 7)
  const waText = encodeURIComponent(
    `*Dream Cart BD - নতুন অর্ডার কনফার্মেশন*\n` +
    `অর্ডার আইডি: ${order.orderId}\n` +
    `গ্রাহক: ${order.customerName}\n` +
    `ফোন: ${order.phone}\n` +
    `ঠিকানা: ${order.fullAddress}\n` +
    `আইটেম: ${order.items.map(i => i.title + ' (x' + i.quantity + ')').join(', ')}\n` +
    `পেমেন্ট পদ্ধতি: ${order.paymentMethodName}\n` +
    (order.trxId ? `TrxID: ${order.trxId} (নম্বর: ${order.senderNumber})\n` : '') +
    `মোট বিল: ৳${order.totalPayable}`
  );

  const confWa1 = document.getElementById('conf-btn-whatsapp1');
  const confWa2 = document.getElementById('conf-btn-whatsapp2');
  if (confWa1) confWa1.href = `https://wa.me/8801581703822?text=${waText}`;
  if (confWa2) confWa2.href = `https://wa.me/8801818273838?text=${waText}`;

  new bootstrap.Modal(modalEl).show();
}

function generateCustomerEmailPreview(order) {
  const emailBox = document.getElementById('customer-email-preview-content');
  if (!emailBox) return;

  const emailSubject = `Dream Cart BD - আপনার অর্ডার কনফার্মেশন (#${order.orderId})`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #0f172a; color: #fff; padding: 20px; text-align: center;">
        <img src="https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg" alt="Dream Cart BD" style="width: 55px; height: 55px; object-fit: cover; border-radius: 10px; margin-bottom: 8px;">
        <h2 style="margin: 0; color: #fff;">Dream Cart BD</h2>
        <p style="margin: 4px 0 0; color: #e11d48; font-weight: bold; font-size: 13px;">স্মার্ট অফিস ও প্রযুক্তির বিশ্বস্ত ঠিকানা — you make.</p>
      </div>
      <div style="padding: 20px; background: #ffffff;">
        <h3 style="color: #0f172a; margin-top: 0;">অর্ডার সফলভাবে গৃহীত হয়েছে!</h3>
        <p>প্রিয় <strong>${order.customerName}</strong>,</p>
        <p>Dream Cart BD-তে অর্ডার করার জন্য আপনাকে ধন্যবাদ। আপনার অর্ডারটি (#<strong>${order.orderId}</strong>) সফলভাবে গ্রহণ করা হয়েছে।</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #f8fafc;">
            <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">অর্ডার আইডি:</th>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${order.orderId}</strong></td>
          </tr>
          <tr>
            <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">ডেলিভারি ঠিকানা:</th>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${order.fullAddress}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">পেমেন্ট মেথড:</th>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${order.paymentMethodName}</td>
          </tr>
          ${order.trxId ? `
          <tr>
            <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">TrxID:</th>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${order.trxId} (${order.senderNumber})</td>
          </tr>` : ''}
          <tr style="background: #f8fafc;">
            <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">মোট প্রদেয়:</th>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; font-size: 16px; font-weight: bold; color: #e11d48;">৳${order.totalPayable.toLocaleString()}</td>
          </tr>
        </table>

        <div style="background: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 13px; color: #475569;">
          <strong>যোগাযোগ ও কাস্টমার কেয়ার:</strong><br>
          হটলাইন: 01581 703 822, 0181 827 3838<br>
          ঠিকানা: চৌধুরী প্লাজা গ্রাউন্ড ফ্লোর রুম নং ৩, পদুয়ার বাজার বিশ্বরোড, কুমিল্লা।
        </div>
      </div>
      <div style="background: #0f172a; color: #94a3b8; padding: 10px; text-align: center; font-size: 12px;">
        © 2026 Dream Cart BD. All Rights Reserved.
      </div>
    </div>
  `;

  emailBox.innerHTML = emailHtml;

  const sendEmailBtn = document.getElementById('btn-send-customer-email');
  if (sendEmailBtn) {
    if (order.email && order.email.includes('@')) {
      sendEmailBtn.style.display = 'inline-block';
      const mailtoBody = `প্রিয় ${order.customerName},\n\nআপনার Dream Cart BD অর্ডার (#${order.orderId}) সফলভাবে গৃহীত হয়েছে। মোট পরিশোধযোগ্য: ৳${order.totalPayable}।\n\nধন্যবাদ,\nDream Cart BD\nহটলাইন: 01581 703 822, 0181 827 3838`;
      sendEmailBtn.href = `mailto:${order.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(mailtoBody)}`;
    } else {
      sendEmailBtn.style.display = 'none';
    }
  }
}

window.printOrderInvoice = function() {
  window.print();
};

window.copyText = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`"${text}" কপি করা হয়েছে!`);
  }).catch(() => {
    alert(`কপি হয়েছে: ${text}`);
  });
};

function showToast(message) {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;
  const toastEl = document.createElement('div');
  toastEl.className = 'toast align-items-center text-white bg-dark border-0 show mb-2';
  toastEl.setAttribute('role', 'alert');
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body"><i class="bi bi-check-circle-fill text-success me-2"></i> ${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  toastContainer.appendChild(toastEl);
  setTimeout(() => toastEl.remove(), 3500);
}

window.scrollToCheckout = function() {
  const target = document.getElementById('checkout-anchor');
  if (target) target.scrollIntoView({ behavior: 'smooth' });
};

window.toggleFloatingHotline = function() {
  const panel = document.getElementById('floating-hotline-panel');
  if (panel) {
    panel.style.display = (panel.style.display === 'block' ? 'none' : 'block');
  }
};
