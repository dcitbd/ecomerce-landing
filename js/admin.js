// Dream Cart BD - Official Admin Panel Logic
// Slogan: you make. | Office Equipment Specialist

document.addEventListener('DOMContentLoaded', () => {
  initAdmin();
});

let adminOrders = [];
let adminProducts = [];
let activeViewingOrder = null;

function initAdmin() {
  // Check Authentication
  checkAdminAuth();

  // Load Data
  refreshAdminData();

  // Setup Event Listeners
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
   Data Refresh & Metrics
   ========================================================================== */
window.refreshAdminData = function() {
  adminOrders = getStoredOrders();
  adminProducts = getStoredProducts();

  updateDashboardMetrics();
  renderOrdersTable();
  renderProductsTable();
};

function updateDashboardMetrics() {
  const totalRev = adminOrders.reduce((sum, o) => sum + (o.totalPayable || 0), 0);
  const pendingOrders = adminOrders.filter(o => o.status === 'Pending' || o.status === 'Processing');

  const revEl = document.getElementById('stat-total-revenue');
  const ordersEl = document.getElementById('stat-total-orders');
  const pendingEl = document.getElementById('stat-pending-orders');
  const prodsEl = document.getElementById('stat-total-products');
  const sidebarPending = document.getElementById('sidebar-pending-badge');
  const sidebarProds = document.getElementById('sidebar-product-count');

  if (revEl) revEl.innerText = `৳${totalRev.toLocaleString()}`;
  if (ordersEl) ordersEl.innerText = adminOrders.length;
  if (pendingEl) pendingEl.innerText = pendingOrders.length;
  if (prodsEl) prodsEl.innerText = adminProducts.length;
  if (sidebarPending) sidebarPending.innerText = pendingOrders.length;
  if (sidebarProds) sidebarProds.innerText = adminProducts.length;

  // Recent 5 orders for dashboard
  renderDashboardRecentOrders();
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
          <i class="bi bi-eye"></i> বিস্তারিত
        </button>
      </td>
    </tr>
  `).join('');
}

/* ==========================================================================
   Orders Management
   ========================================================================== */
function setupEventListeners() {
  // Order search & filter
  const searchInput = document.getElementById('order-search-input');
  const statusFilter = document.getElementById('order-status-filter');
  const paymentFilter = document.getElementById('order-payment-filter');

  if (searchInput) searchInput.addEventListener('input', renderOrdersTable);
  if (statusFilter) statusFilter.addEventListener('change', renderOrdersTable);
  if (paymentFilter) paymentFilter.addEventListener('change', renderOrdersTable);

  // Product search & filter
  const prodSearch = document.getElementById('admin-product-search');
  const prodCat = document.getElementById('admin-product-cat-filter');

  if (prodSearch) prodSearch.addEventListener('input', renderProductsTable);
  if (prodCat) prodCat.addEventListener('change', renderProductsTable);
}

function renderOrdersTable() {
  const tbody = document.getElementById('admin-orders-tbody');
  const countText = document.getElementById('orders-count-text');
  if (!tbody) return;

  const searchTerm = (document.getElementById('order-search-input')?.value || '').toLowerCase().trim();
  const statusTerm = document.getElementById('order-status-filter')?.value || 'all';
  const paymentTerm = document.getElementById('order-payment-filter')?.value || 'all';

  let filtered = adminOrders.filter(o => {
    const matchSearch = !searchTerm ||
      o.orderId.toLowerCase().includes(searchTerm) ||
      o.customerName.toLowerCase().includes(searchTerm) ||
      o.phone.toLowerCase().includes(searchTerm) ||
      (o.fullAddress && o.fullAddress.toLowerCase().includes(searchTerm));

    const matchStatus = (statusTerm === 'all') || (o.status === statusTerm);
    const matchPayment = (paymentTerm === 'all') || (o.paymentMethod === paymentTerm);

    return matchSearch && matchStatus && matchPayment;
  });

  if (countText) countText.innerText = `${filtered.length} টি অর্ডার পাওয়া গেছে`;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-5 text-muted">কোনো অর্ডার পাওয়া যায়নি।</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(o => {
    const dateStr = new Date(o.orderDate).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    return `
      <tr>
        <td>
          <span class="badge bg-dark fs-6">${o.orderId}</span>
        </td>
        <td><small class="text-muted">${dateStr}</small></td>
        <td>
          <strong>${o.customerName}</strong><br>
          <small><i class="bi bi-telephone text-primary me-1"></i>${o.phone}</small><br>
          <small class="text-muted text-truncate d-inline-block" style="max-width: 200px;">${o.fullAddress}</small>
        </td>
        <td>
          <span class="badge ${o.isOnlinePayment ? 'bg-success' : 'bg-secondary'}">${o.paymentMethodName || o.paymentMethod}</span>
          ${o.discountAmount > 0 ? `<div class="small text-success fw-bold">৫% ছাড়: -৳${o.discountAmount}</div>` : ''}
        </td>
        <td>
          ${o.trxId ? `
            <div class="fw-bold text-danger">${o.trxId}</div>
            <small class="text-muted">নম্বর: ${o.senderNumber || 'N/A'}</small>
          ` : '<span class="text-muted small">প্রযোজ্য নয়</span>'}
        </td>
        <td>
          <div class="fw-bold text-danger">৳${(o.totalPayable || 0).toLocaleString()}</div>
          <small class="text-muted">ডেলিভারি: ৳${o.deliveryFee}</small>
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
            <button class="btn btn-outline-primary" onclick="viewOrderDetails('${o.orderId}')" title="বিস্তারিত চালান দেখুন">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-outline-danger" onclick="deleteOrder('${o.orderId}')" title="অর্ডার ডিলিট করুন">
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
    case 'Pending':
      return '<span class="badge bg-warning text-dark">নতুন অর্ডার</span>';
    case 'Confirmed':
      return '<span class="badge bg-info text-white">কনফার্মড</span>';
    case 'Processing':
      return '<span class="badge bg-primary">প্রসেসিং</span>';
    case 'Shipped':
      return '<span class="badge bg-indigo text-white" style="background:#6366f1;">কুরিয়ারে পাঠানো</span>';
    case 'Delivered':
      return '<span class="badge bg-success">ডেলিভারড সম্পন্ন</span>';
    case 'Cancelled':
      return '<span class="badge bg-danger">বাতিল</span>';
    default:
      return `<span class="badge bg-secondary">${status}</span>`;
  }
}

