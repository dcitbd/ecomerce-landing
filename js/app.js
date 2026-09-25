/**
 * Dream Cart BD - Core Storefront & Checkout Engine
 * Slogan: "স্মার্ট অফিসের পূর্ণাঙ্গ সমাধান, আভিজাত্যে আপনার পাশে"
 * Location: Paduar Bazar Bishwa Road, Comilla
 * Phones: 01581703822, 01818273838
 */

// Initialize LocalStorage Database for Products & Orders
function initDatabase() {
  if (!localStorage.getItem('dcb_products')) {
    if (typeof DEFAULT_PRODUCTS !== 'undefined') {
      localStorage.setItem('dcb_products', JSON.stringify(DEFAULT_PRODUCTS));
    } else {
      localStorage.setItem('dcb_products', JSON.stringify([]));
    }
  }
  if (!localStorage.getItem('dcb_orders')) {
    localStorage.setItem('dcb_orders', JSON.stringify([]));
  }
  if (!localStorage.getItem('dcb_cart')) {
    localStorage.setItem('dcb_cart', JSON.stringify([]));
  }
  if (!localStorage.getItem('dcb_visitors_base')) {
    localStorage.setItem('dcb_visitors_base', (1480 + Math.floor(Math.random() * 50)).toString());
  }
}

initDatabase();

// State
let products = JSON.parse(localStorage.getItem('dcb_products') || '[]');
let cart = JSON.parse(localStorage.getItem('dcb_cart') || '[]');
let currentActiveProduct = null;
let selectedColor = '';
let selectedSize = '';
let singleViewQty = 1;
let selectedDeliveryArea = 'comilla'; // default 90
let selectedPaymentMethod = 'cod';
let directCheckoutItem = null; // for "Order Now" direct buy

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  renderCategoryPills();
  renderProducts(products);
  updateCartBadge();
  setupOfferCountdown();
  setupVisitorCounter();
  setupAddressAIEngine();
  setupPaymentMethodSelector();
});

// Render Product Catalog (Only Active Products)
function renderProducts(items) {
  const container = document.getElementById('productsContainer');
  const countEl = document.getElementById('productCountBadge');
  if (!container) return;

  // Filter only active products for storefront
  const activeItems = items.filter(p => p.status !== 'inactive');

  if (countEl) {
    countEl.innerText = `${activeItems.length} টি পণ্য প্রদর্শিত হচ্ছে`;
  }

  if (activeItems.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fa-solid fa-box-open fa-3x text-muted mb-3"></i>
        <h5 class="text-muted">বর্তমানে কোনো পণ্য সক্রিয় নেই!</h5>
      </div>
    `;
    return;
  }

  container.innerHTML = activeItems.map(p => {
    const mainImg = (p.images && p.images.length > 0) ? p.images[0] : 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=700&auto=format&fit=crop&q=80';
    const photoCount = p.images ? p.images.length : 1;
    const badgeHtml = p.badge ? `<span class="badge bg-danger product-badge">${p.badge}</span>` : '';
    
    return `
      <div class="col-sm-6 col-md-4 col-lg-3 mb-4">
        <div class="product-card">
          ${badgeHtml}
          <div class="product-image-wrap" onclick="openProductModal(${p.id})">
            <img src="${mainImg}" alt="${p.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=700&auto=format&fit=crop&q=80'">
            <span class="product-photo-count">
              <i class="fa-regular fa-images"></i> ${photoCount} ছবি
            </span>
          </div>
          <div class="product-info">
            <div class="product-category d-flex justify-content-between align-items-center">
              <span>${p.category || 'অফিস ইকুইপমেন্ট'}</span>
              ${p.brand ? `<span class="badge bg-warning-subtle text-dark border border-warning" style="font-size: 10.5px;"><i class="fa-solid fa-tag me-1"></i>${p.brand}</span>` : ''}
            </div>
            <div class="product-title" onclick="openProductModal(${p.id})">${p.name}</div>
            <div class="product-rating">
              <i class="fa-solid fa-star"></i>
              <span>${p.rating || '4.9'}</span>
              <span class="text-muted">(${p.reviews_count || '80'}+ রিভিউ)</span>
            </div>
            <div class="product-price-row">
              <span class="current-price">৳${p.price}</span>
              ${p.original_price ? `<span class="original-price">৳${p.original_price}</span>` : ''}
            </div>
            <div class="product-actions-grid mt-2">
              <button class="btn-order-now" onclick="quickBuyProduct(${p.id})">
                <i class="fa-solid fa-bolt"></i> অর্ডার করুন
              </button>
              <button class="btn-add-cart" onclick="addToCartQuick(${p.id})">
                <i class="fa-solid fa-cart-plus"></i> কার্ট
              </button>
              <div class="dropdown" style="grid-column: span 2;">
                <button class="btn btn-success btn-sm w-100 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fa-brands fa-whatsapp me-1"></i> হোয়াটসঅ্যাপে অর্ডার
                </button>
                <ul class="dropdown-menu w-100 shadow-sm">
                  <li>
                    <a class="dropdown-item small" href="https://wa.me/8801581703822?text=${encodeURIComponent(`আসসালামু আলাইকুম Dream Cart BD, আমি '${p.name}' (মূল্য ৳${p.price}) পণ্যটি অর্ডার করতে চাই।`)}" target="_blank">
                      <i class="fa-brands fa-whatsapp text-success me-1"></i> নম্বর ১ (০১৫৮১ ৭০৩ ৮২২)
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item small" href="https://wa.me/8801818273838?text=${encodeURIComponent(`আসসালামু আলাইকুম Dream Cart BD, আমি '${p.name}' (মূল্য ৳${p.price}) পণ্যটি অর্ডার করতে চাই।`)}" target="_blank">
                      <i class="fa-brands fa-whatsapp text-success me-1"></i> নম্বর ২ (০১৮১ ৮২৭ ৩৮৩৮)
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Category and Search Filtering
function filterCategory(category, btnElement) {
  document.querySelectorAll('.cat-pill').forEach(btn => btn.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');

  const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  applyFilters(category, searchTerm);
}

function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase().trim();
  const activeCatEl = document.querySelector('.cat-pill.active');
  const currentCategory = activeCatEl ? activeCatEl.getAttribute('data-cat') : 'all';
  applyFilters(currentCategory, searchTerm);
}

function applyFilters(category, searchTerm) {
  let filtered = [...products];

  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }

  if (searchTerm) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchTerm) || 
      (p.english_name && p.english_name.toLowerCase().includes(searchTerm)) ||
      (p.description && p.description.toLowerCase().includes(searchTerm)) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm))
    );
  }

  renderProducts(filtered);
}

