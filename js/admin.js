// Dream Cart BD - Official Admin Panel Logic
// Slogan: স্মার্ট অফিস ও প্রযুক্তির বিশ্বস্ত ঠিকানা — you make.
// Hotlines: 01581 703 822 | 0181 827 3838
// Logo: https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg

document.addEventListener('DOMContentLoaded', () => {
  initAdmin();
});

let adminOrders = [];
let adminProducts = [];
let activeViewingOrder = null;

// Product Filter State (Requirement 4)
let activeProductFilter = 'all'; // 'all', 'active', 'inactive', 'low_stock'

// Order Filter State (Requirement 5)
let activeOrderStatusFilter = 'all'; // 'all', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'

function initAdmin() {
  checkAdminAuth();
  refreshAdminData();
  populateCategoryDropdowns();
  setupEventListeners();
}

/* ==========================================================================
   Admin Authentication Gate
   ========================================================================== */
function checkAdminAuth() {
  const isAuth = sessionStorage.getItem('dreamcart_admin_auth');
  const overlay = document.getElementById('admin-login-overlay');
  if (isAuth === 'true') {
    if (overlay) overlay.style.display = 'none';
  } else {
    if (overlay) overlay.style.display = 'flex';
  }

  const form = document.getElementById('admin-login-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const pin = document.getElementById('admin-pin-input').value.trim();
      if (pin === '1234' || pin === 'admin' || pin === 'admin123') {
        sessionStorage.setItem('dreamcart_admin_auth', 'true');
        if (overlay) overlay.style.display = 'none';
      } else {
        alert('ভুল পিন কোড! সঠিক পিন হলো: 1234');
      }
    });
  }
}

window.adminLogout = function() {
  sessionStorage.removeItem('dreamcart_admin_auth');
  location.reload();
};

/* ==========================================================================
   Tab Navigation
   ========================================================================== */
window.switchAdminTab = function(tabName, linkEl = null) {
  document.querySelectorAll('.admin-tab-content').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.admin-nav-item').forEach(l => l.classList.remove('active'));

  const targetTab = document.getElementById(`tab-${tabName}`);
  if (targetTab) targetTab.style.display = 'block';

  if (linkEl) {
    linkEl.classList.add('active');
  } else {
    const navItem = document.querySelector(`.admin-nav-item[href="#section-${tabName}"]`);
    if (navItem) navItem.classList.add('active');
  }
};

/* ==========================================================================
   Data Refresh & Dashboard Metrics (Requirement 6)
   ========================================================================== */
window.refreshAdminData = function() {
  adminOrders = getStoredOrders();
  adminProducts = getStoredProducts();

  updateDashboardMetrics();
  updateProductCounters();
  updateOrderCounters();
  renderOrdersTable();
  renderProductsTable();
};

function updateDashboardMetrics() {
  const totalRev = adminOrders.reduce((sum, o) => sum + (o.totalPayable || 0), 0);
  const pendingOrders = adminOrders.filter(o => o.status === 'Pending' || o.status === 'Processing');
  const deliveredOrders = adminOrders.filter(o => o.status === 'Delivered');
  const activeProds = adminProducts.filter(p => p.isActive !== false);
  const lowStockProds = adminProducts.filter(p => p.stock <= 5);

  const revEl = document.getElementById('stat-total-revenue');
  const ordersEl = document.getElementById('stat-total-orders');
  const pendingEl = document.getElementById('stat-pending-orders');
  const deliveredEl = document.getElementById('stat-delivered-orders');
  const prodsEl = document.getElementById('stat-total-products');
  const lowStockEl = document.getElementById('stat-low-stock-alert');
  const sidebarPending = document.getElementById('sidebar-pending-badge');
  const sidebarProds = document.getElementById('sidebar-product-count');

  if (revEl) revEl.innerText = `৳${totalRev.toLocaleString()}`;
  if (ordersEl) ordersEl.innerText = adminOrders.length;
  if (pendingEl) pendingEl.innerText = pendingOrders.length;
  if (deliveredEl) deliveredEl.innerText = deliveredOrders.length;
  if (prodsEl) prodsEl.innerText = activeProds.length;
  if (lowStockEl) lowStockEl.innerText = lowStockProds.length;
  if (sidebarPending) sidebarPending.innerText = pendingOrders.length;
  if (sidebarProds) sidebarProds.innerText = adminProducts.length;

  renderDashboardRecentOrders();
  renderDashboardLowStock();
}