window.quickUpdateOrderStatus = function(orderId, newStatus) {
  const order = adminOrders.find(o => o.orderId === orderId);
  if (!order) return;
  order.status = newStatus;
  saveStoredOrders(adminOrders);
  updateDashboardMetrics();
};

window.viewOrderDetails = function(orderId) {
  const order = adminOrders.find(o => o.orderId === orderId);
  if (!order) return;

  activeViewingOrder = order;

  document.getElementById('adm-modal-order-id').innerText = order.orderId;
  document.getElementById('adm-view-order-id').innerText = order.orderId;
  document.getElementById('adm-view-order-date').innerText = new Date(order.orderDate).toLocaleString('bn-BD');
  document.getElementById('adm-view-order-status').innerHTML = getStatusBadge(order.status);
  
  document.getElementById('adm-view-cust-name').innerText = order.customerName;
  const phoneEl = document.getElementById('adm-view-cust-phone');
  phoneEl.innerText = order.phone;
  phoneEl.href = `tel:${order.phone}`;
  document.getElementById('adm-view-cust-email').innerText = order.email || 'দেওয়া হয়নি';
  document.getElementById('adm-view-cust-address').innerText = order.fullAddress;
  document.getElementById('adm-view-area-name').innerText = order.deliveryAreaName || 'সাধারণ';

  document.getElementById('adm-view-payment-method').innerText = order.paymentMethodName || order.paymentMethod;

  const onlineBox = document.getElementById('adm-view-online-fields');
  if (order.isOnlinePayment) {
    onlineBox.style.display = 'inline-block';
    document.getElementById('adm-view-sender-phone').innerText = order.senderNumber || 'N/A';
    document.getElementById('adm-view-trx-id').innerText = order.trxId || 'N/A';
  } else {
    onlineBox.style.display = 'none';
  }

  // Render items
  const itemsTbody = document.getElementById('adm-view-items-tbody');
  if (itemsTbody) {
    itemsTbody.innerHTML = order.items.map(i => `
      <tr>
        <td>
          <strong>${i.title}</strong><br>
          <small class="text-muted">কালার: ${i.color} | সাইজ: ${i.size}</small>
        </td>
        <td class="text-center">${i.quantity}</td>
        <td class="text-end">৳${i.price.toLocaleString()}</td>
        <td class="text-end fw-bold">৳${(i.price * i.quantity).toLocaleString()}</td>
      </tr>
    `).join('');
  }

  document.getElementById('adm-view-subtotal').innerText = `৳${order.subtotal.toLocaleString()}`;
  document.getElementById('adm-view-delivery').innerText = `৳${order.deliveryFee.toLocaleString()}`;
  document.getElementById('adm-view-total').innerText = `৳${order.totalPayable.toLocaleString()}`;

  const discountRow = document.getElementById('adm-view-discount-row');
  if (order.discountAmount > 0) {
    discountRow.style.display = 'table-row';
    document.getElementById('adm-view-discount').innerText = `-৳${order.discountAmount.toLocaleString()}`;
  } else {
    discountRow.style.display = 'none';
  }

  const notesBox = document.getElementById('adm-view-notes-box');
  if (order.notes) {
    notesBox.style.display = 'block';
    document.getElementById('adm-view-notes').innerText = order.notes;
  } else {
    notesBox.style.display = 'none';
  }

  // Status selector in modal
  document.getElementById('adm-modal-status-select').value = order.status;

  // WhatsApp Button
  const waBtn = document.getElementById('adm-modal-btn-wa');
  if (waBtn) {
    const waText = `Hello ${order.customerName}, Dream Cart BD থেকে আপনার অর্ডার (#${order.orderId}) সম্পর্কে যোগাযোগ করা হচ্ছে।`;
    waBtn.href = `https://wa.me/88${order.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waText)}`;
  }

  const modalEl = document.getElementById('adminOrderDetailsModal');
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
};