// Product Single View Modal with Auto-sliding Carousel & Multi-Images
function openProductModal(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  currentActiveProduct = product;
  selectedColor = product.colors && product.colors.length > 0 ? product.colors[0] : '';
  selectedSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : '';
  singleViewQty = 1;

  document.getElementById('modalProductTitle').innerText = product.name;
  document.getElementById('modalProductCategory').innerText = product.category || 'অফিস ইকুইপমেন্ট';
  document.getElementById('modalProductPrice').innerText = `৳${product.price}`;
  document.getElementById('modalOriginalPrice').innerText = product.original_price ? `৳${product.original_price}` : '';
  document.getElementById('modalProductDesc').innerText = product.description || 'উচ্চমানের অফিসিয়াল সামগ্রী।';
  document.getElementById('modalStockBadge').innerHTML = product.stock > 0 
    ? `<span class="badge bg-success-subtle text-success border border-success-subtle"><i class="fa-solid fa-check"></i> ইন-স্টক (${product.stock} টি উপলব্ধ)</span>` 
    : `<span class="badge bg-danger-subtle text-danger">স্টক আউট</span>`;
  document.getElementById('modalQty').value = singleViewQty;

  // Build Carousel Images (5-10 images)
  const images = (product.images && product.images.length > 0) ? product.images : [
    'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=700&auto=format&fit=crop&q=80'
  ];

  const carouselInner = document.getElementById('modalCarouselInner');
  carouselInner.innerHTML = images.map((imgUrl, idx) => `
    <div class="carousel-item ${idx === 0 ? 'active' : ''}">
      <div class="modal-carousel-img-wrap">
        <img src="${imgUrl}" alt="${product.name} Image ${idx+1}">
      </div>
    </div>
  `).join('');

  // Build Thumbnails
  const thumbStrip = document.getElementById('modalThumbnails');
  thumbStrip.innerHTML = images.map((imgUrl, idx) => `
    <div class="thumb-item ${idx === 0 ? 'active' : ''}" onclick="selectModalSlide(${idx})">
      <img src="${imgUrl}" alt="Thumbnail ${idx+1}">
    </div>
  `).join('');

  // Colors
  const colorContainer = document.getElementById('modalColorContainer');
  if (product.colors && product.colors.length > 0) {
    document.getElementById('modalColorWrapper').style.display = 'block';
    colorContainer.innerHTML = product.colors.map((c, idx) => `
      <button type="button" class="variant-btn ${idx === 0 ? 'active' : ''}" onclick="selectColor('${c}', this)">${c}</button>
    `).join('');
  } else {
    document.getElementById('modalColorWrapper').style.display = 'none';
  }

  // Sizes
  const sizeContainer = document.getElementById('modalSizeContainer');
  if (product.sizes && product.sizes.length > 0) {
    document.getElementById('modalSizeWrapper').style.display = 'block';
    sizeContainer.innerHTML = product.sizes.map((s, idx) => `
      <button type="button" class="variant-btn ${idx === 0 ? 'active' : ''}" onclick="selectSize('${s}', this)">${s}</button>
    `).join('');
  } else {
    document.getElementById('modalSizeWrapper').style.display = 'none';
  }

  // Update WhatsApp links for both numbers
  updateModalWhatsAppBtns();

  const modalEl = document.getElementById('productViewModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}

// Close Product Modal
function closeProductModal() {
  const modalEl = document.getElementById('productViewModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.hide();
}

function selectModalSlide(index) {
  const carouselEl = document.getElementById('productImageCarousel');
  const carousel = bootstrap.Carousel.getOrCreateInstance(carouselEl);
  carousel.to(index);

  document.querySelectorAll('#modalThumbnails .thumb-item').forEach((item, idx) => {
    item.classList.toggle('active', idx === index);
  });
}

function selectColor(color, btn) {
  selectedColor = color;
  document.querySelectorAll('#modalColorContainer .variant-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updateModalWhatsAppBtns();
}

function selectSize(size, btn) {
  selectedSize = size;
  document.querySelectorAll('#modalSizeContainer .variant-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updateModalWhatsAppBtns();
}

function changeModalQty(delta) {
  let val = parseInt(document.getElementById('modalQty').value) || 1;
  val = Math.max(1, val + delta);
  document.getElementById('modalQty').value = val;
  singleViewQty = val;
  updateModalWhatsAppBtns();
}

function updateModalWhatsAppBtns() {
  if (!currentActiveProduct) return;
  const msg = `আসসালামু আলাইকুম Dream Cart BD,
আমি নিম্নলিখিত পণ্যটি অর্ডার করতে চাই:
- পণ্যের নাম: ${currentActiveProduct.name}
- ইউনিট মূল্য: ৳${currentActiveProduct.price}
- পরিমাণ: ${singleViewQty}
- কালার: ${selectedColor || 'N/A'}
- সাইজ: ${selectedSize || 'N/A'}
- মোট দাম: ৳${currentActiveProduct.price * singleViewQty}

দয়া করে অর্ডারটি দ্রুত প্রসেস করুন। ধন্যবাদ!`;

  const btn1 = document.getElementById('modalWhatsAppBtn1');
  const btn2 = document.getElementById('modalWhatsAppBtn2');
  if (btn1) btn1.href = `https://wa.me/8801581703822?text=${encodeURIComponent(msg)}`;
  if (btn2) btn2.href = `https://wa.me/8801818273838?text=${encodeURIComponent(msg)}`;
}

// Cart Management
function addToCartFromModal() {
  if (!currentActiveProduct) return;
  addToCart(currentActiveProduct, singleViewQty, selectedColor, selectedSize);
  closeProductModal();
  showToast('পণ্যটি সফলভাবে কার্টে যুক্ত হয়েছে!');
}

function addToCartQuick(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : '';
  const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : '';
  addToCart(product, 1, defaultColor, defaultSize);
  showToast(`"${product.name}" কার্টে যুক্ত হয়েছে!`);
}

function addToCart(product, qty, color, size) {
  const existingIdx = cart.findIndex(item => 
    item.id === product.id && item.color === color && item.size === size
  );

  if (existingIdx > -1) {
    cart[existingIdx].qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: (product.images && product.images.length > 0) ? product.images[0] : '',
      color: color,
      size: size,
      qty: qty
    });
  }

  saveCart();
  updateCartBadge();
  renderCartDrawer();
}

function saveCart() {
  localStorage.setItem('dcb_cart', JSON.stringify(cart));
}

function updateCartBadge() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-count-badge').forEach(badge => {
    badge.innerText = totalItems;
    badge.style.display = totalItems > 0 ? 'inline-block' : 'none';
  });
}