function renderDashboardRecentOrders() {
  const tbody = document.getElementById('dashboard-recent-orders-tbody');
  if (!tbody) return;

  const recent = adminOrders.slice(0, 5);
  if (recent.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">এখনো কোনো অর্ডার আসেনি।</td></tr>`;
    return;
  }

  tbody.innerHTML = recent.map(o => `
    <tr>
      <td><span class="badge bg-dark">${o.orderId}</span></td>
      <td>
        <strong>${o.customerName}</strong><br>
        <small class="text-muted"><i class="bi bi-telephone me-1"></i>${o.phone}</small>
      </td>
      <td><span class="badge bg-light text-dark border">${o.deliveryAreaName || 'সাধারণ'}</span></td>
      <td>
        <span class="badge ${o.isOnlinePayment ? 'bg-success' : 'bg-secondary'}">${o.paymentMethodName || o.paymentMethod}</span>
        ${o.trxId ? `<div class="small text-danger fw-bold">Trx: ${o.trxId}</div>` : ''}
      </td>
      <td class="fw-bold text-danger">৳${(o.totalPayable || 0).toLocaleString()}</td>
      <td>${getStatusBadge(o.status)}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary" onclick="viewOrderDetails('${o.orderId}')">
          <i class="bi bi-eye"></i> চালান
        </button>
      </td>
    </tr>
  `).join('');
}

function renderDashboardLowStock() {
  const tbody = document.getElementById('dashboard-low-stock-tbody');
  if (!tbody) return;

  const low = adminProducts.filter(p => p.stock <= 5);
  if (low.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center py-3 text-success"><i class="bi bi-check-circle me-1"></i> সকল প্রোডাক্টের পর্যাপ্ত স্টক রয়েছে।</td></tr>`;
    return;
  }

  tbody.innerHTML = low.map(p => `
    <tr>
      <td><img src="${p.images[0]}" style="width: 36px; height: 36px; object-fit: cover; border-radius: 6px;"></td>
      <td><strong>${p.title}</strong></td>
      <td><span class="badge bg-danger">${p.stock} টি অবশিষ্ট</span></td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary py-0" onclick="openEditProductModal('${p.id}')">স্টক বাড়ান</button>
      </td>
    </tr>
  `).join('');
}

/* ==========================================================================
   Product Management with Live On-click Filter Counters (Requirement 4)
   ========================================================================== */
function updateProductCounters() {
  const allCount = adminProducts.length;
  const activeCount = adminProducts.filter(p => p.isActive !== false).length;
  const inactiveCount = adminProducts.filter(p => p.isActive === false).length;
  const lowStockCount = adminProducts.filter(p => p.stock <= 5).length;

  const allEl = document.getElementById('cnt-prod-all');
  const actEl = document.getElementById('cnt-prod-active');
  const inactEl = document.getElementById('cnt-prod-inactive');
  const lowEl = document.getElementById('cnt-prod-low');

  if (allEl) allEl.innerText = allCount;
  if (actEl) actEl.innerText = activeCount;
  if (inactEl) inactEl.innerText = inactiveCount;
  if (lowEl) lowEl.innerText = lowStockCount;

  // Highlight active counter card
  document.querySelectorAll('.prod-counter-card').forEach(card => {
    card.classList.toggle('active', card.getAttribute('data-filter') === activeProductFilter);
  });
}

window.filterProductsByCounter = function(filterType) {
  activeProductFilter = filterType;
  updateProductCounters();
  renderProductsTable();
};

