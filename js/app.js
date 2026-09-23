// Dream Cart BD - Storefront Client Logic
// Slogan: you make. | Office Equipment Specialist

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
  deliveryFee: 90,
  paymentMethod: 'cod',
  isOnline: false,
  onlineDiscountAmount: 0,
  subtotal: 0,
  totalPayable: 0,
  directBuyItem: null
};

function initApp() {
  // 1. Load products from localStorage or defaults
  currentProducts = getStoredProducts();

  // 2. Load cart from localStorage
  loadCart();

  // 3. Render Categories & Products
  renderCategoryTabs();
  renderProducts();

  // 4. Start Countdown Timer
  initOfferCountdown();

  // 5. Start Live Visitors Counter
  initVisitorCounter();

  // 6. Setup Checkout listeners & calculations
  initCheckout();

  // 7. Setup Search & Sort
  initSearchAndFilter();

  // 8. Update Cart UI
  updateCartBadge();
}

/* ==========================================================================
   Countdown Timer (Always Urgent 24h cycle)
   ========================================================================== */
function initOfferCountdown() {
  function updateTimer() {
    const now = new Date();
    // End of today or tomorrow midnight
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    let diff = endOfDay - now;

    if (diff < 0) {
      diff = 24 * 3600 * 1000;
    }

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
  let baseVisitors = 126;
  const visitorCountEl = document.getElementById('live-visitor-count');
  const totalVisitsEl = document.getElementById('total-visits-count');

  if (visitorCountEl) {
    setInterval(() => {
      // Randomly fluctuation between -3 and +4
      const change = Math.floor(Math.random() * 8) - 3;
      baseVisitors = Math.max(95, Math.min(185, baseVisitors + change));
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

  container.innerHTML = INITIAL_CATEGORIES.map(cat => `
    <button class="filter-btn ${activeCategory === cat.id ? 'active' : ''}" onclick="selectCategory('${cat.id}')">
      <i class="bi ${cat.icon}"></i> ${cat.name}
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
   Render Products Grid
   ========================================================================== */
function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  let filtered = currentProducts.filter(p => {
    const matchCategory = (activeCategory === 'all') || (p.category === activeCategory);
    const matchSearch = !currentSearch || 
      p.title.toLowerCase().includes(currentSearch) || 
      p.categoryBn.toLowerCase().includes(currentSearch) ||
      (p.englishTitle && p.englishTitle.toLowerCase().includes(currentSearch));
    return matchCategory && matchSearch;
  });

  // Sorting
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
    const onlineSave = Math.round(p.salePrice * 0.05);

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
              <span class="badge ${p.stock > 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} rounded-pill px-2 py-1" style="font-size: 0.72rem;">
                ${p.stock > 0 ? `স্টক: ${p.stock}` : 'স্টক আউট'}
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

            <div class="online-save-chip">
              <i class="bi bi-lightning-charge-fill"></i> অনলাইনে পেমেন্টে আরও ৳${onlineSave.toLocaleString()} ছাড়!
            </div>

            <div class="card-actions-grid">
              <button class="btn-order-now" onclick="quickOrder('${p.id}')">
                <i class="bi bi-bag-check-fill"></i> অর্ডার করুন
              </button>
              <button class="btn-add-cart" onclick="addToCart('${p.id}')">
                <i class="bi bi-cart-plus"></i> কার্ট
              </button>
            </div>

            <div class="secondary-actions-bar">
              <button class="btn-quick-view" onclick="openProductModal('${p.id}')" title="বিস্তারিত ও স্লাইডার দেখুন">
                <i class="bi bi-eye"></i> বিস্তারিত
              </button>
              <a href="https://wa.me/8801581703822?text=${encodeURIComponent('আসসালামু আলাইকুম Dream Cart BD, আমি ' + p.title + ' (মূল্য: ৳' + p.salePrice + ') সম্পর্কে জানতে এবং অর্ডার করতে আগ্রহী।')}" target="_blank" class="btn-quick-wa" title="হোয়াটসঅ্যাপে অর্ডার">
                <i class="bi bi-whatsapp"></i>
              </a>
              <a href="tel:01581703822" class="btn-quick-call" title="কল করে অর্ডার">
                <i class="bi bi-telephone-fill"></i>
              </a>
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
   Product Single View Modal & Multi-Image Auto Carousel
   ========================================================================== */
window.openProductModal = function(productId) {
  const product = currentProducts.find(p => p.id === productId);
  if (!product) return;

  activeModalProduct = product;
  activeModalImageIndex = 0;

  const titleEl = document.getElementById('modal-product-title');
  const catEl = document.getElementById('modal-product-category');
  const priceEl = document.getElementById('modal-product-price');
  const origPriceEl = document.getElementById('modal-product-original-price');
  const discountEl = document.getElementById('modal-product-discount');
  const onlineSaveEl = document.getElementById('modal-online-save-amount');
  const descEl = document.getElementById('modal-product-desc');
  const highlightsEl = document.getElementById('modal-product-highlights');
  const colorsEl = document.getElementById('modal-product-colors');
  const sizesEl = document.getElementById('modal-product-sizes');
  const stockEl = document.getElementById('modal-product-stock');
  const warrantyEl = document.getElementById('modal-product-warranty');
  const qtyInput = document.getElementById('modal-product-qty');

  if (titleEl) titleEl.innerText = product.title;
  if (catEl) catEl.innerText = `${product.categoryBn} | কোড: ${product.id}`;
  if (priceEl) priceEl.innerText = `৳${product.salePrice.toLocaleString()}`;
  if (origPriceEl) origPriceEl.innerText = `৳${product.regularPrice.toLocaleString()}`;
  
  const discountPct = Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100);
  if (discountEl) discountEl.innerText = `${discountPct}% ক্যাশ ছাড়`;
  
  const onlineSave = Math.round(product.salePrice * 0.05);
  if (onlineSaveEl) onlineSaveEl.innerText = `৳${onlineSave.toLocaleString()}`;

  if (descEl) descEl.innerText = product.description;
  if (warrantyEl) warrantyEl.innerText = product.warranty || '১ বছরের অফিসিয়াল সার্ভিস ওয়ারেন্টি';
  if (qtyInput) qtyInput.value = 1;

  if (stockEl) {
    stockEl.innerHTML = `
      <span class="badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'} px-3 py-2">
        <i class="bi bi-box-seam me-1"></i> ${product.stock > 0 ? `ইন স্টক (${product.stock} টি অবশিষ্ট)` : 'স্টক আউট'}
      </span>
      <span class="text-danger fw-bold ms-2" style="font-size: 0.85rem;">
        ⚡ অর্ডার দ্রুত করুন, সীমিত স্টক!
      </span>
    `;
  }

  // Highlights
  if (highlightsEl) {
    highlightsEl.innerHTML = product.highlights.map(h => `
      <li class="mb-2"><i class="bi bi-check2-circle text-primary me-2 fw-bold"></i>${h}</li>
    `).join('');
  }

  // Color options
  if (colorsEl) {
    colorsEl.innerHTML = product.colors.map((c, i) => `
      <div class="variant-chip ${i === 0 ? 'active' : ''}" onclick="selectModalColor(this, '${c}')">
        <i class="bi bi-palette me-1"></i>${c}
      </div>
    `).join('');
  }

  // Size/Variant options
  if (sizesEl) {
    sizesEl.innerHTML = product.sizes.map((s, i) => `
      <div class="variant-chip ${i === 0 ? 'active' : ''}" onclick="selectModalSize(this, '${s}')">
        <i class="bi bi-aspect-ratio me-1"></i>${s}
      </div>
    `).join('');
  }

  // Gallery
  renderModalGallery();
  startModalAutoSlide();

  // Show bootstrap modal
  const modalEl = document.getElementById('productViewModal');
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    modalEl.addEventListener('hidden.bs.modal', () => {
      stopModalAutoSlide();
    }, { once: true });
  }
};

function renderModalGallery() {
  if (!activeModalProduct) return;
  const mainImg = document.getElementById('modal-main-image');
  const thumbsContainer = document.getElementById('modal-gallery-thumbs');
  const counterEl = document.getElementById('modal-gallery-counter');

  if (mainImg) {
    mainImg.src = activeModalProduct.images[activeModalImageIndex];
  }

  if (counterEl) {
    counterEl.innerText = `${activeModalImageIndex + 1} / ${activeModalProduct.images.length}`;
  }

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
  modalAutoSlideTimer = setInterval(() => {
    nextModalImage();
  }, 3500);
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
  val = Math.max(1, val + delta);
  input.value = val;
};

window.orderNowFromModal = function() {
  if (!activeModalProduct) return;
  const colorEl = document.querySelector('#modal-product-colors .variant-chip.active');
  const sizeEl = document.querySelector('#modal-product-sizes .variant-chip.active');
  const qtyInput = document.getElementById('modal-product-qty');

  const selectedColor = colorEl ? colorEl.innerText.trim() : activeModalProduct.colors[0];
  const selectedSize = sizeEl ? sizeEl.innerText.trim() : activeModalProduct.sizes[0];
  const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

  // Set direct buy item and scroll to checkout
  checkoutState.directBuyItem = {
    productId: activeModalProduct.id,
    title: activeModalProduct.title,
    color: selectedColor,
    size: selectedSize,
    price: activeModalProduct.salePrice,
    regularPrice: activeModalProduct.regularPrice,
    image: activeModalProduct.images[0],
    quantity: quantity
  };

  // Close modal
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

  const selectedColor = colorEl ? colorEl.innerText.trim() : activeModalProduct.colors[0];
  const selectedSize = sizeEl ? sizeEl.innerText.trim() : activeModalProduct.sizes[0];
  const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

  addItemToCart(activeModalProduct, selectedColor, selectedSize, quantity);

  // Close modal
  const modalEl = document.getElementById('productViewModal');
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();

  openCartDrawer();
};

window.modalOrderWhatsApp = function() {
  if (!activeModalProduct) return;
  const msg = `আসসালামু আলাইকুম Dream Cart BD, আমি '${activeModalProduct.title}' (কোড: ${activeModalProduct.id}, মূল্য: ৳${activeModalProduct.salePrice}) অর্ডার করতে চাই।`;
  window.open(`https://wa.me/8801581703822?text=${encodeURIComponent(msg)}`, '_blank');
};

/* ==========================================================================
   Cart Operations & Drawer
   ========================================================================== */
function loadCart() {
  const stored = localStorage.getItem('dreamcart_cart');
  if (stored) {
    try {
      cart = JSON.parse(stored);
    } catch (e) {
      cart = [];
    }
  }
}

function saveCart() {
  localStorage.setItem('dreamcart_cart', JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
  if (!checkoutState.directBuyItem) {
    renderCheckoutItems();
  }
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
  const headerBadge = document.getElementById('header-cart-count');
  const floatBadge = document.getElementById('floating-cart-count');
  if (headerBadge) headerBadge.innerText = count;
  if (floatBadge) floatBadge.innerText = count;
}

window.openCartDrawer = function() {
  renderCartDrawer();
  const drawerEl = document.getElementById('cartOffcanvas');
  if (drawerEl) {
    const offcanvas = new bootstrap.Offcanvas(drawerEl);
    offcanvas.show();
  }
};

function renderCartDrawer() {
  const container = document.getElementById('cart-drawer-items');
  const totalEl = document.getElementById('cart-drawer-subtotal');
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
    return;
  }

  let subtotal = 0;
  container.innerHTML = cart.map((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    return `
      <div class="card mb-3 border-light shadow-sm">
        <div class="card-body p-2 d-flex gap-3 align-items-center">
          <img src="${item.image}" alt="${item.title}" style="width: 65px; height: 65px; object-fit: cover; border-radius: 8px;">
          <div class="flex-grow-1">
            <h6 class="mb-1 text-truncate" style="max-width: 200px; font-size: 0.92rem;">${item.title}</h6>
            <div class="text-muted" style="font-size: 0.78rem;">
              <span>কালার: ${item.color}</span> | <span>সাইজ: ${item.size}</span>
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
}

window.updateCartItemQty = function(index, delta) {
  if (!cart[index]) return;
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  saveCart();
};

window.removeCartItem = function(index) {
  cart.splice(index, 1);
  saveCart();
};

window.proceedToCheckoutFromCart = function() {
  checkoutState.directBuyItem = null; // use entire cart
  renderCheckoutItems();
  const drawerEl = document.getElementById('cartOffcanvas');
  const offcanvas = bootstrap.Offcanvas.getInstance(drawerEl);
  if (offcanvas) offcanvas.hide();
  scrollToCheckout();
};

/* ==========================================================================
   Checkout System, AI Smart Address Detection & 5% Discount
   ========================================================================== */
function initCheckout() {
  // Address Live Input for AI detection
  const addressInput = document.getElementById('customerAddress');
  if (addressInput) {
    addressInput.addEventListener('input', (e) => {
      runAIAddressAnalysis(e.target.value);
    });
  }

  // Delivery Area Radios
  document.querySelectorAll('input[name="deliveryArea"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      selectDeliveryArea(e.target.value, false);
    });
  });

  // Payment Method Options
  document.querySelectorAll('.payment-card-opt').forEach(card => {
    card.addEventListener('click', () => {
      const method = card.getAttribute('data-method');
      selectPaymentMethod(method);
    });
  });

  // Checkout Form Submission
  const form = document.getElementById('checkout-form');
  if (form) {
    form.addEventListener('submit', handleOrderSubmit);
  }

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

  // Cumilla Keywords
  const cumillaKeywords = [
    'কুমিল্লা', 'comilla', 'cumilla', 'পদুয়ার বাজার', 'paduar bazar', 'শাসনগাছা', 'shasongacha', 
    'কান্দিরপাড়', 'kandirpar', 'টমসমব্রিজ', 'tomsom', 'লাকসাম', 'laksam', 'বরুড়া', 'barura', 
    'চৌদ্দগ্রাম', 'chauddagram', 'মুরাদনগর', 'muradnagar', 'দাউদকান্দি', 'daudkandi', 
    'চান্দিনা', 'chandina', 'আদর্শ সদর', 'adarsha sadar', 'বুড়িচং', 'burichang', 'ব্রাহ্মণপাড়া', 'দেবিদ্বার'
  ];

  // Dhaka Keywords
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
    detectedReason = `ঠিকানায় "${matchCumilla}" পাওয়া গেছে → কুমিল্লার ভিতর (চার্জ ৯০৳)`;
  } else if (matchDhaka) {
    detectedArea = 'dhaka';
    detectedReason = `ঠিকানায় "${matchDhaka}" পাওয়া গেছে → ঢাকার ভিতরে (চার্জ ১১০৳)`;
  } else {
    detectedArea = 'outside';
    detectedReason = `কুমিল্লা ও ঢাকার বাইরের জেলা চিহ্নিত হয়েছে (চার্জ ১৩৫৳)`;
  }

  // Update UI
  selectDeliveryArea(detectedArea, true);

  if (aiStatusBox && aiStatusText) {
    aiStatusBox.style.display = 'flex';
    aiStatusText.innerHTML = `<strong>✨ স্মার্ট এআই ডিটেকশন:</strong> ${detectedReason}`;
  }
}

function selectDeliveryArea(areaId, fromAI = false) {
  checkoutState.selectedDeliveryArea = areaId;

  if (areaId === 'cumilla') {
    checkoutState.deliveryFee = 90;
  } else if (areaId === 'dhaka') {
    checkoutState.deliveryFee = 110;
  } else {
    checkoutState.deliveryFee = 135;
  }

  // Update radio button
  const radio = document.querySelector(`input[name="deliveryArea"][value="${areaId}"]`);
  if (radio) {
    radio.checked = true;
  }

  // Update card active classes
  document.querySelectorAll('.delivery-radio-card').forEach(card => {
    card.classList.remove('active');
  });
  if (radio) {
    const parentCard = radio.closest('.delivery-radio-card');
    if (parentCard) parentCard.classList.add('active');
  }

  recalculateOrderTotals();
}

function selectPaymentMethod(method) {
  checkoutState.paymentMethod = method;
  checkoutState.isOnline = (method !== 'cod');

  // Update UI active card
  document.querySelectorAll('.payment-card-opt').forEach(card => {
    card.classList.remove('active');
    if (card.getAttribute('data-method') === method) {
      card.classList.add('active');
    }
  });

  // Toggle Online Discount Banner & Instruction Box
  const discountBanner = document.getElementById('online-discount-banner');
  const instructionsBox = document.getElementById('payment-instructions-box');
  const onlineInputs = document.getElementById('online-payment-inputs');
  const methodTitle = document.getElementById('selected-method-title');
  const detailsContent = document.getElementById('payment-details-content');

  if (checkoutState.isOnline) {
    if (discountBanner) discountBanner.style.display = 'flex';
    if (instructionsBox) instructionsBox.style.display = 'block';
    if (onlineInputs) onlineInputs.style.display = 'block';

    // Set method specifics
    if (method === 'bkash') {
      if (methodTitle) methodTitle.innerText = 'বিকাশ (bKash) পেমেন্ট নির্দেশিকা:';
      if (detailsContent) {
        detailsContent.innerHTML = `
          <div class="mb-2">
            <div><strong>১. পার্সোনাল বিকাশ (Send Money):</strong></div>
            <div class="account-copy-box">
              <span>০১৮৭৯৬৫৩১৪৩</span>
              <button type="button" class="btn btn-sm btn-outline-danger" onclick="copyText('01879653143')">কপি করুন</button>
            </div>
          </div>
          <div>
            <div><strong>২. বিকাশ পেমেন্ট মার্চেন্ট (Make Payment শুধুমাত্র):</strong></div>
            <div class="account-copy-box">
              <span>০১৫৮১৭০৩৮২২</span>
              <button type="button" class="btn btn-sm btn-outline-danger" onclick="copyText('01581703822')">কপি করুন</button>
            </div>
          </div>
          <div class="text-muted mt-2" style="font-size: 0.82rem;">
            * টাকা পাঠানোর পর প্রেরকের নাম্বার এবং ট্রানজেকশন আইডি (TrxID) নিচের বক্সে দিন।
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
              <button type="button" class="btn btn-sm btn-outline-warning text-dark" onclick="copyText('01879653143')">কপি করুন</button>
            </div>
          </div>
          <div class="text-muted mt-2" style="font-size: 0.82rem;">
            * টাকা পাঠানোর পর প্রেরকের নাম্বার এবং ট্রানজেকশন আইডি (TrxID) নিচের বক্সে দিন।
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
              <button type="button" class="btn btn-sm btn-outline-primary" onclick="copyText('01581703822')">কপি করুন</button>
            </div>
          </div>
          <div class="text-muted mt-2" style="font-size: 0.82rem;">
            * টাকা পাঠানোর পর প্রেরকের নাম্বার এবং ট্রানজেকশন আইডি (TrxID) নিচের বক্সে দিন।
          </div>
        `;
      }
    } else if (method === 'bank') {
      if (methodTitle) methodTitle.innerText = 'ব্যাংক পেমেন্ট নির্দেশিকা:';
      if (detailsContent) {
        detailsContent.innerHTML = `
          <div class="p-2 border rounded bg-white">
            <div><strong>ব্যাংকের নাম:</strong> Islami Bank BD Limited</div>
            <div><strong>একাউন্ট নাম:</strong> Jainal Abedin</div>
            <div class="d-flex justify-content-between align-items-center mt-1">
              <span><strong>একাউন্ট নাম্বার:</strong> 20508070200030208</span>
              <button type="button" class="btn btn-sm btn-outline-success" onclick="copyText('20508070200030208')">কপি</button>
            </div>
          </div>
          <div class="text-muted mt-2" style="font-size: 0.82rem;">
            * অনলাইন ফান্ড ট্রান্সফার বা জমা করার পর রেফারেন্স / ট্রানজেকশন আইডি নিচের বক্সে দিন।
          </div>
        `;
      }
    }
  } else {
    // Cash on Delivery
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
        <i class="bi bi-info-circle me-1"></i> আপনার কার্টে কোনো প্রোডাক্ট নেই। নিচে থেকে যেকোনো একটি প্রোডাক্ট সিলেক্ট করে অর্ডার করুন।
      </div>
    `;
    return;
  }

  container.innerHTML = items.map((item, idx) => `
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

  // 5% Discount for Online Payment
  if (checkoutState.isOnline && subtotal > 0) {
    checkoutState.onlineDiscountAmount = Math.round(subtotal * (STORE_CONFIG.onlineDiscountPercent / 100));
  } else {
    checkoutState.onlineDiscountAmount = 0;
  }

  checkoutState.totalPayable = Math.max(0, subtotal - checkoutState.onlineDiscountAmount + checkoutState.deliveryFee);

  // Update DOM elements
  const subtotalEl = document.getElementById('checkout-subtotal');
  const discountRow = document.getElementById('checkout-discount-row');
  const discountEl = document.getElementById('checkout-discount-amount');
  const deliveryEl = document.getElementById('checkout-delivery-fee');
  const totalEl = document.getElementById('checkout-total-payable');

  if (subtotalEl) subtotalEl.innerText = `৳${subtotal.toLocaleString()}`;
  if (deliveryEl) deliveryEl.innerText = `৳${checkoutState.deliveryFee.toLocaleString()}`;
  if (totalEl) totalEl.innerText = `৳${checkoutState.totalPayable.toLocaleString()}`;

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
  const email = document.getElementById('customerEmail').value.trim();
  const address = document.getElementById('customerAddress').value.trim();
  const notes = document.getElementById('customerNotes')?.value.trim() || '';

  // Validations
  if (!name) {
    alert('অনুগ্রহ করে আপনার নাম লিখুন।');
    return;
  }
  if (!phone || phone.length < 11) {
    alert('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নাম্বার লিখুন (যেমন: 01818273838)।');
    return;
  }
  if (!address) {
    alert('অনুগ্রহ করে আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।');
    return;
  }

  let senderNumber = '';
  let trxId = '';

  if (checkoutState.isOnline) {
    senderNumber = document.getElementById('senderPhone').value.trim();
    trxId = document.getElementById('transactionId').value.trim();

    if (!senderNumber) {
      alert('অনলাইন পেমেন্ট নিশ্চিত করতে আপনার যে নাম্বার থেকে টাকা পাঠিয়েছেন তা লিখুন।');
      return;
    }
    if (!trxId) {
      alert('অনলাইন পেমেন্ট ভেরিফিকেশনের জন্য ট্রানজেকশন আইডি (TrxID) প্রদান করা বাধ্যতামূলক।');
      return;
    }
  }

  // Generate Unique Order ID
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const orderId = `DCB-${randomSuffix}`;

  const areaNames = {
    'cumilla': 'কুমিল্লার ভিতর (৯০৳)',
    'dhaka': 'ঢাকার ভিতরে (১১০৳)',
    'outside': 'কুমিল্লা ও ঢাকার বাইরে (১৩৫৳)'
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
    paymentMethod: checkoutState.paymentMethod,
    paymentMethodName: paymentNames[checkoutState.paymentMethod],
    senderNumber: senderNumber,
    trxId: trxId,
    isOnlinePayment: checkoutState.isOnline,
    items: JSON.parse(JSON.stringify(items)),
    subtotal: checkoutState.subtotal,
    discountPercent: checkoutState.isOnline ? STORE_CONFIG.onlineDiscountPercent : 0,
    discountAmount: checkoutState.onlineDiscountAmount,
    totalPayable: checkoutState.totalPayable,
    status: 'Pending',
    statusBn: 'নতুন অর্ডার (অপেক্ষমাণ)',
    notes: notes
  };

  // Save to Database (localStorage)
  const allOrders = getStoredOrders();
  allOrders.unshift(newOrder);
  saveStoredOrders(allOrders);

  // Clear Cart
  cart = [];
  checkoutState.directBuyItem = null;
  saveCart();

  // Reset Form
  e.target.reset();

  // Display Order Confirmation Modal
  showOrderSuccessModal(newOrder);
}

function showOrderSuccessModal(order) {
  const modalEl = document.getElementById('orderSuccessModal');
  if (!modalEl) return;

  // Fill in confirmation details
  document.getElementById('conf-order-id').innerText = order.orderId;
  document.getElementById('conf-order-date').innerText = new Date(order.orderDate).toLocaleString('bn-BD');
  document.getElementById('conf-customer-name').innerText = order.customerName;
  document.getElementById('conf-customer-phone').innerText = order.phone;
  document.getElementById('conf-customer-address').innerText = order.fullAddress;
  document.getElementById('conf-payment-method').innerText = order.paymentMethodName;
  
  if (order.isOnlinePayment && order.trxId) {
    document.getElementById('conf-trx-row').style.display = 'table-row';
    document.getElementById('conf-trx-id').innerText = `${order.trxId} (প্রেরক: ${order.senderNumber})`;
  } else {
    document.getElementById('conf-trx-row').style.display = 'none';
  }

  // Items list
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

  // Price Totals
  document.getElementById('conf-subtotal').innerText = `৳${order.subtotal.toLocaleString()}`;
  document.getElementById('conf-delivery').innerText = `৳${order.deliveryFee.toLocaleString()}`;
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

  // Generate Customer Email Confirmation Simulation
  generateCustomerEmailPreview(order);

  // Setup WhatsApp Notify Button
  const waBtn = document.getElementById('conf-btn-whatsapp');
  if (waBtn) {
    const waText = `*Dream Cart BD - নতুন অর্ডার কনফার্মেশন*\n` +
      `অর্ডার আইডি: ${order.orderId}\n` +
      `গ্রাহক: ${order.customerName}\n` +
      `ফোন: ${order.phone}\n` +
      `ঠিকানা: ${order.fullAddress}\n` +
      `আইটেম: ${order.items.map(i => i.title + ' (x' + i.quantity + ')').join(', ')}\n` +
      `পেমেন্ট পদ্ধতি: ${order.paymentMethodName}\n` +
      (order.trxId ? `TrxID: ${order.trxId} (নম্বর: ${order.senderNumber})\n` : '') +
      `মোট পরিশোধযোগ্য: ৳${order.totalPayable}`;
    waBtn.href = `https://wa.me/8801581703822?text=${encodeURIComponent(waText)}`;
  }

  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

function generateCustomerEmailPreview(order) {
  const emailBox = document.getElementById('customer-email-preview-content');
  if (!emailBox) return;

  const emailSubject = `Dream Cart BD - আপনার অর্ডার কনফার্মেশন (#${order.orderId})`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #0f172a; color: #fff; padding: 20px; text-align: center;">
        <h2 style="margin: 0; color: #fff;">Dream Cart BD</h2>
        <p style="margin: 4px 0 0; color: #e11d48; font-weight: bold; font-size: 14px;">you make.</p>
      </div>
      <div style="padding: 20px; background: #ffffff;">
        <h3 style="color: #0f172a; margin-top: 0;">অর্ডার সফলভাবে গৃহীত হয়েছে!</h3>
        <p>প্রিয় <strong>${order.customerName}</strong>,</p>
        <p>Dream Cart BD-তে অর্ডার করার জন্য আপনাকে ধন্যবাদ। আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। খুব শীঘ্রই আমাদের কাস্টমার সার্ভিস প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #f8fafc; text-align: left;">
            <th style="padding: 8px; border-bottom: 1px solid #ddd;">অর্ডার আইডি:</th>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${order.orderId}</strong></td>
          </tr>
          <tr>
            <th style="padding: 8px; border-bottom: 1px solid #ddd;">ডেলিভারি ঠিকানা:</th>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${order.fullAddress}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <th style="padding: 8px; border-bottom: 1px solid #ddd;">পেমেন্ট মেথড:</th>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${order.paymentMethodName}</td>
          </tr>
          ${order.trxId ? `
          <tr>
            <th style="padding: 8px; border-bottom: 1px solid #ddd;">TrxID:</th>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${order.trxId} (${order.senderNumber})</td>
          </tr>` : ''}
          <tr style="background: #f8fafc;">
            <th style="padding: 8px; border-bottom: 1px solid #ddd;">মোট প্রদেয়:</th>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; font-size: 16px; font-weight: bold; color: #e11d48;">৳${order.totalPayable.toLocaleString()}</td>
          </tr>
        </table>

        <div style="background: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 13px; color: #475569;">
          <strong>যোগাযোগ ও সহায়তা:</strong><br>
          ফোন: 01581 703 822, 0181 827 3838<br>
          ঠিকানা: চৌধুরী প্লাজা গ্রাউন্ড ফ্লোর রুম নং ৩, পদুয়ার বাজার বিশ্বরোড, কুমিল্লা।
        </div>
      </div>
      <div style="background: #0f172a; color: #94a3b8; padding: 10px; text-align: center; font-size: 12px;">
        © 2026 Dream Cart BD. All Rights Reserved.
      </div>
    </div>
  `;

  emailBox.innerHTML = emailHtml;

  // Setup mailto trigger if customer provided email
  const sendEmailBtn = document.getElementById('btn-send-customer-email');
  if (sendEmailBtn) {
    if (order.email && order.email.includes('@')) {
      sendEmailBtn.style.display = 'inline-block';
      const mailtoBody = `প্রিয় ${order.customerName},\n\nআপনার Dream Cart BD অর্ডার (#${order.orderId}) সফলভাবে গৃহীত হয়েছে। মোট পরিশোধযোগ্য: ৳${order.totalPayable}।\n\nডেলিভারি ঠিকানা: ${order.fullAddress}\n\nধন্যবাদ,\nDream Cart BD\nফোন: 01581 703 822`;
      sendEmailBtn.href = `mailto:${order.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(mailtoBody)}`;
    } else {
      sendEmailBtn.style.display = 'none';
    }
  }
}

window.printOrderInvoice = function() {
  window.print();
};

/* ==========================================================================
   Utility Helpers
   ========================================================================== */
window.copyText = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`"${text}" কপি করা হয়েছে!`);
  }).catch(err => {
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
      <div class="toast-body">
        <i class="bi bi-check-circle-fill text-success me-2"></i> ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  toastContainer.appendChild(toastEl);
  setTimeout(() => {
    toastEl.remove();
  }, 3500);
}

window.scrollToCheckout = function() {
  const target = document.getElementById('checkout-anchor');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
};