function renderCartDrawer() {
  const container = document.getElementById('cartDrawerItems');
  const subtotalEl = document.getElementById('cartDrawerSubtotal');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5 text-muted">
        <i class="fa-solid fa-cart-arrow-down fa-3x mb-3 text-secondary"></i>
        <p>আপনার কার্ট বর্তমানে খালি আছে!</p>
        <button class="btn btn-outline-primary btn-sm" data-bs-dismiss="offcanvas">কেনাকাটা শুরু করুন</button>
      </div>
    `;
    if (subtotalEl) subtotalEl.innerText = '৳0';
    return;
  }

  let subtotal = 0;
  container.innerHTML = cart.map((item, idx) => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;
    return `
      <div class="d-flex align-items-center gap-3 py-3 border-bottom">
        <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
        <div class="flex-grow-1">
          <h6 class="mb-1 text-truncate" style="max-width: 180px;">${item.name}</h6>
          <small class="text-muted d-block">
            ${item.color ? `কালার: ${item.color}` : ''} ${item.size ? `| সাইজ: ${item.size}` : ''}
          </small>
          <div class="d-flex align-items-center justify-content-between mt-2">
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-secondary btn-sm" onclick="changeCartQty(${idx}, -1)">-</button>
              <button class="btn btn-light btn-sm px-2 disabled fw-bold text-dark">${item.qty}</button>
              <button class="btn btn-outline-secondary btn-sm" onclick="changeCartQty(${idx}, 1)">+</button>
            </div>
            <div class="fw-bold text-dark">৳${itemTotal}</div>
          </div>
        </div>
        <button class="btn btn-link text-danger p-0 ms-1" onclick="removeFromCart(${idx})">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
  }).join('');

  if (subtotalEl) subtotalEl.innerText = `৳${subtotal}`;
}

function changeCartQty(index, delta) {
  if (cart[index]) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
    saveCart();
    updateCartBadge();
    renderCartDrawer();
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartBadge();
  renderCartDrawer();
  showToast('পণ্যটি কার্ট থেকে সরানো হয়েছে');
}

// Order Now (Quick Buy Directly opens Checkout)
function quickBuyProduct(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : '';
  const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : '';

  directCheckoutItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: (product.images && product.images.length > 0) ? product.images[0] : '',
    color: defaultColor,
    size: defaultSize,
    qty: 1
  };

  openCheckoutModal(true);
}