function renderProductsTable() {
  const tbody = document.getElementById('admin-products-tbody');
  const countBadge = document.getElementById('admin-products-count-badge');
  if (!tbody) return;

  const searchTerm = (document.getElementById('admin-product-search')?.value || '').toLowerCase().trim();
  const catTerm = document.getElementById('admin-product-cat-filter')?.value || 'all';

  let filtered = adminProducts.filter(p => {
    // 1. Counter Card Filter
    if (activeProductFilter === 'active' && p.isActive === false) return false;
    if (activeProductFilter === 'inactive' && p.isActive !== false) return false;
    if (activeProductFilter === 'low_stock' && p.stock > 5) return false;

    // 2. Search & Category
    const matchSearch = !searchTerm || p.title.toLowerCase().includes(searchTerm) || (p.id && p.id.toLowerCase().includes(searchTerm));
    const matchCat = (catTerm === 'all') || (p.category === catTerm);
    return matchSearch && matchCat;
  });

  if (countBadge) countBadge.innerText = `${filtered.length} টি প্রোডাক্ট প্রদর্শিত`;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-5 text-muted"><i class="bi bi-inbox fs-2 d-block mb-1"></i>কোনো প্রোডাক্ট পাওয়া যায়নি।</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    const isActive = (p.isActive !== false);
    const isLowStock = p.stock <= 5;

    return `
      <tr class="${!isActive ? 'table-light opacity-75' : ''}">
        <td>
          <img src="${p.images[0]}" alt="${p.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0;">
        </td>
        <td>
          <div class="fw-bold">${p.title}</div>
          <small class="text-muted">আইডি: ${p.id} | <span class="badge bg-light text-dark border">${p.categoryBn || p.category}</span></small>
          <div class="small text-primary"><i class="bi bi-images me-1"></i>${p.images.length} টি ছবি</div>
        </td>
        <td class="text-muted text-decoration-line-through">৳${p.regularPrice.toLocaleString()}</td>
        <td class="fw-bold text-dark">৳${p.salePrice.toLocaleString()}</td>
        <td>
          <span class="badge ${p.stock > 0 ? (isLowStock ? 'bg-warning text-dark' : 'bg-success') : 'bg-danger'}">
            ${p.stock} টি ${isLowStock ? '(লো স্টক)' : ''}
          </span>
        </td>
        <td>
          <!-- Active / Inactive Status Switch (Requirement 4) -->
          <div class="form-check form-switch">
            <input class="form-check-input cursor-pointer" type="checkbox" role="switch" ${isActive ? 'checked' : ''} onchange="toggleProductActive('${p.id}', this.checked)">
            <label class="form-check-label small fw-bold ${isActive ? 'text-success' : 'text-danger'}">
              ${isActive ? 'এক্টিভ' : 'ডি-এক্টিভ'}
            </label>
          </div>
        </td>
        <td class="text-end">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" onclick="openEditProductModal('${p.id}')" title="এডিট করুন">
              <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn btn-outline-danger" onclick="deleteProduct('${p.id}')" title="ডিলিট করুন">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.toggleProductActive = function(productId, isActive) {
  const prod = adminProducts.find(p => p.id === productId);
  if (!prod) return;
  prod.isActive = isActive;
  saveStoredProducts(adminProducts);
  updateDashboardMetrics();
  updateProductCounters();
  renderProductsTable();
};

window.openAddProductModal = function() {
  populateCategoryDropdowns();
  document.getElementById('productFormModalTitle').innerText = 'নতুন প্রোডাক্ট যুক্ত করুন';
  document.getElementById('product-edit-form').reset();
  document.getElementById('pf-product-id').value = '';
  document.getElementById('pf-is-active').checked = true;

  setupImageInputs([
    'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'
  ]);

  const modalEl = document.getElementById('productFormModal');
  new bootstrap.Modal(modalEl).show();
};

window.openEditProductModal = function(productId) {
  populateCategoryDropdowns();
  const prod = adminProducts.find(p => p.id === productId);
  if (!prod) return;

  document.getElementById('productFormModalTitle').innerText = 'প্রোডাক্ট এডিট করুন';
  document.getElementById('pf-product-id').value = prod.id;
  document.getElementById('pf-title').value = prod.title;
  document.getElementById('pf-category').value = prod.category;
  document.getElementById('pf-regular-price').value = prod.regularPrice;
  document.getElementById('pf-sale-price').value = prod.salePrice;
  document.getElementById('pf-stock').value = prod.stock;
  document.getElementById('pf-is-active').checked = (prod.isActive !== false);
  document.getElementById('pf-colors').value = (prod.colors || []).join(', ');
  document.getElementById('pf-sizes').value = (prod.sizes || []).join(', ');
  document.getElementById('pf-badge').value = prod.badge || '';
  document.getElementById('pf-warranty').value = prod.warranty || '';
  document.getElementById('pf-highlights').value = (prod.highlights || []).join('\n');
  document.getElementById('pf-desc').value = prod.description || '';

  setupImageInputs(prod.images || []);

  const modalEl = document.getElementById('productFormModal');
  new bootstrap.Modal(modalEl).show();
};

function setupImageInputs(images) {
  const container = document.getElementById('pf-images-container');
  if (!container) return;
  container.innerHTML = images.map((url, idx) => `
    <div class="input-group input-group-sm mb-2 image-input-row">
      <span class="input-group-text bg-light">${idx + 1}</span>
      <input type="url" class="form-control pf-img-url" value="${url}" placeholder="https://..." required>
      <button type="button" class="btn btn-outline-danger" onclick="this.closest('.image-input-row').remove()"><i class="bi bi-trash"></i></button>
    </div>
  `).join('');
}

window.addImageUrlInput = function() {
  const container = document.getElementById('pf-images-container');
  if (!container) return;
  const count = container.querySelectorAll('.image-input-row').length + 1;
  const row = document.createElement('div');
  row.className = 'input-group input-group-sm mb-2 image-input-row';
  row.innerHTML = `
    <span class="input-group-text bg-light">${count}</span>
    <input type="url" class="form-control pf-img-url" placeholder="https://images.unsplash.com/..." required>
    <button type="button" class="btn btn-outline-danger" onclick="this.closest('.image-input-row').remove()"><i class="bi bi-trash"></i></button>
  `;
  container.appendChild(row);
};

window.handleProductFormSubmit = function(e) {
  e.preventDefault();

  const id = document.getElementById('pf-product-id').value;
  const title = document.getElementById('pf-title').value.trim();
  const category = document.getElementById('pf-category').value;
  const regularPrice = parseFloat(document.getElementById('pf-regular-price').value) || 0;
  const salePrice = parseFloat(document.getElementById('pf-sale-price').value) || 0;
  const stock = parseInt(document.getElementById('pf-stock').value) || 0;
  const isActive = document.getElementById('pf-is-active').checked;
  
  const colorsRaw = document.getElementById('pf-colors').value.split(',').map(s => s.trim()).filter(Boolean);
  const sizesRaw = document.getElementById('pf-sizes').value.split(',').map(s => s.trim()).filter(Boolean);
  const badge = document.getElementById('pf-badge').value.trim();
  const warranty = document.getElementById('pf-warranty').value.trim();
  const highlightsRaw = document.getElementById('pf-highlights').value.split('\n').map(s => s.trim()).filter(Boolean);
  const desc = document.getElementById('pf-desc').value.trim();

  const imgInputs = document.querySelectorAll('.pf-img-url');
  const images = Array.from(imgInputs).map(inp => inp.value.trim()).filter(Boolean);

  if (images.length === 0) {
    alert('কমপক্ষে একটি প্রোডাক্ট ইমেজ URL প্রদান করতে হবে!');
    return;
  }

  const allCats = typeof getStoredCategories === 'function' ? getStoredCategories() : (typeof INITIAL_CATEGORIES !== 'undefined' ? INITIAL_CATEGORIES : []);
  const matchedCat = allCats.find(c => c.id === category || c.name === category);
  const catBnName = matchedCat ? matchedCat.name : category;

  if (id) {
    const existing = adminProducts.find(p => p.id === id);
    if (existing) {
      existing.title = title;
      existing.category = category;
      existing.categoryBn = catBnName;
      existing.regularPrice = regularPrice;
      existing.salePrice = salePrice;
      existing.stock = stock;
      existing.isActive = isActive;
      existing.colors = colorsRaw.length ? colorsRaw : ['স্ট্যান্ডার্ড কালার'];
      existing.sizes = sizesRaw.length ? sizesRaw : ['স্ট্যান্ডার্ড'];
      existing.badge = badge;
      existing.warranty = warranty;
      existing.highlights = highlightsRaw.length ? highlightsRaw : ['উচ্চ মানসম্পন্ন ও টেকসই'];
      existing.description = desc;
      existing.images = images;
    }
  } else {
    const newId = `DCB-${Math.floor(100 + Math.random() * 900)}`;
    adminProducts.unshift({
      id: newId,
      title: title,
      englishTitle: title,
      category: category,
      categoryBn: catBnName,
      regularPrice: regularPrice,
      salePrice: salePrice,
      stock: stock,
      isActive: isActive,
      rating: 4.9,
      reviewsCount: 12,
      badge: badge || 'নতুন',
      isFeatured: true,
      colors: colorsRaw.length ? colorsRaw : ['ক্ল্যাসিক ব্ল্যাক', 'সিলভার'],
      sizes: sizesRaw.length ? sizesRaw : ['স্ট্যান্ডার্ড সাইজ'],
      images: images,
      highlights: highlightsRaw.length ? highlightsRaw : ['১০০% অরিজিনাল অফিস সামগ্রী'],
      description: desc,
      warranty: warranty || '১ বছরের অফিসিয়াল সার্ভিস ওয়ারেন্টি'
    });
  }

  saveStoredProducts(adminProducts);
  refreshAdminData();

  const modalEl = document.getElementById('productFormModal');
  bootstrap.Modal.getInstance(modalEl)?.hide();
  alert('প্রোডাক্ট সফলভাবে সংরক্ষণ করা হয়েছে!');
};

window.deleteProduct = function(productId) {
  if (!confirm(`আপনি কি নিশ্চিতভাবে #${productId} প্রোডাক্টটি মুছে ফেলতে চান?`)) return;
  adminProducts = adminProducts.filter(p => p.id !== productId);
  saveStoredProducts(adminProducts);
  refreshAdminData();
};