window.updateOrderStatusFromModal = function() {
  if (!activeViewingOrder) return;
  const newStatus = document.getElementById('adm-modal-status-select').value;
  activeViewingOrder.status = newStatus;
  saveStoredOrders(adminOrders);
  updateDashboardMetrics();
  renderOrdersTable();
  document.getElementById('adm-view-order-status').innerHTML = getStatusBadge(newStatus);
  alert('অর্ডার স্ট্যাটাস সফলভাবে আপডেট হয়েছে!');
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
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `DreamCartBD_Orders_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/* ==========================================================================
   Product Management
   ========================================================================== */
function renderProductsTable() {
  const tbody = document.getElementById('admin-products-tbody');
  const countBadge = document.getElementById('admin-products-count-badge');
  if (!tbody) return;

  const searchTerm = (document.getElementById('admin-product-search')?.value || '').toLowerCase().trim();
  const catTerm = document.getElementById('admin-product-cat-filter')?.value || 'all';

  let filtered = adminProducts.filter(p => {
    const matchSearch = !searchTerm || p.title.toLowerCase().includes(searchTerm) || (p.id && p.id.toLowerCase().includes(searchTerm));
    const matchCat = (catTerm === 'all') || (p.category === catTerm);
    return matchSearch && matchCat;
  });

  if (countBadge) countBadge.innerText = `${filtered.length} টি প্রোডাক্ট`;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-5 text-muted">কোনো প্রোডাক্ট পাওয়া যায়নি।</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td>
        <img src="${p.images[0]}" alt="${p.title}" style="width: 55px; height: 55px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0;">
      </td>
      <td>
        <div class="fw-bold">${p.title}</div>
        <small class="text-muted">আইডি: ${p.id} | ক্যাটাগরি: <span class="badge bg-light text-dark border">${p.categoryBn || p.category}</span></small>
        <div class="small text-primary"><i class="bi bi-images me-1"></i>${p.images.length} টি ছবি আপলোড করা আছে</div>
      </td>
      <td class="text-muted text-decoration-line-through">৳${p.regularPrice.toLocaleString()}</td>
      <td class="fw-bold text-dark">৳${p.salePrice.toLocaleString()}</td>
      <td>
        <span class="badge ${p.stock > 0 ? 'bg-success' : 'bg-danger'}">${p.stock} টি</span>
      </td>
      <td>
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" role="switch" ${p.stock > 0 ? 'checked' : ''} onchange="toggleProductStock('${p.id}', this.checked)">
          <label class="form-check-label small">${p.stock > 0 ? 'ইন স্টক' : 'স্টক আউট'}</label>
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
  `).join('');
}

window.toggleProductStock = function(productId, inStock) {
  const prod = adminProducts.find(p => p.id === productId);
  if (!prod) return;
  prod.stock = inStock ? (prod.stock > 0 ? prod.stock : 10) : 0;
  saveStoredProducts(adminProducts);
  updateDashboardMetrics();
};

/* ==========================================================================
   Add / Edit Product Modal Logic
   ========================================================================== */
window.openAddProductModal = function() {
  document.getElementById('productFormModalTitle').innerText = 'নতুন প্রোডাক্ট যুক্ত করুন';
  document.getElementById('product-edit-form').reset();
  document.getElementById('pf-product-id').value = '';

  // Setup default 5 image input fields
  setupImageInputs([
    'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'
  ]);

  const modalEl = document.getElementById('productFormModal');
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
};