function checkoutFromModal() {
  if (!currentActiveProduct) return;
  directCheckoutItem = {
    id: currentActiveProduct.id,
    name: currentActiveProduct.name,
    price: currentActiveProduct.price,
    image: (currentActiveProduct.images && currentActiveProduct.images.length > 0) ? currentActiveProduct.images[0] : '',
    color: selectedColor,
    size: selectedSize,
    qty: singleViewQty
  };

  closeProductModal();
  openCheckoutModal(true);
}

function checkoutFromCart() {
  if (cart.length === 0) {
    showToast('আপনার কার্ট খালি! অনুগ্রহ করে আগে পণ্য যুক্ত করুন।', 'warning');
    return;
  }
  directCheckoutItem = null;
  const offcanvasEl = document.getElementById('cartOffcanvas');
  const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
  if (offcanvas) offcanvas.hide();

  openCheckoutModal(false);
}

// Checkout Modal Open & Quantity Adjuster
function openCheckoutModal(isDirect = false) {
  const checkoutItems = isDirect && directCheckoutItem ? [directCheckoutItem] : cart;
  if (checkoutItems.length === 0) return;

  renderCheckoutSummary();
  calculateOrderTotals();

  const checkoutModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('checkoutModal'));
  checkoutModal.show();
}

// Render summary with interactive Quantity +/- steppers inside checkout form!
function renderCheckoutSummary() {
  const summaryContainer = document.getElementById('checkoutItemsList');
  if (!summaryContainer) return;

  const items = directCheckoutItem ? [directCheckoutItem] : cart;

  if (items.length === 0) {
    summaryContainer.innerHTML = '<div class="text-muted small text-center py-2">কোনো পণ্য নির্বাচন করা হয়নি</div>';
    return;
  }

  summaryContainer.innerHTML = items.map((item, idx) => `
    <div class="d-flex align-items-center justify-content-between py-2 border-bottom">
      <div class="d-flex align-items-center gap-2">
        <img src="${item.image}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px;">
        <div>
          <div class="fw-semibold small text-truncate" style="max-width: 150px;">${item.name}</div>
          <small class="text-muted">${item.color || ''} ${item.size ? `(${item.size})` : ''} - ৳${item.price}</small>
        </div>
      </div>
      
      <!-- Stepper inside Order Form -->
      <div class="d-flex align-items-center gap-2">
        <div class="btn-group btn-group-sm">
          <button type="button" class="btn btn-outline-secondary btn-sm py-0 px-2" onclick="changeCheckoutQty(${idx}, -1)">-</button>
          <span class="btn btn-light btn-sm py-0 px-2 disabled fw-bold text-dark">${item.qty}</span>
          <button type="button" class="btn btn-outline-secondary btn-sm py-0 px-2" onclick="changeCheckoutQty(${idx}, 1)">+</button>
        </div>
        <div class="fw-bold ms-1" style="min-width: 55px; text-align: right;">৳${item.price * item.qty}</div>
      </div>
    </div>
  `).join('');
}

function changeCheckoutQty(index, delta) {
  if (directCheckoutItem) {
    directCheckoutItem.qty = Math.max(1, directCheckoutItem.qty + delta);
  } else if (cart[index]) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
    saveCart();
    updateCartBadge();
    renderCartDrawer();
  }
  renderCheckoutSummary();
  calculateOrderTotals();
}