window.confirmResetProducts = function() {
  if (confirm('আপনি কি পূর্বের ডিফল্ট ২০টি অফিস প্রোডাক্টে রিস্টোর করতে চান?')) {
    localStorage.removeItem('dreamcart_products');
    adminProducts = getStoredProducts();
    refreshAdminData();
    alert('ডিফল্ট ২০টি অফিস প্রোডাক্ট রিস্টোর সম্পন্ন হয়েছে!');
  }
};

/* ==========================================================================
   Order Management with Status Counter Cards (Requirement 5)
   ========================================================================== */
function updateOrderCounters() {
  const total = adminOrders.length;
  const pending = adminOrders.filter(o => o.status === 'Pending').length;
  const confirmed = adminOrders.filter(o => o.status === 'Confirmed').length;
  const processing = adminOrders.filter(o => o.status === 'Processing').length;
  const shipped = adminOrders.filter(o => o.status === 'Shipped').length;
  const delivered = adminOrders.filter(o => o.status === 'Delivered').length;
  const cancelled = adminOrders.filter(o => o.status === 'Cancelled').length;

  const setT = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
  setT('cnt-ord-all', total);
  setT('cnt-ord-pending', pending);
  setT('cnt-ord-confirmed', confirmed);
  setT('cnt-ord-processing', processing);
  setT('cnt-ord-shipped', shipped);
  setT('cnt-ord-delivered', delivered);
  setT('cnt-ord-cancelled', cancelled);

  document.querySelectorAll('.order-status-counter-card').forEach(card => {
    card.classList.toggle('active', card.getAttribute('data-status') === activeOrderStatusFilter);
  });
}