window.openEditProductModal = function(productId) {
  const prod = adminProducts.find(p => p.id === productId);
  if (!prod) return;

  document.getElementById('productFormModalTitle').innerText = 'প্রোডাক্ট এডিট করুন';
  document.getElementById('pf-product-id').value = prod.id;
  document.getElementById('pf-title').value = prod.title;
  document.getElementById('pf-category').value = prod.category;
  document.getElementById('pf-regular-price').value = prod.regularPrice;
  document.getElementById('pf-sale-price').value = prod.salePrice;
  document.getElementById('pf-stock').value = prod.stock;
  document.getElementById('pf-colors').value = (prod.colors || []).join(', ');
  document.getElementById('pf-sizes').value = (prod.sizes || []).join(', ');
  document.getElementById('pf-badge').value = prod.badge || '';
  document.getElementById('pf-warranty').value = prod.warranty || '';
  document.getElementById('pf-highlights').value = (prod.highlights || []).join('\n');
  document.getElementById('pf-desc').value = prod.description || '';

  setupImageInputs(prod.images || []);

  const modalEl = document.getElementById('productFormModal');
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
};

function setupImageInputs(images) {
  const container = document.getElementById('pf-images-container');
  if (!container) return;

  container.innerHTML = images.map((url, idx) => `
    <div class="input-group input-group-sm mb-2 image-input-row">
      <span class="input-group-text bg-light">${idx + 1}</span>
      <input type="url" class="form-control pf-img-url" value="${url}" placeholder="https://example.com/image.jpg" required>
      <button type="button" class="btn btn-outline-danger" onclick="this.closest('.image-input-row').remove()">
        <i class="bi bi-trash"></i>
      </button>
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
    <button type="button" class="btn btn-outline-danger" onclick="this.closest('.image-input-row').remove()">
      <i class="bi bi-trash"></i>
    </button>
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

  const categoryNames = {
    'Cash & Security': 'ক্যাশ ও সিকিউরিটি',
    'Paper & Shredders': 'পেপার ও শ্রেডার',
    'Office Furniture': 'অফিস ফার্নিচার',
    'POS & Barcode': 'পিওএস ও বারকোড',
    'Electronics & Presentation': 'ইলেকট্রনিক্স ও প্রযুক্তি',
    'Binding & Lamination': 'বাইন্ডিং ও লেমিনেশন'
  };

  if (id) {
    // Edit existing
    const existing = adminProducts.find(p => p.id === id);
    if (existing) {
      existing.title = title;
      existing.category = category;
      existing.categoryBn = categoryNames[category] || category;
      existing.regularPrice = regularPrice;
      existing.salePrice = salePrice;
      existing.stock = stock;
      existing.colors = colorsRaw.length ? colorsRaw : ['স্ট্যান্ডার্ড কালার'];
      existing.sizes = sizesRaw.length ? sizesRaw : ['স্ট্যান্ডার্ড'];
      existing.badge = badge;
      existing.warranty = warranty;
      existing.highlights = highlightsRaw.length ? highlightsRaw : ['উচ্চ মানসম্পন্ন ও টেকসই'];
      existing.description = desc;
      existing.images = images;
    }
  } else {
    // Add new product
    const newId = `DCB-${Math.floor(100 + Math.random() * 900)}`;
    adminProducts.unshift({
      id: newId,
      title: title,
      englishTitle: title,
      category: category,
      categoryBn: categoryNames[category] || category,
      regularPrice: regularPrice,
      salePrice: salePrice,
      stock: stock,
      rating: 4.9,
      reviewsCount: 15,
      badge: badge || 'নতুন',
      isFeatured: true,
      colors: colorsRaw.length ? colorsRaw : ['ক্ল্যাসিক ব্ল্যাক', 'সিলভার'],
      sizes: sizesRaw.length ? sizesRaw : ['স্ট্যান্ডার্ড সাইজ'],
      images: images,
      highlights: highlightsRaw.length ? highlightsRaw : ['১০০% অরিজিনাল ও টেকসই মেটেরিয়াল'],
      description: desc,
      warranty: warranty || '১ বছরের অফিসিয়াল সার্ভিস ওয়ারেন্টি'
    });
  }

  saveStoredProducts(adminProducts);
  refreshAdminData();

  const modalEl = document.getElementById('productFormModal');
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();

  alert('প্রোডাক্ট সফলভাবে সংরক্ষণ করা হয়েছে!');
};

window.deleteProduct = function(productId) {
  if (!confirm(`আপনি কি নিশ্চিতভাবে এই প্রোডাক্টটি (${productId}) ডিলিট করতে চান?`)) return;
  adminProducts = adminProducts.filter(p => p.id !== productId);
  saveStoredProducts(adminProducts);
  refreshAdminData();
};

window.confirmResetProducts = function() {
  if (confirm('আপনি কি পূর্বের ডিফল্ট ২০টি অফিস ইকুইপমেন্ট প্রোডাক্টে ফিরিয়ে নিতে চান? এতে আপনার কাস্টম এডিট করা প্রোডাক্ট মুছে যাবে।')) {
    localStorage.removeItem('dreamcart_products');
    adminProducts = getStoredProducts();
    refreshAdminData();
    alert('ডিফল্ট ২০টি অফিস প্রোডাক্ট সফলভাবে রিস্টোর হয়েছে!');
  }
};