// AI Address Auto-Detection Engine
function setupAddressAIEngine() {
  const addressInput = document.getElementById('customerAddress');
  const aiBadge = document.getElementById('aiAddressBadge');
  if (!addressInput) return;

  addressInput.addEventListener('input', (e) => {
    const text = e.target.value.toLowerCase().trim();
    if (text.length < 3) {
      if (aiBadge) aiBadge.style.display = 'none';
      return;
    }

    // Comilla keywords
    const comillaKeywords = [
      'comilla', 'cumilla', 'কুমিল্লা', 'পদুয়ার বাজার', 'পদুয়া বাজার', 'বিশ্বরোড', 'বিশ্ব রোড',
      'টমছম ব্রিজ', 'কান্দিরপাড়', 'কান্দিরপাড়', 'শাসনগাছা', 'বাগিচাগাঁও', 'ঝাউতলা', 'চৌদ্দগ্রাম',
      'লাকসাম', 'বরুড়া', 'বরুড়া', 'দাউদকান্দি', 'মুরাদনগর', 'চান্দিনা', 'হোমনা', 'তিতাস',
      'মনোহরগঞ্জ', 'মেঘনা', 'ব্রাহ্মণপাড়া', 'বুড়িচং', 'সদর দক্ষিণ', 'আদর্শ সদর', 'paduar',
      'kandirpar', 'laksham', 'chauddagram', 'barura'
    ];

    // Dhaka keywords
    const dhakaKeywords = [
      'dhaka', 'ঢাকা', 'মিরপুর', 'উত্তরা', 'ধানমন্ডি', 'গুলশান', 'বনানী', 'মোহাম্মদপুর',
      'মতিঝিল', 'যাত্রাবাড়ী', 'যাত্রাবাড়ী', 'বাড্ডা', 'খিলগাঁও', 'মালিবাগ', 'রামপুরা',
      'পুরান ঢাকা', 'মিরপুর-১০', 'মিরপুর-১', 'মিরপুর-২', 'মিরপুর-১১', 'মিরপুর-১২', 'কাফরুল',
      'পল্টন', 'কাকরাইল', 'মগবাজার', 'তেজগাঁও', 'ফার্মগেট', 'শ্যামলী', 'কল্যাণপুর',
      'mirpur', 'uttara', 'dhanmondi', 'gulshan', 'banani', 'mohammadpur', 'motijheel',
      'jatrabari', 'badda', 'khilgaon', 'malibagh', 'rampura', 'farmgate', 'shyamoli'
    ];

    let detectedArea = '';
    let detectedLabel = '';

    const isComilla = comillaKeywords.some(kw => text.includes(kw));
    const isDhaka = dhakaKeywords.some(kw => text.includes(kw));

    if (isComilla) {
      detectedArea = 'comilla';
      detectedLabel = 'কুমিল্লার ভিতর (৳ ৯০)';
    } else if (isDhaka) {
      detectedArea = 'dhaka';
      detectedLabel = 'ঢাকার ভিতরে (৳ ১১০)';
    } else {
      detectedArea = 'outside';
      detectedLabel = 'কুমিল্লা ও ঢাকার বাইরে (৳ ১৩৫)';
    }

    // Select corresponding radio
    const radio = document.querySelector(`input[name="deliveryArea"][value="${detectedArea}"]`);
    if (radio) {
      radio.checked = true;
      selectedDeliveryArea = detectedArea;
      calculateOrderTotals();
    }

    if (aiBadge) {
      aiBadge.style.display = 'inline-flex';
      aiBadge.innerHTML = `
        <span class="ai-pulsing-dot"></span>
        <span>স্মার্ট এআই অটো-সিলেক্ট করেছে: <strong>${detectedLabel}</strong></span>
      `;
    }
  });

  // Manual radio changes
  document.querySelectorAll('input[name="deliveryArea"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      selectedDeliveryArea = e.target.value;
      calculateOrderTotals();
    });
  });
}

// Payment Methods & 4% Online Discount Engine
function setupPaymentMethodSelector() {
  document.querySelectorAll('.payment-method-box').forEach(box => {
    box.addEventListener('click', function() {
      document.querySelectorAll('.payment-method-box').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');

      const radio = this.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      selectedPaymentMethod = this.getAttribute('data-method');
      togglePaymentDetailsBox(selectedPaymentMethod);
      calculateOrderTotals();
    });
  });
}

function togglePaymentDetailsBox(method) {
  const onlineDetailsContainer = document.getElementById('onlinePaymentDetailsContainer');
  const detailsContent = document.getElementById('paymentMethodInfoContent');
  if (!onlineDetailsContainer) return;

  if (method === 'cod') {
    onlineDetailsContainer.style.display = 'none';
  } else {
    onlineDetailsContainer.style.display = 'block';

    let html = '';
    if (method === 'bkash') {
      html = `
        <div class="alert alert-danger py-2 mb-2">
          <div class="fw-bold mb-1"><i class="fa-solid fa-mobile-screen-button"></i> বিকাশ পেমেন্ট তথ্য:</div>
          <div>১. বিকাশ পার্সোনাল (Send Money): <strong>০১৮৭৯৬৫৩১৪৩</strong> <button type="button" class="copy-btn" onclick="copyToClipboard('01879653143')">কপি</button></div>
          <div>২. বিকাশ পেমেন্ট শুধুমাত্র (Make Payment): <strong>০১৫৮১৭০৩৮২২</strong> <button type="button" class="copy-btn" onclick="copyToClipboard('01581703822')">কপি</button></div>
        </div>
      `;
    } else if (method === 'nagad') {
      html = `
        <div class="alert alert-warning py-2 mb-2">
          <div class="fw-bold mb-1"><i class="fa-solid fa-mobile-screen-button"></i> নগদ পেমেন্ট তথ্য:</div>
          <div>নগদ পার্সোনাল (Send Money): <strong>০১৮৭৯৬৫৩১৪৩</strong> <button type="button" class="copy-btn" onclick="copyToClipboard('01879653143')">কপি</button></div>
        </div>
      `;
    } else if (method === 'rocket') {
      html = `
        <div class="alert alert-primary py-2 mb-2" style="background: #fdf2f8; border-color: #f472b6;">
          <div class="fw-bold mb-1 text-purple"><i class="fa-solid fa-mobile-screen-button"></i> রকেট পেমেন্ট তথ্য:</div>
          <div>রকেট পার্সোনাল (Send Money): <strong>০১৫৮১৭০৩৮২২</strong> <button type="button" class="copy-btn" onclick="copyToClipboard('01581703822')">কপি</button></div>
        </div>
      `;
    } else if (method === 'bank') {
      html = `
        <div class="alert alert-success py-2 mb-2">
          <div class="fw-bold mb-1"><i class="fa-solid fa-building-columns"></i> ব্যাংক একাউন্ট তথ্য:</div>
          <div>ব্যাংক নাম: <strong>ইসলামী ব্যাংক বাংলাদেশ লিমিটেড (Islami Bank BD Limited)</strong></div>
          <div>একাউন্ট নাম্বার: <strong>20508070200030208</strong> <button type="button" class="copy-btn" onclick="copyToClipboard('20508070200030208')">কপি</button></div>
          <div>একাউন্ট নাম: <strong>Jainal Abedin (জয়নাল আবেদিন)</strong></div>
        </div>
      `;
    }

    detailsContent.innerHTML = html;
  }
}