window.filterOrdersByStatusCard = function(status) {
  activeOrderStatusFilter = status;
  updateOrderCounters();
  renderOrdersTable();
};

function renderOrdersTable() {
  const tbody = document.getElementById('admin-orders-tbody');
  const countText = document.getElementById('orders-count-text');
  if (!tbody) return;

  const searchTerm = (document.getElementById('order-search-input')?.value || '').toLowerCase().trim();
  const paymentTerm = document.getElementById('order-payment-filter')?.value || 'all';

  let filtered = adminOrders.filter(o => {
    // 1. Status Filter via On-click Counter Card
    if (activeOrderStatusFilter !== 'all' && o.status !== activeOrderStatusFilter) return false;

    // 2. Payment Method Filter
    if (paymentTerm !== 'all' && o.paymentMethod !== paymentTerm) return false;

    // 3. Search Term Filter
    if (searchTerm) {
      const match = o.orderId.toLowerCase().includes(searchTerm) ||
        o.customerName.toLowerCase().includes(searchTerm) ||
        o.phone.toLowerCase().includes(searchTerm) ||
        (o.fullAddress && o.fullAddress.toLowerCase().includes(searchTerm));
      if (!match) return false;
    }

    return true;
  });

  if (countText) countText.innerText = `${filtered.length} টি অর্ডার প্রদর্শিত`;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-5 text-muted"><i class="bi bi-inbox fs-2 d-block mb-1"></i>কোনো অর্ডার পাওয়া যায়নি।</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(o => {
    const dateStr = new Date(o.orderDate).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const isFree = (o.subtotal >= 2000) || o.isFreeDelivery;

    return `
      <tr>
        <td><span class="badge bg-dark fs-6">${o.orderId}</span></td>
        <td><small class="text-muted">${dateStr}</small></td>
        <td>
          <strong>${o.customerName}</strong><br>
          <small><i class="bi bi-telephone text-primary me-1"></i>${o.phone}</small><br>
          <small class="text-muted text-truncate d-inline-block" style="max-width: 180px;">${o.fullAddress}</small>
        </td>
        <td>
          <span class="badge ${o.isOnlinePayment ? 'bg-success' : 'bg-secondary'}">${o.paymentMethodName || o.paymentMethod}</span>
          ${o.discountAmount > 0 ? `<div class="small text-success fw-bold">৪% ছাড়: -৳${o.discountAmount}</div>` : ''}
        </td>
        <td>
          ${o.trxId ? `
            <div class="fw-bold text-danger">${o.trxId}</div>
            <small class="text-muted">নম্বর: ${o.senderNumber || 'N/A'}</small>
          ` : '<span class="text-muted small">প্রযোজ্য নয়</span>'}
        </td>
        <td>
          <div class="fw-bold text-danger">৳${(o.totalPayable || 0).toLocaleString()}</div>
          <small class="text-muted">ডেলিভারি: ${isFree ? '<span class="text-success fw-bold">ফ্রি (০৳)</span>' : '৳' + o.deliveryFee}</small>
        </td>
        <td>
          <select class="form-select form-select-sm" onchange="quickUpdateOrderStatus('${o.orderId}', this.value)">
            <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>নতুন (Pending)</option>
            <option value="Confirmed" ${o.status === 'Confirmed' ? 'selected' : ''}>কনফার্মড</option>
            <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>প্রসেসিং</option>
            <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>কুরিয়ারে পাঠানো</option>
            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>ডেলিভারড</option>
            <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>বাতিল</option>
          </select>
        </td>
        <td class="text-end">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" onclick="viewOrderDetails('${o.orderId}')" title="চালান দেখুন / এডিট">
              <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn btn-outline-danger" onclick="deleteOrder('${o.orderId}')" title="মুছে ফেলুন">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function getStatusBadge(status) {
  switch (status) {
    case 'Pending': return '<span class="badge bg-warning text-dark">নতুন অর্ডার</span>';
    case 'Confirmed': return '<span class="badge bg-info text-white">কনফার্মড</span>';
    case 'Processing': return '<span class="badge bg-primary">প্রসেসিং</span>';
    case 'Shipped': return '<span class="badge text-white" style="background:#6366f1;">কুরিয়ারে পাঠানো</span>';
    case 'Delivered': return '<span class="badge bg-success">ডেলিভারড</span>';
    case 'Cancelled': return '<span class="badge bg-danger">বাতিল</span>';
    default: return `<span class="badge bg-secondary">${status}</span>`;
  }
}

window.quickUpdateOrderStatus = function(orderId, newStatus) {
  const order = adminOrders.find(o => o.orderId === orderId);
  if (!order) return;
  order.status = newStatus;
  saveStoredOrders(adminOrders);
  updateDashboardMetrics();
  updateOrderCounters();
};

window.viewOrderDetails = function(orderId) {
  const order = adminOrders.find(o => o.orderId === orderId);
  if (!order) return;

  activeViewingOrder = order;

  document.getElementById('adm-modal-order-id').innerText = order.orderId;
  document.getElementById('adm-view-order-id').innerText = order.orderId;
  document.getElementById('adm-view-order-date').innerText = new Date(order.orderDate).toLocaleString('bn-BD');
  document.getElementById('adm-view-order-status').innerHTML = getStatusBadge(order.status);
  
  // Editable fields in modal (Requirement 5)
  document.getElementById('adm-edit-cust-name').value = order.customerName || '';
  document.getElementById('adm-edit-cust-phone').value = order.phone || '';
  document.getElementById('adm-edit-cust-email').value = order.email || '';
  document.getElementById('adm-edit-cust-address').value = order.fullAddress || '';
  document.getElementById('adm-edit-status-select').value = order.status || 'Pending';
  document.getElementById('adm-edit-notes').value = order.notes || '';

  document.getElementById('adm-view-payment-method').innerText = order.paymentMethodName || order.paymentMethod;

  const onlineBox = document.getElementById('adm-view-online-fields');
  if (order.isOnlinePayment) {
    onlineBox.style.display = 'inline-block';
    document.getElementById('adm-view-sender-phone').innerText = order.senderNumber || 'N/A';
    document.getElementById('adm-view-trx-id').innerText = order.trxId || 'N/A';
  } else {
    onlineBox.style.display = 'none';
  }

  const itemsTbody = document.getElementById('adm-view-items-tbody');
  if (itemsTbody) {
    itemsTbody.innerHTML = order.items.map(i => `
      <tr>
        <td>
          <strong>${i.title}</strong><br>
          <small class="text-muted">${i.color} | ${i.size}</small>
        </td>
        <td class="text-center">${i.quantity}</td>
        <td class="text-end">৳${i.price.toLocaleString()}</td>
        <td class="text-end fw-bold">৳${(i.price * i.quantity).toLocaleString()}</td>
      </tr>
    `).join('');
  }

  const isFree = (order.subtotal >= 2000) || order.isFreeDelivery;
  document.getElementById('adm-view-subtotal').innerText = `৳${order.subtotal.toLocaleString()}`;
  document.getElementById('adm-view-delivery').innerHTML = isFree ? '<span class="text-success fw-bold">ফ্রি (৳০)</span>' : `৳${order.deliveryFee.toLocaleString()}`;
  document.getElementById('adm-view-total').innerText = `৳${order.totalPayable.toLocaleString()}`;

  const discountRow = document.getElementById('adm-view-discount-row');
  if (order.discountAmount > 0) {
    discountRow.style.display = 'table-row';
    document.getElementById('adm-view-discount').innerText = `-৳${order.discountAmount.toLocaleString()}`;
  } else {
    discountRow.style.display = 'none';
  }

  // Setup Dual WhatsApp contact links in modal (Requirement 7)
  const waMsg = encodeURIComponent(`Hello ${order.customerName}, Dream Cart BD থেকে আপনার #${order.orderId} অর্ডার সংক্রান্ত যোগাযোগ।`);
  const wa1 = document.getElementById('adm-modal-wa1');
  const wa2 = document.getElementById('adm-modal-wa2');
  if (wa1) wa1.href = `https://wa.me/88${order.phone.replace(/[^0-9]/g, '')}?text=${waMsg}`;

  const modalEl = document.getElementById('adminOrderDetailsModal');
  new bootstrap.Modal(modalEl).show();
};