// Calculate Order Totals with 4% Online Payment Discount & FREE DELIVERY over 2000 Tk
function calculateOrderTotals() {
  const items = directCheckoutItem ? [directCheckoutItem] : cart;
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Delivery Charge calculation (FREE if subtotal > 2000 Tk)
  let standardFee = 90;
  if (selectedDeliveryArea === 'dhaka') {
    standardFee = 110;
  } else if (selectedDeliveryArea === 'outside') {
    standardFee = 135;
  }

  const isFreeDelivery = subtotal >= 2000;
  let deliveryFee = isFreeDelivery ? 0 : standardFee;

  // 4% Online Payment Discount calculation (Automated)
  let discountAmount = 0;
  const isOnline = selectedPaymentMethod !== 'cod';
  if (isOnline) {
    discountAmount = Math.round(subtotal * 0.04);
  }

  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  // Update UI
  const subtotalEl = document.getElementById('checkoutSubtotal');
  const deliveryFeeEl = document.getElementById('checkoutDeliveryFee');
  const discountRowEl = document.getElementById('checkoutDiscountRow');
  const discountAmountEl = document.getElementById('checkoutDiscountAmount');
  const grandTotalEl = document.getElementById('checkoutGrandTotal');
  const freeDeliveryBadge = document.getElementById('freeDeliveryNoticeBadge');

  if (subtotalEl) subtotalEl.innerText = `৳${subtotal}`;
  
  if (deliveryFeeEl) {
    if (isFreeDelivery) {
      deliveryFeeEl.innerHTML = `<span class="badge bg-success">ফ্রি ডেলিভারি (৳০)</span> <span class="text-decoration-line-through text-muted small">৳${standardFee}</span>`;
    } else {
      deliveryFeeEl.innerText = `৳${deliveryFee}`;
    }
  }

  if (freeDeliveryBadge) {
    if (isFreeDelivery) {
      freeDeliveryBadge.style.display = 'block';
      freeDeliveryBadge.className = 'alert alert-success py-2 small mb-3 border-0 bg-success-subtle text-success-emphasis rounded-3';
      freeDeliveryBadge.innerHTML = '<i class="fa-solid fa-gift me-1"></i> <strong>অভিনন্দন!</strong> ২,০০০ টাকার বেশি কেনাকাটায় আপনার জন্য সারাদেশে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!';
    } else if (subtotal > 0 && subtotal < 2000) {
      freeDeliveryBadge.style.display = 'block';
      freeDeliveryBadge.className = 'alert alert-info py-2 small mb-3 border-0 bg-info-subtle text-info-emphasis rounded-3';
      freeDeliveryBadge.innerHTML = `<i class="fa-solid fa-truck-fast me-1"></i> আর মাত্র <strong>৳${2000 - subtotal}</strong> টাকার পণ্য কিনলেই ডেলিভারি সম্পূর্ণ ফ্রি!`;
    } else {
      freeDeliveryBadge.style.display = 'none';
    }
  }

  if (discountRowEl) {
    if (isOnline) {
      discountRowEl.style.display = 'flex';
      discountAmountEl.innerText = `-৳${discountAmount} (৪%)`;
    } else {
      discountRowEl.style.display = 'none';
    }
  }

  if (grandTotalEl) grandTotalEl.innerText = `৳${grandTotal}`;

  return { subtotal, deliveryFee, standardFee, isFreeDelivery, discountAmount, grandTotal, items };
}