window.saveOrderEditsFromModal = function() {
  if (!activeViewingOrder) return;
  activeViewingOrder.customerName = document.getElementById('adm-edit-cust-name').value.trim();
  activeViewingOrder.phone = document.getElementById('adm-edit-cust-phone').value.trim();
  activeViewingOrder.email = document.getElementById('adm-edit-cust-email').value.trim();
  activeViewingOrder.fullAddress = document.getElementById('adm-edit-cust-address').value.trim();
  activeViewingOrder.status = document.getElementById('adm-edit-status-select').value;
  activeViewingOrder.notes = document.getElementById('adm-edit-notes').value.trim();

  saveStoredOrders(adminOrders);
  updateDashboardMetrics();
  updateOrderCounters();
  renderOrdersTable();

  alert('অর্ডার তথ্য সফলভাবে আপডেট হয়েছে!');
};

window.deleteOrder = function(orderId) {
  if (!confirm(`আপনি কি নিশ্চিতভাবে #${orderId} অর্ডারটি মুছে ফেলতে চান?`)) return;
  adminOrders = adminOrders.filter(o => o.orderId !== orderId);
  saveStoredOrders(adminOrders);
  refreshAdminData();
};

window.exportOrdersToCSV = function() {
  if (adminOrders.length === 0) {
    alert('কোনো অর্ডার নেই ডাউনলোড করার জন্য!');
    return;
  }

  let csv = "Order ID,Date,Customer Name,Phone,Email,Address,Delivery Area,Payment Method,TrxID,Sender Phone,Subtotal,Discount,Delivery Fee,Total Payable,Status\n";

  adminOrders.forEach(o => {
    const line = [
      `"${o.orderId}"`,
      `"${o.orderDate}"`,
      `"${o.customerName}"`,
      `"${o.phone}"`,
      `"${o.email || ''}"`,
      `"${(o.fullAddress || '').replace(/"/g, '""')}"`,
      `"${o.deliveryAreaName || ''}"`,
      `"${o.paymentMethodName || o.paymentMethod}"`,
      `"${o.trxId || ''}"`,
      `"${o.senderNumber || ''}"`,
      o.subtotal || 0,
      o.discountAmount || 0,
      o.deliveryFee || 0,
      o.totalPayable || 0,
      `"${o.status}"`
    ].join(',');
    csv += line + "\n";
  });

  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `DreamCartBD_Orders_${Date.now()}.csv`;
  a.click();
};

function setupEventListeners() {
  document.getElementById('order-search-input')?.addEventListener('input', renderOrdersTable);
  document.getElementById('order-payment-filter')?.addEventListener('change', renderOrdersTable);

  document.getElementById('admin-product-search')?.addEventListener('input', renderProductsTable);
  document.getElementById('admin-product-cat-filter')?.addEventListener('change', renderProductsTable);
}


/* ==========================================================================
   Category Management & Dynamic Dropdowns (Requirement 2)
   ========================================================================== */
window.populateCategoryDropdowns = function() {
  const cats = typeof getStoredCategories === 'function' ? getStoredCategories() : (typeof INITIAL_CATEGORIES !== 'undefined' ? INITIAL_CATEGORIES : []);
  
  // 1. Filter dropdown in product list
  const filterSelect = document.getElementById('admin-product-cat-filter');
  if (filterSelect) {
    const currentVal = filterSelect.value || 'all';
    filterSelect.innerHTML = `<option value="all">সকল ক্যাটাগরি</option>` + 
      cats.filter(c => c.id !== 'all').map(c => `
        <option value="${c.id}">${c.name}</option>
      `).join('');
    filterSelect.value = currentVal;
  }

  // 2. Category select in Add/Edit product form (#pf-category)
  const formSelect = document.getElementById('pf-category');
  if (formSelect) {
    const currentVal = formSelect.value;
    formSelect.innerHTML = cats.filter(c => c.id !== 'all').map(c => `
      <option value="${c.id}">${c.name}</option>
    `).join('');
    if (currentVal) formSelect.value = currentVal;
  }

  renderCategoriesListModal();
};