// Place Order Form Submission
function handleOrderSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const email = document.getElementById('customerEmail').value.trim();
  const address = document.getElementById('customerAddress').value.trim();
  const notes = document.getElementById('orderNotes')?.value.trim() || '';

  if (!name || !phone || !address) {
    showToast('অনুগ্রহ করে নাম, ফোন নাম্বার এবং পূর্ণ ঠিকানা পূরণ করুন!', 'danger');
    return;
  }

  const isOnline = selectedPaymentMethod !== 'cod';
  const senderNumber = document.getElementById('paymentSenderNumber')?.value.trim() || '';
  const trxId = document.getElementById('paymentTrxId')?.value.trim() || '';

  if (isOnline && (!senderNumber || !trxId)) {
    showToast('অনলাইন পেমেন্টের ক্ষেত্রে প্রেরক নম্বর এবং ট্রানজেকশন আইডি (TrxID) দেওয়া আবশ্যক!', 'warning');
    return;
  }

  const { subtotal, deliveryFee, isFreeDelivery, discountAmount, grandTotal, items } = calculateOrderTotals();
  if (items.length === 0) {
    showToast('অর্ডারে কোনো পণ্য নেই!', 'danger');
    return;
  }

  // Create Order Object
  const orderId = 'DCB-' + Math.floor(100000 + Math.random() * 900000);
  const now = new Date();
  const orderDate = now.toLocaleDateString('bn-BD', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const newOrder = {
    orderId: orderId,
    timestamp: now.toISOString(),
    formattedDate: orderDate,
    customer: {
      name: name,
      phone: phone,
      email: email,
      address: address
    },
    deliveryArea: selectedDeliveryArea,
    deliveryAreaLabel: isFreeDelivery ? 'সারা দেশে ফ্রি ডেলিভারি' : (selectedDeliveryArea === 'comilla' ? 'কুমিল্লার ভিতর' : (selectedDeliveryArea === 'dhaka' ? 'ঢাকার ভিতরে' : 'কুমিল্লা ও ঢাকার বাইরে')),
    deliveryFee: deliveryFee,
    isFreeDelivery: isFreeDelivery,
    paymentMethod: selectedPaymentMethod,
    paymentDetails: {
      senderNumber: senderNumber,
      trxId: trxId
    },
    items: items,
    subtotal: subtotal,
    discountAmount: discountAmount,
    grandTotal: grandTotal,
    notes: notes,
    status: 'Pending'
  };

  // Save to LocalStorage
  const orders = JSON.parse(localStorage.getItem('dcb_orders') || '[]');
  orders.unshift(newOrder);
  localStorage.setItem('dcb_orders', JSON.stringify(orders));

  // If this was from cart, clear cart
  if (!directCheckoutItem) {
    cart = [];
    saveCart();
    updateCartBadge();
    renderCartDrawer();
  }
  directCheckoutItem = null;

  // Close Checkout Modal
  const checkoutModalEl = document.getElementById('checkoutModal');
  const checkoutModal = bootstrap.Modal.getInstance(checkoutModalEl);
  if (checkoutModal) checkoutModal.hide();

  // Reset Form
  document.getElementById('checkoutForm').reset();

  // Show Order Confirmation Receipt Modal
  showOrderSuccessModal(newOrder);
}