window.openCategoryModal = function() {
  populateCategoryDropdowns();
  const form = document.getElementById('category-add-form');
  if (form) form.reset();
  const modalEl = document.getElementById('categoryModal');
  if (modalEl) new bootstrap.Modal(modalEl).show();
};

window.handleAddCategorySubmit = function(e) {
  e.preventDefault();
  const nameBn = document.getElementById('cat-name-bn').value.trim();
  const nameEn = document.getElementById('cat-name-en').value.trim() || nameBn;
  const icon = document.getElementById('cat-icon-select').value || 'bi-tag-fill';

  if (!nameBn) {
    alert('ক্যাটাগরির নাম (বাংলা) প্রদান করা আবশ্যক!');
    return;
  }

  const cats = typeof getStoredCategories === 'function' ? getStoredCategories() : (typeof INITIAL_CATEGORIES !== 'undefined' ? INITIAL_CATEGORIES : []);
  
  // Check duplicate
  const exists = cats.find(c => c.id.toLowerCase() === nameEn.toLowerCase() || c.name.toLowerCase() === nameBn.toLowerCase());
  if (exists) {
    alert('এই ক্যাটাগরি ইতিমধ্যে বিদ্যমান আছে!');
    return;
  }

  const newCat = {
    id: nameEn,
    name: nameBn,
    icon: icon
  };

  cats.push(newCat);
  if (typeof saveStoredCategories === 'function') {
    saveStoredCategories(cats);
  } else {
    localStorage.setItem('dreamcart_categories', JSON.stringify(cats));
  }
  
  populateCategoryDropdowns();
  document.getElementById('category-add-form').reset();
  alert(`"${nameBn}" ক্যাটাগরি সফলভাবে যুক্ত হয়েছে! এটি এখন ফিল্টার ও প্রোডাক্ট আপলোডিং-এ ব্যবহার করা যাবে।`);
};

window.deleteCategory = function(catId) {
  if (catId === 'all') {
    alert('ডিফল্ট "সব প্রোডাক্ট" ক্যাটাগরি মুছে ফেলা যাবে না!');
    return;
  }
  if (!confirm(`আপনি কি নিশ্চিতভাবে এই ক্যাটাগরি মুছে ফেলতে চান?`)) return;

  let cats = typeof getStoredCategories === 'function' ? getStoredCategories() : (typeof INITIAL_CATEGORIES !== 'undefined' ? INITIAL_CATEGORIES : []);
  cats = cats.filter(c => c.id !== catId);
  if (typeof saveStoredCategories === 'function') {
    saveStoredCategories(cats);
  } else {
    localStorage.setItem('dreamcart_categories', JSON.stringify(cats));
  }
  populateCategoryDropdowns();
  renderProductsTable();
};

function renderCategoriesListModal() {
  const container = document.getElementById('admin-categories-list-tbody');
  if (!container) return;
  const cats = typeof getStoredCategories === 'function' ? getStoredCategories() : (typeof INITIAL_CATEGORIES !== 'undefined' ? INITIAL_CATEGORIES : []);

  container.innerHTML = cats.map(c => `
    <tr>
      <td><i class="bi ${c.icon || 'bi-tag'} fs-5 text-primary"></i></td>
      <td><strong>${c.name}</strong></td>
      <td><code>${c.id}</code></td>
      <td class="text-end">
        ${c.id === 'all' ? '<span class="badge bg-secondary">ডিফল্ট</span>' : `
          <button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteCategory('${c.id}')" title="ক্যাটাগরি মুছুন">
            <i class="bi bi-trash"></i>
          </button>
        `}
      </td>
    </tr>
  `).join('');
}