// Order Success Receipt Modal & Customer Mail Trigger
function showOrderSuccessModal(order) {
  document.getElementById('receiptOrderId').innerText = order.orderId;
  document.getElementById('receiptCustomerName').innerText = order.customer.name;
  document.getElementById('receiptCustomerPhone').innerText = order.customer.phone;
  document.getElementById('receiptCustomerAddress').innerText = order.customer.address;
  document.getElementById('receiptPaymentMethod').innerText = getPaymentMethodDisplayName(order.paymentMethod);
  document.getElementById('receiptGrandTotal').innerText = `৳${order.grandTotal}`;

  let extraBadges = '';
  if (order.discountAmount > 0) {
    extraBadges += `<span class="badge bg-success me-1">৪% অনলাইন ছাড়: ৳${order.discountAmount} সেভ</span>`;
  }
  if (order.isFreeDelivery) {
    extraBadges += `<span class="badge bg-info text-dark">ফ্রি ডেলিভারি প্রযোজ্য</span>`;
  }
  document.getElementById('receiptDiscountInfo').innerHTML = extraBadges;

  // Items table
  const itemsContainer = document.getElementById('receiptItemsTable');
  itemsContainer.innerHTML = order.items.map(item => `
    <tr>
      <td>${item.name} <br><small class="text-muted">${item.color || ''} ${item.size ? `(${item.size})` : ''}</small></td>
      <td class="text-center">${item.qty}</td>
      <td class="text-end">৳${item.price * item.qty}</td>
    </tr>
  `).join('');

  // Prepare WhatsApp confirmation links for BOTH numbers
  const whatsappMsg = `আসসালামু আলাইকুম Dream Cart BD,
আমি একটি নতুন অর্ডার প্লেস করেছি।
অর্ডার আইডি: ${order.orderId}
নাম: ${order.customer.name}
ফোন: ${order.customer.phone}
ঠিকানা: ${order.customer.address}
পেমেন্ট মেথড: ${getPaymentMethodDisplayName(order.paymentMethod)} ${order.paymentDetails.trxId ? `(TrxID: ${order.paymentDetails.trxId})` : ''}
মোট প্রদেয় বিল: ৳${order.grandTotal}

দয়া করে অর্ডারটি কনফার্ম করুন। ধন্যবাদ!`;

  const waBtn1 = document.getElementById('receiptWhatsAppBtn1');
  const waBtn2 = document.getElementById('receiptWhatsAppBtn2');
  if (waBtn1) waBtn1.href = `https://wa.me/8801581703822?text=${encodeURIComponent(whatsappMsg)}`;
  if (waBtn2) waBtn2.href = `https://wa.me/8801818273838?text=${encodeURIComponent(whatsappMsg)}`;

  // Customer Mail After Order
  const mailBtn = document.getElementById('receiptEmailBtn');
  if (mailBtn) {
    const emailSubject = `Dream Cart BD - Order Confirmation #${order.orderId}`;
    const emailBody = `প্রিয় ${order.customer.name},
Dream Cart BD থেকে কেনাকাটা করার জন্য ধন্যবাদ!

আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে:
অর্ডার আইডি: ${order.orderId}
পণ্য সংখ্যা: ${order.items.length} টি
সাবটোটাল: ৳${order.subtotal}
অনলাইন ছাড়: ৳${order.discountAmount}
ডেলিভারি চার্জ: ৳${order.deliveryFee} (${order.deliveryAreaLabel})
সর্বমোট প্রদেয় বিল: ৳${order.grandTotal}
পেমেন্ট মেথড: ${getPaymentMethodDisplayName(order.paymentMethod)}
${order.paymentDetails.trxId ? `ট্রানজেকশন আইডি: ${order.paymentDetails.trxId}` : ''}

ডেলিভারি ঠিকানা:
${order.customer.address}
ফোন: ${order.customer.phone}

যেকোনো প্রয়োজনে কল করুন:
০১৫৮১ ৭০৩ ৮২২, ০১৮১ ৮২৭ ৩৮৩৮
শোরুম: চৌধুরী প্লাজা, গ্রাউন্ড ফ্লোর, রুম ৩, পদুয়ার বাজার, বিশ্বরোড, কুমিল্লা।`;

    const recipient = order.customer.email ? order.customer.email : 'dreamcartbd@gmail.com';
    mailBtn.href = `mailto:${recipient}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    mailBtn.style.display = 'inline-flex';
  }

  const successModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('orderSuccessModal'));
  successModal.show();
}

function getPaymentMethodDisplayName(method) {
  switch (method) {
    case 'cod': return 'ক্যাশ অন ডেলিভারি (COD)';
    case 'bkash': return 'বিকাশ পেমেন্ট (bKash)';
    case 'nagad': return 'নগদ পেমেন্ট (Nagad)';
    case 'rocket': return 'রকেট পেমেন্ট (Rocket)';
    case 'bank': return 'ব্যাংক পেমেন্ট (Islami Bank)';
    default: return method;
  }
}

// Offer Countdown Timer (Daily Flash Sale)
function setupOfferCountdown() {
  const hoursEl = document.getElementById('timerHours');
  const minutesEl = document.getElementById('timerMinutes');
  const secondsEl = document.getElementById('timerSeconds');
  if (!hoursEl || !minutesEl || !secondsEl) return;

  function updateTimer() {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const diffMs = tomorrow - now;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

    hoursEl.innerText = String(hours).padStart(2, '0');
    minutesEl.innerText = String(mins).padStart(2, '0');
    secondsEl.innerText = String(secs).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// Realistic Visitors Counter
function setupVisitorCounter() {
  const visitorCountEl = document.getElementById('liveVisitorCount');
  const activeNowEl = document.getElementById('activeNowCount');
  if (!visitorCountEl) return;

  let baseVisitors = parseInt(localStorage.getItem('dcb_visitors_base') || '1480');
  baseVisitors += 1;
  localStorage.setItem('dcb_visitors_base', baseVisitors.toString());

  visitorCountEl.innerText = baseVisitors.toLocaleString('bn-BD');
  if (activeNowEl) {
    activeNowEl.innerText = (18 + Math.floor(Math.random() * 8)).toString();
  }

  setInterval(() => {
    if (Math.random() > 0.4) {
      baseVisitors += 1;
      localStorage.setItem('dcb_visitors_base', baseVisitors.toString());
      visitorCountEl.innerText = baseVisitors.toLocaleString('bn-BD');
      if (activeNowEl) {
        activeNowEl.innerText = (16 + Math.floor(Math.random() * 12)).toString();
      }
    }
  }, 20000);
}

// Copy to Clipboard Helper
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`"${text}" কপি করা হয়েছে!`, 'success');
  }).catch(() => {
    showToast('কপি করতে ব্যর্থ হয়েছে, অনুগ্রহ করে ম্যানুয়ালি কপি করুন', 'secondary');
  });
}

// Simple Toast Notification
function showToast(message, type = 'primary') {
  const toastEl = document.getElementById('liveToast');
  const toastBody = document.getElementById('liveToastBody');
  if (!toastEl || !toastBody) return;

  toastBody.innerText = message;
  toastEl.className = `toast align-items-center text-bg-${type} border-0`;
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
}

// Print Order Receipt Slip
function printReceipt() {
  window.print();
}

// Dynamically render storefront category filter pills
function renderCategoryPills() {
  const container = document.getElementById('categoryPillsContainer');
  if (!container) return;

  let categories = JSON.parse(localStorage.getItem('dcb_categories') || 'null');
  if (!categories || categories.length === 0) {
    if (typeof DEFAULT_CATEGORIES !== 'undefined' && Array.isArray(DEFAULT_CATEGORIES)) {
      categories = DEFAULT_CATEGORIES;
    } else {
      return;
    }
  }

  const activeCatEl = container.querySelector('.cat-pill.active');
  const currentCat = activeCatEl ? activeCatEl.getAttribute('data-cat') : 'all';

  let html = `<button type="button" class="btn btn-sm btn-outline-secondary rounded-pill cat-pill ${currentCat === 'all' ? 'active' : ''}" data-cat="all" onclick="filterCategory('all', this)">সব পণ্য</button>`;

  categories.forEach(c => {
    const isAct = (currentCat === c.name || currentCat === c.english_name) ? 'active' : '';
    html += `<button type="button" class="btn btn-sm btn-outline-secondary rounded-pill cat-pill ${isAct}" data-cat="${c.name}" onclick="filterCategory('${c.name}', this)">${c.name}</button>`;
  });

  container.innerHTML = html;
}
