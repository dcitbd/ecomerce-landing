/**
 * Dream Cart BD - Smart Admin Control Suite
 * Product & Order Management Portal
 * Password: Dcbd@2026
 * Logo: https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg
 */

const DEFAULT_ADMIN_PASSCODE = 'Dcbd@2026';
const SHOP_LOGO_URL = 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';

let currentAdminOrderFilter = 'all';
let currentAdminProductFilter = 'all';
let currentAdminBrandFilter = 'all';
let currentAdminCategoryFilter = 'all';
let currentCategorySearch = '';
let currentCategoryFilterType = 'all';
let currentAdminProductSearch = '';
let currentBrandSearch = '';
let currentBrandFilterType = 'all';

document.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();
  setupAdminListeners();

  // Restore desktop sidebar collapse preference
  const isCollapsed = localStorage.getItem('dcb_admin_sidebar_collapsed');
  const wrapper = document.querySelector('.admin-wrapper');
  if (wrapper && isCollapsed === 'true') {
    wrapper.classList.add('admin-sidebar-collapsed');
  }
});

// -------------------- SIDEBAR & PANE SWITCHING --------------------

// Toggle sidebar collapsed state on desktop
function toggleDesktopSidebar() {
  const wrapper = document.querySelector('.admin-wrapper');
  if (!wrapper) return;
  wrapper.classList.toggle('admin-sidebar-collapsed');
  const isCollapsed = wrapper.classList.contains('admin-sidebar-collapsed');
  localStorage.setItem('dcb_admin_sidebar_collapsed', isCollapsed ? 'true' : 'false');
}

// Toggle mobile off-canvas drawer sidebar
function toggleSidebar() {
  const sidebar = document.getElementById('adminSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.toggle('show');
  if (overlay) overlay.classList.toggle('show');
}

// Switch between main admin tabs/panes
function switchAdminPane(paneId, btnEl) {
  // Update sidebar active buttons
  document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  // Switch panes
  const allPanes = ['ordersPane', 'productsPane', 'brandsPane', 'categoriesPane', 'shopInfoPane'];
  allPanes.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = (id === paneId) ? 'block' : 'none';
    }
  });

  // Topbar titles
  const titles = {
    ordersPane: ['অর্ডার ম্যানেজমেন্ট ও ভাউচার', 'সকল গ্রাহকের অর্ডার ও পার্সেল চালান পরিচালনা করুন'],
    productsPane: ['প্রোডাক্ট ক্যাটালগ ও ইনভেন্টরি', 'পণ্য যোগ, এডিট, অ্যাক্টিভেশন ও স্টক মনিটরিং'],
    brandsPane: ['ব্র্যান্ড তালিকা ও ব্র্যান্ড ম্যানেজমেন্ট', 'দোকানের ব্র্যান্ড তালিকা তৈরি, সম্পাদনা ও মুছে ফেলা'],
    categoriesPane: ['ক্যাটাগরি তালিকা ও ক্যাটাগরি ম্যানেজমেন্ট', 'দোকানের সকল পণ্যের ক্যাটাগরি তৈরি, সম্পাদনা ও মুছে ফেলা'],
    shopInfoPane: ['শপ তথ্য ও পরিচালনা গাইডলাইন', 'দোকানের প্রাতিষ্ঠানিক তথ্য, পলিসি ও অ্যাডমিন এসওপি']
  };

  if (titles[paneId]) {
    setElText('currentSectionTitle', titles[paneId][0]);
    setElText('currentSectionSubtitle', titles[paneId][1]);
  }

  // Close mobile sidebar smoothly
  const sidebar = document.getElementById('adminSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar && sidebar.classList.contains('show')) {
    sidebar.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
  }

  if (paneId === 'brandsPane') {
    renderAdminBrands();
  }
  if (paneId === 'categoriesPane') {
    renderAdminCategories();
  }
  if (paneId === 'productsPane') {
    populateProductBrandFilterDropdown();
    renderAdminProducts();
  }
  if (paneId === 'ordersPane') {
    renderAdminOrders();
  }
}

// -------------------- PRODUCT IMAGE PREVIEW & FILE UPLOAD --------------------

// Interactive Live Gallery Previews with Individual Delete & Primary Image Badge
function updateImagePreviews() {
  const container = document.getElementById('prodImagesPreviewContainer');
  const textarea = document.getElementById('prodImages');
  const countBadge = document.getElementById('prodImageCountBadge');
  if (!container || !textarea) return;

  const urls = textarea.value.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);

  if (countBadge) {
    countBadge.innerText = `${urls.length}টি ছবি`;
  }

  if (urls.length === 0) {
    container.innerHTML = '<span class="text-muted small m-auto">ছবি লিংক পেস্ট করলে বা আপলোড করলে এখানে থাম্বনেইল দেখা যাবে</span>';
    return;
  }

  container.innerHTML = urls.map((u, idx) => `
    <div class="image-preview-card" title="ছবি #${idx + 1}">
      <img src="${u}" alt="প্রিভিউ ${idx + 1}" onerror="this.src='https://via.placeholder.com/80?text=Error'">
      ${idx === 0 ? '<span class="primary-badge"><i class="fa-solid fa-star me-1"></i>মূল ছবি</span>' : ''}
      <button type="button" class="delete-btn" onclick="removeProductImageAt(${idx})" title="ছবিটি মুছে ফেলুন">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  `).join('');
}

// Remove single image from list
function removeProductImageAt(index) {
  const textarea = document.getElementById('prodImages');
  if (!textarea) return;
  const urls = textarea.value.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
  if (index >= 0 && index < urls.length) {
    urls.splice(index, 1);
    textarea.value = urls.join('\n');
    updateImagePreviews();
    showAdminToast('ছবিটি তালিকা থেকে সরানো হয়েছে', 'info');
  }
}

// Handle direct image file upload from phone or computer using FileReader
function handleProductImageFiles(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const textarea = document.getElementById('prodImages');
  let currentUrls = textarea ? textarea.value.split(/[\n,]+/).map(s => s.trim()).filter(Boolean) : [];

  let loadedCount = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = function(e) {
      const base64Data = e.target.result;
      currentUrls.push(base64Data);
      loadedCount++;
      if (loadedCount === files.length) {
        if (textarea) {
          textarea.value = currentUrls.join('\n');
          updateImagePreviews();
          showAdminToast(`${loadedCount}টি ছবি সফলভাবে আপলোড হয়েছে!`, 'success');
        }
      }
    };
    reader.readAsDataURL(file);
  }
  // Reset file input so same file can be selected again if needed
  event.target.value = '';
}

// Dynamic live discount calculation and validation
function calculateProductDiscount() {
  const sellingInput = document.getElementById('prodSellingPrice');
  const originalInput = document.getElementById('prodOriginalPrice');
  const feedback = document.getElementById('prodDiscountFeedback');
  if (!sellingInput || !feedback) return;

  const selling = parseFloat(sellingInput.value) || 0;
  const original = parseFloat(originalInput?.value) || 0;

  if (original > 0 && original > selling) {
    const diff = original - selling;
    const pct = Math.round((diff / original) * 100);
    feedback.innerHTML = `<span class="badge bg-success-subtle text-success border border-success px-2 py-1"><i class="fa-solid fa-arrow-down me-1"></i>৳${diff} ছাড় (${pct}% ডিসকাউন্ট)</span>`;
  } else if (original > 0 && selling > original) {
    feedback.innerHTML = `<span class="badge bg-warning-subtle text-danger border border-warning px-2 py-1"><i class="fa-solid fa-triangle-exclamation me-1"></i>সতর্কতা: বিক্রয় মূল্য মূল মূল্যের চেয়ে বেশি!</span>`;
  } else {
    feedback.innerHTML = '';
  }
}

// Live stock feedback
function checkStockLevel() {
  const stockInput = document.getElementById('prodStock');
  const feedback = document.getElementById('prodStockFeedback');
  if (!stockInput || !feedback) return;

  const stock = parseInt(stockInput.value) || 0;
  if (stock <= 10) {
    feedback.innerHTML = `<span class="badge bg-danger-subtle text-danger border border-danger px-2 py-1"><i class="fa-solid fa-triangle-exclamation me-1"></i>লো স্টক সতর্কতা (১০ বা তার কম)</span>`;
  } else {
    feedback.innerHTML = `<span class="badge bg-success-subtle text-success border border-success px-2 py-1"><i class="fa-solid fa-check me-1"></i>পর্যাপ্ত স্টক (${stock} টি)</span>`;
  }
}

// Helper for clickable suggestion chips (Colors & Sizes)
function toggleOptionChip(inputId, value) {
  const input = document.getElementById(inputId);
  if (!input) return;

  let currentValues = input.value.split(',').map(s => s.trim()).filter(Boolean);
  const existsIndex = currentValues.indexOf(value);

  if (existsIndex > -1) {
    currentValues.splice(existsIndex, 1);
  } else {
    currentValues.push(value);
  }

  input.value = currentValues.join(', ');
}

// -------------------- AUTHENTICATION & LOGIN/LOGOUT --------------------

function toggleAdminPasswordVisibility() {
  const passInput = document.getElementById('adminPasswordInput') || document.getElementById('adminPasscode');
  const icon = document.getElementById('togglePasswordIcon');
  if (!passInput) return;
  if (passInput.type === 'password') {
    passInput.type = 'text';
    if (icon) {
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    }
  } else {
    passInput.type = 'password';
    if (icon) {
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  }
}

function checkAdminAuth() {
  const isAuth = sessionStorage.getItem('dcb_admin_auth');
  const loginGate = document.getElementById('adminLoginGate');
  const dashboardContent = document.getElementById('adminDashboardContent');

  if (isAuth === 'true') {
    if (loginGate) {
      loginGate.classList.add('d-none');
      loginGate.classList.remove('d-flex');
      loginGate.style.display = 'none';
    }
    if (dashboardContent) {
      dashboardContent.classList.remove('d-none');
      dashboardContent.style.display = 'block';
    }
    loadAdminDashboard();
  } else {
    if (loginGate) {
      loginGate.classList.remove('d-none');
      loginGate.classList.add('d-flex');
      loginGate.style.display = 'flex';
    }
    if (dashboardContent) {
      dashboardContent.classList.add('d-none');
      dashboardContent.style.display = 'none';
    }
  }
}

function handleAdminLogin(e) {
  if (e && e.preventDefault) e.preventDefault();

  const passInput = document.getElementById('adminPasswordInput') || document.getElementById('adminPasscode') || document.getElementById('adminPinInput');
  const errorMsg = document.getElementById('adminLoginError');

  if (!passInput) {
    console.error('Password input not found!');
    return;
  }

  const enteredVal = passInput.value.trim();
  const storedPin = localStorage.getItem('dcb_admin_pin') || DEFAULT_ADMIN_PASSCODE;

  // Accept DEFAULT_ADMIN_PASSCODE ('Dcbd@2026'), storedPin, or 'admin', 'admin123'
  if (enteredVal === DEFAULT_ADMIN_PASSCODE || enteredVal === storedPin || enteredVal === 'Dcbd@2026' || enteredVal === 'admin' || enteredVal === 'admin123') {
    sessionStorage.setItem('dcb_admin_auth', 'true');
    passInput.value = '';
    if (errorMsg) {
      errorMsg.classList.add('d-none');
      errorMsg.innerHTML = '';
    }
    checkAdminAuth();
    showAdminToast('এডমিন ড্যাশবোর্ডে স্বাগতম!', 'success');
  } else {
    if (errorMsg) {
      errorMsg.classList.remove('d-none');
      errorMsg.innerHTML = '<div class="alert alert-danger py-2 px-3 small rounded-3 mb-0"><i class="fa-solid fa-circle-exclamation me-1"></i>ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন (ডিফল্ট: <strong>Dcbd@2026</strong>)</div>';
    }
    passInput.focus();
  }
}

function handleAdminLogout() {
  if (confirm('আপনি কি নিশ্চিত যে অ্যাডমিন প্যানেল থেকে লগআউট করতে চান?')) {
    sessionStorage.removeItem('dcb_admin_auth');
    checkAdminAuth();
    showAdminToast('লগআউট সম্পন্ন হয়েছে।', 'info');
  }
}

function loadAdminDashboard() {
  try { updateDashboardStats(); } catch (err) { console.error('Stats error:', err); }
  try { renderAdminOrders(); } catch (err) { console.error('Orders error:', err); }
  try { renderAdminProducts(); } catch (err) { console.error('Products error:', err); }
  try { renderAdminBrands(); } catch (err) { console.error('Brands error:', err); }
  try { renderAdminCategories(); } catch (err) { console.error('Categories error:', err); }
  try { populateBrandDropdown(); } catch (err) { console.error('Brand dropdown error:', err); }
  try { populateCategoryDropdown(); } catch (err) { console.error('Category dropdown error:', err); }
  try { populateProductBrandFilterDropdown(); } catch (err) { console.error('Brand filter dropdown error:', err); }
  try { populateProductCategoryFilterDropdown(); } catch (err) { console.error('Category filter dropdown error:', err); }
}

function setupAdminListeners() {
  const searchOrderInput = document.getElementById('adminOrderSearch');
  if (searchOrderInput) {
    searchOrderInput.addEventListener('input', () => {
      renderAdminOrders();
    });
  }

  const orderFilterSelect = document.getElementById('adminOrderStatusFilter');
  if (orderFilterSelect) {
    orderFilterSelect.addEventListener('change', (e) => {
      filterOrdersByStatus(e.target.value);
    });
  }

  const prodImagesInput = document.getElementById('prodImages');
  if (prodImagesInput) prodImagesInput.addEventListener('input', updateImagePreviews);

  // Support both search input IDs
  const searchProductInput = document.getElementById('adminProductSearchInput') || document.getElementById('adminProductSearch');
  if (searchProductInput) {
    searchProductInput.addEventListener('input', (e) => {
      handleProductSearch(e.target.value);
    });
  }

  // Close mobile sidebar on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const sidebar = document.getElementById('adminSidebar');
      const overlay = document.getElementById('sidebarOverlay');
      if (sidebar && sidebar.classList.contains('show')) {
        sidebar.classList.remove('show');
        if (overlay) overlay.classList.remove('show');
      }
    }
  });
}

// -------------------- STATS & ONCLICK METRIC COUNTER FILTERS --------------------

function updateDashboardStats() {
  const orders = JSON.parse(localStorage.getItem('dcb_orders') || '[]');
  const products = JSON.parse(localStorage.getItem('dcb_products') || '[]');
  const brands = getBrands();
  const visitors = parseInt(localStorage.getItem('dcb_visitors_base') || '1480');

  // Orders counts
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const confirmedOrders = orders.filter(o => o.status === 'Confirmed').length;
  const processingOrders = orders.filter(o => o.status === 'Processing').length;
  const shippedOrders = orders.filter(o => o.status === 'Shipped').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;

  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  // Products counts
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status !== 'inactive').length;
  const inactiveProducts = products.filter(p => p.status === 'inactive').length;
  const lowStockProducts = products.filter(p => (p.stock || 0) <= 10).length;

  // Update DOM Order counters
  setElText('statTotalOrders', totalOrders);
  setElText('sideOrderCount', totalOrders);
  setElText('statPendingOrders', pendingOrders);
  setElText('statConfirmedOrders', confirmedOrders);
  setElText('statProcessingOrders', processingOrders);
  setElText('statShippedOrders', shippedOrders);
  setElText('statDeliveredOrders', deliveredOrders);
  setElText('statCancelledOrders', cancelledOrders);
  setElText('statTotalRevenue', `৳${totalRevenue.toLocaleString()}`);

  // Update DOM Product counters
  setElText('statProdTotal', totalProducts);
  setElText('statTotalProducts', totalProducts);
  setElText('sideProdCount', totalProducts);
  setElText('statActiveProducts', activeProducts);
  setElText('statInactiveProducts', inactiveProducts);
  setElText('statLowStockProducts', lowStockProducts);

  // Update DOM Brand counters
  setElText('sideBrandCount', brands.length);
  setElText('brandsCountInTable', brands.length);

  // Update DOM Category counters
  const categories = getCategories();
  setElText('sideCatCount', categories.length);
  setElText('categoriesCountInTable', categories.length);

  setElText('statTotalVisitors', visitors.toLocaleString());
}

function setElText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

// Filter Orders by Clicking Status Cards
function filterOrdersByStatus(status) {
  currentAdminOrderFilter = status;
  const select = document.getElementById('adminOrderStatusFilter');
  if (select) select.value = status;

  // Visual card highlight
  document.querySelectorAll('.order-stat-card').forEach(c => c.classList.remove('active-filter'));
  const targetCard = document.getElementById(`orderCard_${status}`);
  if (targetCard) targetCard.classList.add('active-filter');

  const badge = document.getElementById('activeFilterBadge');
  if (badge) badge.innerText = getStatusNameInBengali(status);

  renderAdminOrders();
  showAdminToast(`অর্ডার স্ট্যাটাস ফিল্টার: ${getStatusNameInBengali(status)}`, 'info');
}

// Filter Products by Clicking Metric Cards (Active, Inactive, Low Stock)
function filterProductsByMetric(metric) {
  currentAdminProductFilter = metric;

  document.querySelectorAll('.product-stat-card').forEach(c => c.classList.remove('active-filter'));
  const targetCard = document.getElementById(`prodCard_${metric}`);
  if (targetCard) targetCard.classList.add('active-filter');

  const badge = document.getElementById('activeProductFilterBadge');
  if (badge) badge.innerText = getMetricNameInBengali(metric);

  renderAdminProducts();
  showAdminToast(`পণ্য ফিল্টার: ${getMetricNameInBengali(metric)}`, 'info');
}

function getMetricNameInBengali(metric) {
  switch (metric) {
    case 'active': return 'সক্রিয় পণ্য (স্টোরে দৃশ্যমান)';
    case 'inactive': return 'ডি-একটিভ পণ্য (স্টোরে লুকানো)';
    case 'low_stock': return 'লো স্টক পণ্য (১০ বা কম)';
    default: return 'সকল পণ্য';
  }
}

// -------------------- ORDER MANAGEMENT --------------------

function renderAdminOrders() {
  const tbody = document.getElementById('adminOrdersTableBody');
  if (!tbody) return;

  let orders = JSON.parse(localStorage.getItem('dcb_orders') || '[]');
  const searchTerm = (document.getElementById('adminOrderSearch')?.value || '').toLowerCase().trim();
  const statusFilter = currentAdminOrderFilter;

  if (statusFilter !== 'all') {
    orders = orders.filter(o => o.status === statusFilter);
  }

  if (searchTerm) {
    orders = orders.filter(o => 
      o.orderId.toLowerCase().includes(searchTerm) ||
      o.customer.name.toLowerCase().includes(searchTerm) ||
      o.customer.phone.includes(searchTerm) ||
      (o.customer.address && o.customer.address.toLowerCase().includes(searchTerm)) ||
      (o.paymentDetails?.trxId && o.paymentDetails.trxId.toLowerCase().includes(searchTerm))
    );
  }

  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-5 text-muted">
          <i class="fa-solid fa-clipboard-list fa-2x mb-2 text-secondary"></i>
          <div>কোনো অর্ডার পাওয়া যায়নি (${statusFilter === 'all' ? 'তালিকা খালি' : getStatusNameInBengali(statusFilter)})</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map((o) => {
    return `
      <tr>
        <td>
          <strong>#${o.orderId}</strong>
          ${o.isFreeDelivery ? '<br><span class="badge bg-success-subtle text-success border small">ফ্রি ডেলিভারি</span>' : ''}
        </td>
        <td><small>${o.formattedDate || new Date(o.timestamp).toLocaleDateString('bn-BD')}</small></td>
        <td>
          <div class="fw-semibold">${o.customer.name}</div>
          <small class="text-muted"><i class="fa-solid fa-phone"></i> ${o.customer.phone}</small>
          <div class="small text-truncate" style="max-width: 170px;" title="${o.customer.address}">${o.customer.address}</div>
        </td>
        <td>
          <small class="badge bg-light text-dark border">${o.deliveryAreaLabel || o.deliveryArea}</small>
        </td>
        <td>
          <div>${getPaymentMethodName(o.paymentMethod)}</div>
          ${o.paymentDetails?.trxId ? `<small class="text-success fw-bold">TrxID: ${o.paymentDetails.trxId}</small>` : ''}
        </td>
        <td class="fw-bold fs-6 text-primary">৳${o.grandTotal}</td>
        <td>
          <select class="form-select form-select-sm" onchange="updateOrderStatus('${o.orderId}', this.value)" style="min-width: 130px;">
            <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>অপেক্ষমান (Pending)</option>
            <option value="Confirmed" ${o.status === 'Confirmed' ? 'selected' : ''}>কনফার্মড (Confirmed)</option>
            <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>প্রসেসিং (Processing)</option>
            <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>ডেলিভারির পথে (Shipped)</option>
            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>ডেলিভার্ড (Delivered)</option>
            <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>বাতিল (Cancelled)</option>
          </select>
        </td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-warning fw-bold text-dark" title="পার্সেল ভাউচার প্রিন্ট করুন" onclick="printOrderVoucher('${o.orderId}')">
              <i class="fa-solid fa-receipt me-1"></i> ভাউচার
            </button>
            <button class="btn btn-outline-primary" title="অর্ডার এডিট করুন" onclick="openEditOrderModal('${o.orderId}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn btn-outline-info" title="অর্ডার বিস্তারিত" onclick="viewOrderDetails('${o.orderId}')">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="btn btn-outline-danger" title="অর্ডার ডিলিট" onclick="deleteOrder('${o.orderId}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function getStatusNameInBengali(status) {
  switch (status) {
    case 'Pending': return 'অপেক্ষমান';
    case 'Confirmed': return 'কনফার্মড';
    case 'Processing': return 'প্রসেসিং';
    case 'Shipped': return 'ডেলিভারির পথে';
    case 'Delivered': return 'ডেলিভার্ড';
    case 'Cancelled': return 'বাতিল';
    case 'all': return 'সবগুলো';
    default: return status;
  }
}

function getPaymentMethodName(m) {
  switch (m) {
    case 'cod': return 'ক্যাশ অন ডেলিভারি';
    case 'bkash': return 'বিকাশ (bKash)';
    case 'nagad': return 'নগদ (Nagad)';
    case 'rocket': return 'রকেট (Rocket)';
    case 'bank': return 'ইসলামী ব্যাংক';
    default: return m;
  }
}

function updateOrderStatus(orderId, newStatus) {
  let orders = JSON.parse(localStorage.getItem('dcb_orders') || '[]');
  const orderIndex = orders.findIndex(o => o.orderId === orderId);

  if (orderIndex > -1) {
    orders[orderIndex].status = newStatus;
    localStorage.setItem('dcb_orders', JSON.stringify(orders));
    updateDashboardStats();
    showAdminToast(`অর্ডার #${orderId}-এর স্ট্যাটাস আপডেট হয়েছে: ${getStatusNameInBengali(newStatus)}`, 'success');
  }
}

// Edit Order Modal
function openEditOrderModal(orderId) {
  const orders = JSON.parse(localStorage.getItem('dcb_orders') || '[]');
  const order = orders.find(o => o.orderId === orderId);
  if (!order) return;

  document.getElementById('editOrderId').value = order.orderId;
  document.getElementById('editOrderCustomerName').value = order.customer.name;
  document.getElementById('editOrderCustomerPhone').value = order.customer.phone;
  document.getElementById('editOrderCustomerAddress').value = order.customer.address;
  document.getElementById('editOrderStatus').value = order.status;
  document.getElementById('editOrderNotes').value = order.notes || '';

  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('adminOrderEditModal'));
  modal.show();
}

function handleOrderEditSubmit(e) {
  e.preventDefault();
  const orderId = document.getElementById('editOrderId').value;
  const name = document.getElementById('editOrderCustomerName').value.trim();
  const phone = document.getElementById('editOrderCustomerPhone').value.trim();
  const address = document.getElementById('editOrderCustomerAddress').value.trim();
  const status = document.getElementById('editOrderStatus').value;
  const notes = document.getElementById('editOrderNotes').value.trim();

  let orders = JSON.parse(localStorage.getItem('dcb_orders') || '[]');
  const idx = orders.findIndex(o => o.orderId === orderId);
  if (idx > -1) {
    orders[idx].customer.name = name;
    orders[idx].customer.phone = phone;
    orders[idx].customer.address = address;
    orders[idx].status = status;
    orders[idx].notes = notes;

    localStorage.setItem('dcb_orders', JSON.stringify(orders));
    updateDashboardStats();
    renderAdminOrders();
    showAdminToast(`অর্ডার #${orderId} সফলভাবে আপডেট করা হয়েছে!`, 'success');

    const modalEl = document.getElementById('adminOrderEditModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }
}

// Professional Parcel Delivery Voucher / Memo Print with Logo & Dual Contact
function printOrderVoucher(orderId) {
  const orders = JSON.parse(localStorage.getItem('dcb_orders') || '[]');
  const order = orders.find(o => o.orderId === orderId);
  if (!order) return;

  const isCOD = order.paymentMethod === 'cod';
  const cashToCollect = isCOD ? order.grandTotal : 0;

  const voucherWindow = window.open('', '_blank', 'width=850,height=900');
  voucherWindow.document.write(`
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <title>Delivery Voucher #${order.orderId} - Dream Cart BD</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #0f172a; }
        .voucher-box { max-width: 780px; margin: auto; border: 2px dashed #0284c7; padding: 25px; border-radius: 12px; background: #fff; }
        .brand-header { border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; }
        .cut-line { border-top: 1.5px dashed #94a3b8; margin: 25px 0; position: relative; }
        .cut-line::after { content: '✂ কুরিয়ার পার্সেল স্লিপ ও চালান'; position: absolute; top: -11px; left: 35%; background: #fff; padding: 0 10px; font-size: 12px; color: #64748b; font-weight: 600; }
        .voucher-logo { width: 65px; height: 65px; border-radius: 12px; object-fit: cover; border: 1.5px solid #0284c7; }
        @media print {
          .no-print { display: none !important; }
          body { padding: 0; }
          .voucher-box { border: 1.5px solid #000; }
        }
      </style>
    </head>
    <body>
      <div class="voucher-box">
        <!-- Sender Header with Shop Logo -->
        <div class="brand-header d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-3">
            <img src="${SHOP_LOGO_URL}" alt="Dream Cart BD Logo" class="voucher-logo">
            <div>
              <h2 class="fw-bold text-primary mb-0">Dream Cart BD</h2>
              <div class="fw-semibold text-secondary" style="font-size: 13px;">স্মার্ট অফিসের পূর্ণাঙ্গ সমাধান, আভিজাত্যে আপনার পাশে</div>
              <div class="small">চৌধুরী প্লাজা (নিচতলা, রুম ৩), পদুয়ার বাজার বিশ্বরোড, কুমিল্লা</div>
              <div class="small"><strong>হেল্পলাইন:</strong> ০১৫৮১ ৭০৩ ৮২২ (01581703822), ০১৮১ ৮২৭ ৩৮৩৮</div>
            </div>
          </div>
          <div class="text-end">
            <div class="badge bg-primary fs-6 mb-1">পার্সেল ডেলিভারি চালান</div>
            <div class="fw-bold fs-5">#${order.orderId}</div>
            <div class="small text-muted">তারিখ: ${order.formattedDate || new Date().toLocaleDateString('bn-BD')}</div>
          </div>
        </div>

        <!-- Address & Recipient Grid -->
        <div class="row g-3 mb-3">
          <div class="col-7">
            <div class="p-2 border rounded bg-light">
              <h6 class="fw-bold text-dark border-bottom pb-1 mb-2">📦 প্রাপকের তথ্য (To):</h6>
              <div class="fs-6 fw-bold">${order.customer.name}</div>
              <div class="fw-bold text-primary fs-6"><i class="fa-solid fa-phone"></i> মোবাইল: ${order.customer.phone}</div>
              <div class="small mt-1"><strong>পূর্ণ ঠিকানা:</strong> ${order.customer.address}</div>
              <div class="small mt-1"><strong>ডেলিভারি এরিয়া:</strong> ${order.deliveryAreaLabel}</div>
              ${order.notes ? `<div class="small text-danger mt-1"><strong>বিশেষ নোট:</strong> ${order.notes}</div>` : ''}
            </div>
          </div>

          <div class="col-5">
            <div class="p-2 border rounded bg-light h-100">
              <h6 class="fw-bold text-dark border-bottom pb-1 mb-2">💳 পেমেন্ট ও ক্যাশ কালেকশন:</h6>
              <div>মেথড: <strong>${getPaymentMethodName(order.paymentMethod)}</strong></div>
              ${order.paymentDetails?.trxId ? `<div>TrxID: <strong class="text-success">${order.paymentDetails.trxId}</strong></div>` : ''}
              ${order.paymentDetails?.senderNumber ? `<div>প্রেরক: <strong>${order.paymentDetails.senderNumber}</strong></div>` : ''}
              
              <div class="mt-2 pt-2 border-top">
                <div class="small text-muted">কুরিয়ার কর্তৃক গ্রাহক থেকে আদায়যোগ্য:</div>
                <div class="fs-4 fw-bold ${isCOD ? 'text-danger' : 'text-success'}">
                  ${isCOD ? `৳${cashToCollect} (COD)` : '৳০ (পেইড)'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Checklist for Packing -->
        <h6 class="fw-bold mb-2">পণ্য প্যাকিং ও ডেলিভারি তালিকা:</h6>
        <table class="table table-bordered table-sm mb-3">
          <thead class="table-light">
            <tr>
              <th style="width: 40px;" class="text-center">চেক</th>
              <th>পণ্যের বিবরণ</th>
              <th>কালার / সাইজ</th>
              <th class="text-center">পরিমাণ</th>
              <th class="text-end">দর</th>
              <th class="text-end">মোট</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td class="text-center font-monospace"> [ &nbsp; ] </td>
                <td class="fw-semibold">${item.name}</td>
                <td>${item.color || '-'} / ${item.size || '-'}</td>
                <td class="text-center fw-bold">${item.qty} পিস</td>
                <td class="text-end">৳${item.price}</td>
                <td class="text-end fw-bold">৳${item.price * item.qty}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5" class="text-end">সাবটোটাল:</td>
              <td class="text-end fw-bold">৳${order.subtotal}</td>
            </tr>
            ${order.discountAmount > 0 ? `
              <tr class="text-success">
                <td colspan="5" class="text-end">অনলাইন পেমেন্ট ৪% ছাড়:</td>
                <td class="text-end fw-bold">-৳${order.discountAmount}</td>
              </tr>
            ` : ''}
            <tr>
              <td colspan="5" class="text-end">ডেলিভারি চার্জ:</td>
              <td class="text-end fw-bold">${order.isFreeDelivery ? 'ফ্রি (৳০)' : `৳${order.deliveryFee}`}</td>
            </tr>
            <tr class="table-primary fw-bold">
              <td colspan="5" class="text-end fs-6">সর্বমোট বিল:</td>
              <td class="text-end fs-6">৳${order.grandTotal}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Signatures and footer -->
        <div class="row pt-4 mt-3 text-center small">
          <div class="col-4">
            <div class="border-top pt-1">প্যাকিং প্রস্তুতকারী</div>
          </div>
          <div class="col-4">
            <div class="border-top pt-1">ডেলিভারি প্রতিনিধি / কুরিয়ার</div>
          </div>
          <div class="col-4">
            <div class="border-top pt-1">গ্রাহকের স্বাক্ষর</div>
          </div>
        </div>

        <div class="cut-line"></div>

        <div class="d-flex justify-content-between align-items-center small text-muted">
          <span>Dream Cart BD | পদুয়ার বাজার বিশ্বরোড, কুমিল্লা</span>
          <span>হেল্পলাইন: ০১৫৮১ ৭০৩ ৮২২, ০১৮১ ৮২৭ ৩৮৩৮ (01818273838)</span>
        </div>

        <div class="text-center mt-4 no-print">
          <button class="btn btn-primary px-4 py-2 fw-bold" onclick="window.print()">
            <i class="fa-solid fa-print me-1"></i> ভাউচার প্রিন্ট করুন
          </button>
        </div>
      </div>
    </body>
    </html>
  `);
  voucherWindow.document.close();
}

function viewOrderDetails(orderId) {
  const orders = JSON.parse(localStorage.getItem('dcb_orders') || '[]');
  const order = orders.find(o => o.orderId === orderId);
  if (!order) return;

  const modalBody = document.getElementById('adminOrderDetailsBody');
  modalBody.innerHTML = `
    <div class="row g-3 mb-3">
      <div class="col-md-6">
        <h6 class="border-bottom pb-2">গ্রাহকের বিবরণ:</h6>
        <div><strong>নাম:</strong> ${order.customer.name}</div>
        <div><strong>ফোন:</strong> ${order.customer.phone}</div>
        <div><strong>ইমেইল:</strong> ${order.customer.email || 'N/A'}</div>
        <div><strong>ঠিকানা:</strong> ${order.customer.address}</div>
        <div><strong>ডেলিভারি এলাকা:</strong> ${order.deliveryAreaLabel || order.deliveryArea} (${order.isFreeDelivery ? 'ফ্রি ডেলিভারি' : `চার্জ: ৳${order.deliveryFee}`})</div>
      </div>
      <div class="col-md-6">
        <h6 class="border-bottom pb-2">পেমেন্ট বিবরণ:</h6>
        <div><strong>পেমেন্ট মেথড:</strong> ${getPaymentMethodName(order.paymentMethod)}</div>
        ${order.paymentDetails?.senderNumber ? `<div><strong>প্রেরক নম্বর:</strong> ${order.paymentDetails.senderNumber}</div>` : ''}
        ${order.paymentDetails?.trxId ? `<div><strong>ট্রানজেকশন আইডি (TrxID):</strong> <span class="badge bg-success-subtle text-success">${order.paymentDetails.trxId}</span></div>` : ''}
        <div><strong>স্ট্যাটাস:</strong> <span class="badge bg-primary">${getStatusNameInBengali(order.status)}</span></div>
        <div><strong>অর্ডারের সময়:</strong> ${order.formattedDate || order.timestamp}</div>
      </div>
    </div>

    <h6 class="border-bottom pb-2">অর্ডারকৃত আইটেম:</h6>
    <div class="table-responsive">
      <table class="table table-sm table-bordered">
        <thead class="table-light">
          <tr>
            <th>পণ্য</th>
            <th>ভেরিয়েন্ট</th>
            <th class="text-center">পরিমাণ</th>
            <th class="text-end">মূল্য</th>
            <th class="text-end">মোট</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <img src="${item.image}" style="width: 36px; height: 36px; object-fit: cover; border-radius: 4px;">
                  <span>${item.name}</span>
                </div>
              </td>
              <td>${item.color ? `রং: ${item.color}` : ''} ${item.size ? `| সাইজ: ${item.size}` : ''}</td>
              <td class="text-center">${item.qty}</td>
              <td class="text-end">৳${item.price}</td>
              <td class="text-end fw-bold">৳${item.price * item.qty}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" class="text-end">সাবটোটাল:</td>
            <td class="text-end fw-bold">৳${order.subtotal}</td>
          </tr>
          ${order.discountAmount > 0 ? `
            <tr class="text-success">
              <td colspan="4" class="text-end">অনলাইন পেমেন্ট ৪% ছাড়:</td>
              <td class="text-end fw-bold">-৳${order.discountAmount}</td>
            </tr>
          ` : ''}
          <tr>
            <td colspan="4" class="text-end">ডেলিভারি চার্জ:</td>
            <td class="text-end fw-bold">${order.isFreeDelivery ? 'ফ্রি (৳০)' : `৳${order.deliveryFee}`}</td>
          </tr>
          <tr class="table-active">
            <td colspan="4" class="text-end fw-bold">সর্বমোট প্রদেয় বিল:</td>
            <td class="text-end fw-bold text-primary fs-6">৳${order.grandTotal}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    ${order.notes ? `
      <div class="alert alert-secondary py-2 mt-2">
        <strong>কাস্টমার নোট:</strong> ${order.notes}
      </div>
    ` : ''}
  `;

  document.getElementById('adminInvoicePrintBtn').onclick = () => printOrderVoucher(order.orderId);

  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('adminOrderDetailsModal'));
  modal.show();
}

function deleteOrder(orderId) {
  if (!confirm(`আপনি কি নিশ্চিতভাবে অর্ডার #${orderId} মুছে ফেলতে চান?`)) return;

  let orders = JSON.parse(localStorage.getItem('dcb_orders') || '[]');
  orders = orders.filter(o => o.orderId !== orderId);
  localStorage.setItem('dcb_orders', JSON.stringify(orders));

  updateDashboardStats();
  renderAdminOrders();
  showAdminToast(`অর্ডার #${orderId} ডিলিট করা হয়েছে!`, 'warning');
}

function exportOrdersCSV() {
  const orders = JSON.parse(localStorage.getItem('dcb_orders') || '[]');
  if (orders.length === 0) {
    showAdminToast('এক্সপোর্ট করার মতো কোনো অর্ডার নেই!', 'warning');
    return;
  }

  let csv = 'Order ID,Date,Customer Name,Phone,Address,Delivery Area,Payment Method,TrxID,Items Count,Subtotal,Discount,Delivery Fee,Grand Total,Status\n';

  orders.forEach(o => {
    const row = [
      o.orderId,
      `"${o.formattedDate || o.timestamp}"`,
      `"${o.customer.name}"`,
      `"${o.customer.phone}"`,
      `"${o.customer.address.replace(/"/g, '""')}"`,
      `"${o.deliveryAreaLabel}"`,
      `"${getPaymentMethodName(o.paymentMethod)}"`,
      `"${o.paymentDetails?.trxId || ''}"`,
      o.items.length,
      o.subtotal,
      o.discountAmount,
      o.deliveryFee,
      o.grandTotal,
      o.status
    ];
    csv += row.join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `dream_cart_bd_orders_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showAdminToast('অর্ডার ডাটা CSV ফরম্যাটে ডাউনলোড হয়েছে!', 'success');
}

// -------------------- PRODUCT MANAGEMENT (Active/Deactive, Low Stock, Brand Filter, CRUD) --------------------

// Populate Brand Filter Dropdown in Product Management toolbar
function populateProductBrandFilterDropdown() {
  const filterSelect = document.getElementById('adminProductBrandFilter');
  if (!filterSelect) return;

  const brands = getBrands();
  const products = JSON.parse(localStorage.getItem('dcb_products') || '[]');

  let html = `<option value="all">সকল ব্র্যান্ড (সব পণ্য - ${products.length}টি)</option>`;
  
  brands.forEach(b => {
    const count = products.filter(p => p.brand === b.name || p.brand === b.bangla_name).length;
    const isSel = (currentAdminBrandFilter === b.name || currentAdminBrandFilter === b.bangla_name) ? 'selected' : '';
    html += `<option value="${b.name}" ${isSel}>${b.name} (${b.bangla_name || b.name}) - ${count}টি</option>`;
  });

  const noBrandCount = products.filter(p => !p.brand || p.brand.trim() === '').length;
  if (noBrandCount > 0) {
    const isSel = (currentAdminBrandFilter === '__no_brand__') ? 'selected' : '';
    html += `<option value="__no_brand__" ${isSel}>ব্র্যান্ড ছাড়া পণ্য (${noBrandCount}টি)</option>`;
  }

  filterSelect.innerHTML = html;
  renderProductActiveFilterChips();
}

// Handle Brand filter change in product table
function handleProductBrandFilterChange(brandName) {
  currentAdminBrandFilter = brandName;
  renderProductActiveFilterChips();
  renderAdminProducts();
  if (brandName !== 'all') {
    showAdminToast(`ব্র্যান্ড ফিল্টার: ${brandName === '__no_brand__' ? 'ব্র্যান্ড ছাড়া পণ্য' : brandName}`, 'info');
  }
}

// Clear brand filter
function clearProductBrandFilter() {
  currentAdminBrandFilter = 'all';
  const filterSelect = document.getElementById('adminProductBrandFilter');
  if (filterSelect) filterSelect.value = 'all';
  renderProductActiveFilterChips();
  renderAdminProducts();
}

// Render active filter chips bar in product management (Category & Brand)
function renderProductActiveFilterChips() {
  const container = document.getElementById('adminProductActiveFiltersBar');
  if (!container) return;

  let chipsHtml = '';

  if (currentAdminCategoryFilter && currentAdminCategoryFilter !== 'all') {
    const catLabel = currentAdminCategoryFilter === '__no_cat__' ? 'ক্যাটাগরি ছাড়া' : currentAdminCategoryFilter;
    chipsHtml += `
      <span class="badge bg-info-subtle text-info-emphasis border border-info px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1">
        <i class="fa-solid fa-layer-group text-info"></i> ক্যাটাগরি: <strong>${catLabel}</strong>
        <button type="button" class="btn-close ms-1" style="font-size: 9px;" onclick="clearProductCategoryFilter()" aria-label="রিসেট"></button>
      </span>
    `;
  }

  if (currentAdminBrandFilter && currentAdminBrandFilter !== 'all') {
    const brandLabel = currentAdminBrandFilter === '__no_brand__' ? 'ব্র্যান্ড ছাড়া' : currentAdminBrandFilter;
    chipsHtml += `
      <span class="badge bg-warning-subtle text-dark border border-warning px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1">
        <i class="fa-solid fa-tag text-warning"></i> ব্র্যান্ড: <strong>${brandLabel}</strong>
        <button type="button" class="btn-close ms-1" style="font-size: 9px;" onclick="clearProductBrandFilter()" aria-label="রিসেট"></button>
      </span>
    `;
  }

  container.innerHTML = chipsHtml;
}

// Populate Category Filter Dropdown in Product Management toolbar
function populateProductCategoryFilterDropdown() {
  const filterSelect = document.getElementById('adminProductCategoryFilter');
  if (!filterSelect) return;

  const categories = getCategories();
  const products = JSON.parse(localStorage.getItem('dcb_products') || '[]');

  let html = `<option value="all">সকল ক্যাটাগরি (সব পণ্য - ${products.length}টি)</option>`;
  
  categories.forEach(c => {
    const count = products.filter(p => p.category === c.name || p.category === c.english_name).length;
    const isSel = (currentAdminCategoryFilter === c.name || currentAdminCategoryFilter === c.english_name) ? 'selected' : '';
    html += `<option value="${c.name}" ${isSel}>${c.name} (${count}টি)</option>`;
  });

  filterSelect.innerHTML = html;
  renderProductActiveFilterChips();
}

// Handle Category filter change in product table
function handleProductCategoryFilterChange(catName) {
  currentAdminCategoryFilter = catName;
  renderProductActiveFilterChips();
  renderAdminProducts();
  if (catName !== 'all') {
    showAdminToast(`ক্যাটাগরি ফিল্টার: ${catName}`, 'info');
  }
}

// Clear category filter
function clearProductCategoryFilter() {
  currentAdminCategoryFilter = 'all';
  const filterSelect = document.getElementById('adminProductCategoryFilter');
  if (filterSelect) filterSelect.value = 'all';
  renderProductActiveFilterChips();
  renderAdminProducts();
}

// Live search for products
function handleProductSearch(val) {
  currentAdminProductSearch = (val || '').toLowerCase().trim();
  renderAdminProducts();
}

function renderAdminProducts() {
  const tbody = document.getElementById('adminProductsTableBody');
  if (!tbody) return;

  let products = JSON.parse(localStorage.getItem('dcb_products') || '[]');
  const searchTerm = currentAdminProductSearch;
  const metricFilter = currentAdminProductFilter;
  const brandFilter = currentAdminBrandFilter;

  // 1. Metric filter
  if (metricFilter === 'active') {
    products = products.filter(p => p.status !== 'inactive');
  } else if (metricFilter === 'inactive') {
    products = products.filter(p => p.status === 'inactive');
  } else if (metricFilter === 'low_stock') {
    products = products.filter(p => (p.stock || 0) <= 10);
  }

  // 2. Category filter
  if (currentAdminCategoryFilter && currentAdminCategoryFilter !== 'all') {
    products = products.filter(p => p.category === currentAdminCategoryFilter || (p.category && p.category.toLowerCase() === currentAdminCategoryFilter.toLowerCase()));
  }

  // 3. Brand filter
  if (brandFilter && brandFilter !== 'all') {
    if (brandFilter === '__no_brand__') {
      products = products.filter(p => !p.brand || p.brand.trim() === '');
    } else {
      products = products.filter(p => p.brand === brandFilter || (p.brand && p.brand.toLowerCase() === brandFilter.toLowerCase()));
    }
  }

  // 3. Search query (matches name, english name, category, and brand)
  if (searchTerm) {
    products = products.filter(p => 
      (p.name && p.name.toLowerCase().includes(searchTerm)) || 
      (p.category && p.category.toLowerCase().includes(searchTerm)) ||
      (p.english_name && p.english_name.toLowerCase().includes(searchTerm)) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm))
    );
  }

  if (products.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-5 text-muted">
          <i class="fa-solid fa-boxes-stacked fa-2x mb-2 text-secondary"></i><br>
          কোনো পণ্য পাওয়া যায়নি (${getMetricNameInBengali(metricFilter)} ${brandFilter !== 'all' ? `| ব্র্যান্ড: ${brandFilter}` : ''})
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = products.map(p => {
    const mainImg = (p.images && p.images.length > 0) ? p.images[0] : 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=700&auto=format&fit=crop&q=80';
    const isActive = p.status !== 'inactive';
    const isLowStock = (p.stock || 0) <= 10;
    const brandBadge = p.brand ? `<span class="badge bg-warning-subtle text-dark border border-warning"><i class="fa-solid fa-tag me-1"></i>${p.brand}</span>` : `<small class="text-muted fst-italic">ব্র্যান্ড ছাড়া</small>`;

    return `
      <tr class="${!isActive ? 'table-secondary opacity-75' : ''}">
        <td>
          <img src="${mainImg}" alt="${p.name}" style="width: 52px; height: 52px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0;">
        </td>
        <td>
          <div class="fw-bold text-dark">${p.name}</div>
          <small class="text-muted">${p.english_name || ''}</small>
          ${p.badge ? `<span class="badge bg-danger ms-1" style="font-size: 10px;">${p.badge}</span>` : ''}
          ${isLowStock ? '<span class="badge bg-danger ms-1" style="font-size: 10px;"><i class="fa-solid fa-triangle-exclamation me-1"></i>লো স্টক</span>' : ''}
        </td>
        <td>
          <span class="badge bg-light text-dark border d-block mb-1 text-truncate" style="max-width: 140px;">${p.category || 'ফাইল ও ফোল্ডার'}</span>
          ${brandBadge}
        </td>
        <td>
          <span class="fw-bold text-primary fs-6">৳${p.price}</span>
          ${p.original_price ? `<br><small class="text-muted text-decoration-line-through">৳${p.original_price}</small>` : ''}
        </td>
        <td>
          <span class="badge ${p.stock > 10 ? 'bg-success-subtle text-success border-success' : 'bg-danger-subtle text-danger border-danger'} border px-2 py-1">
            ${p.stock} টি
          </span>
        </td>
        <td>
          <!-- Active / Deactive Toggle Button -->
          <button class="btn btn-sm ${isActive ? 'btn-success' : 'btn-outline-secondary'} rounded-pill shadow-sm" onclick="toggleProductActiveStatus(${p.id})" title="ক্লিক করে স্ট্যাটাস পরিবর্তন করুন">
            ${isActive ? '<i class="fa-solid fa-circle-check me-1"></i> সক্রিয়' : '<i class="fa-solid fa-circle-xmark me-1"></i> নিষ্ক্রিয়'}
          </button>
        </td>
        <td class="text-end">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary rounded-start-pill" title="পণ্য সম্পাদনা করুন" onclick="openEditProductModal(${p.id})">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn btn-outline-danger rounded-end-pill" title="পণ্যটি মুছে ফেলুন" onclick="deleteProduct(${p.id})">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// 1-Click Active / Deactive Toggle
function toggleProductActiveStatus(productId) {
  let products = JSON.parse(localStorage.getItem('dcb_products') || '[]');
  const idx = products.findIndex(p => p.id === productId);
  if (idx > -1) {
    const current = products[idx].status !== 'inactive';
    products[idx].status = current ? 'inactive' : 'active';
    localStorage.setItem('dcb_products', JSON.stringify(products));
    updateDashboardStats();
    renderAdminProducts();
    showAdminToast(`পণ্যটি ${products[idx].status === 'active' ? 'সক্রিয়' : 'ডি-একটিভ'} করা হয়েছে!`, 'info');
  }
}

// Open Add Product Modal with cleanly initialized fields
function openAddProductModal() {
  document.getElementById('productFormModalTitle').innerHTML = '<i class="fa-solid fa-plus-circle me-1 text-primary"></i> নতুন পণ্য যোগ করুন';
  const subtitle = document.getElementById('productFormModalSubtitle');
  if (subtitle) subtitle.innerText = 'পণ্যের নাম, ব্র্যান্ড, মূল্য, স্টক ও ছবি সঠিকভাবে পূরণ করুন';

  document.getElementById('adminProductForm').reset();
  document.getElementById('editProductId').value = '';
  document.getElementById('prodStatus').value = 'active';
  document.getElementById('prodStock').value = 50;

  populateBrandDropdown('');
  populateCategoryDropdown('');
  updateImagePreviews();
  calculateProductDiscount();
  checkStockLevel();

  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('adminProductFormModal'));
  modal.show();
}

// Open Edit Product Modal with complete prefilled fields and image gallery
function openEditProductModal(productId) {
  const products = JSON.parse(localStorage.getItem('dcb_products') || '[]');
  const product = products.find(p => p.id === productId);
  if (!product) return;

  document.getElementById('productFormModalTitle').innerHTML = `<i class="fa-solid fa-pen-to-square me-1 text-primary"></i> পণ্য সম্পাদনা: ${product.name} <span class="badge bg-secondary ms-1 fs-6">#${product.id}</span>`;
  const subtitle = document.getElementById('productFormModalSubtitle');
  if (subtitle) subtitle.innerText = 'পণ্যের তথ্য, মূল্য, ব্র্যান্ড, স্টক ও গ্যালারির ছবি পরিবর্তন করুন';

  document.getElementById('editProductId').value = product.id;
  document.getElementById('prodName').value = product.name || '';
  document.getElementById('prodEnglishName').value = product.english_name || '';
  document.getElementById('prodCategory').value = product.category || 'ফাইল ও ফোল্ডার';
  document.getElementById('prodSellingPrice').value = product.price || 0;
  document.getElementById('prodOriginalPrice').value = product.original_price || '';
  document.getElementById('prodStock').value = product.stock || 50;
  document.getElementById('prodColors').value = (product.colors || []).join(', ');
  document.getElementById('prodSizes').value = (product.sizes || []).join(', ');
  document.getElementById('prodBadge').value = product.badge || '';
  document.getElementById('prodStatus').value = product.status || 'active';
  document.getElementById('prodDescription').value = product.description || '';

  // Crucial fix: set prodImages BEFORE calling updateImagePreviews()
  document.getElementById('prodImages').value = (product.images || []).join('\n');
  updateImagePreviews();

  populateBrandDropdown(product.brand || '');
  populateCategoryDropdown(product.category || '');
  calculateProductDiscount();
  checkStockLevel();

  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('adminProductFormModal'));
  modal.show();
}

// Handle Product Add / Edit Submission with BRAND SAVED PROPERLY
function handleProductFormSubmit(e) {
  e.preventDefault();

  const idVal = document.getElementById('editProductId').value;
  const name = document.getElementById('prodName').value.trim();
  const englishName = document.getElementById('prodEnglishName').value.trim();
  const category = document.getElementById('prodCategory').value.trim();
  const brand = (document.getElementById('prodBrand')?.value || '').trim();
  const sellingPrice = parseFloat(document.getElementById('prodSellingPrice').value) || 0;
  const originalPrice = parseFloat(document.getElementById('prodOriginalPrice').value) || '';
  const stock = parseInt(document.getElementById('prodStock').value) || 0;
  const badge = document.getElementById('prodBadge').value.trim();
  const status = document.getElementById('prodStatus').value || 'active';
  const description = document.getElementById('prodDescription').value.trim();

  const colorsRaw = document.getElementById('prodColors').value;
  const colors = colorsRaw ? colorsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

  const sizesRaw = document.getElementById('prodSizes').value;
  const sizes = sizesRaw ? sizesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

  const imagesRaw = document.getElementById('prodImages').value;
  let images = imagesRaw ? imagesRaw.split(/[\n,]+/).map(s => s.trim()).filter(Boolean) : [];

  if (images.length === 0) {
    images = ['https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=700&auto=format&fit=crop&q=80'];
  }

  let products = JSON.parse(localStorage.getItem('dcb_products') || '[]');

  if (idVal) {
    // Edit existing product
    const id = parseInt(idVal);
    const idx = products.findIndex(p => p.id === id);
    if (idx > -1) {
      products[idx] = {
        ...products[idx],
        name,
        english_name: englishName,
        category,
        brand, // Crucial fix: brand saved on update!
        price: sellingPrice,
        original_price: originalPrice,
        stock,
        colors,
        sizes,
        badge,
        status,
        description,
        images
      };
      showAdminToast(`'${name}' পণ্যটি সফলভাবে আপডেট করা হয়েছে!`, 'success');
    }
  } else {
    // Add new product
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id || 0)) + 1 : 1;
    const newProduct = {
      id: newId,
      name,
      english_name: englishName,
      category,
      brand, // Crucial fix: brand saved on create!
      price: sellingPrice,
      original_price: originalPrice,
      stock,
      rating: 5.0,
      reviews_count: 1,
      colors,
      sizes,
      badge: badge || 'নতুন আগমন',
      status: status,
      description,
      images
    };
    products.unshift(newProduct);
    showAdminToast(`'${name}' নতুন পণ্য সফলভাবে স্টোরে যুক্ত হয়েছে!`, 'success');
  }

  localStorage.setItem('dcb_products', JSON.stringify(products));
  updateDashboardStats();
  populateProductBrandFilterDropdown();
  renderAdminProducts();
  renderAdminBrands();

  const modalEl = document.getElementById('adminProductFormModal');
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();
}

function deleteProduct(productId) {
  if (!confirm('আপনি কি এই পণ্যটি মুছে ফেলতে চান?')) return;

  let products = JSON.parse(localStorage.getItem('dcb_products') || '[]');
  products = products.filter(p => p.id !== productId);
  localStorage.setItem('dcb_products', JSON.stringify(products));

  updateDashboardStats();
  populateProductBrandFilterDropdown();
  renderAdminProducts();
  renderAdminBrands();
  showAdminToast('পণ্যটি সফলভাবে মুছে ফেলা হয়েছে!', 'warning');
}

function resetDefaultProducts() {
  if (!confirm('আপনি কি নিশ্চিত যে সমস্ত পণ্য ডিফল্ট মূল পণ্যে রিসেট করবেন?')) return;
  if (typeof DEFAULT_PRODUCTS !== 'undefined') {
    localStorage.setItem('dcb_products', JSON.stringify(DEFAULT_PRODUCTS));
    updateDashboardStats();
    populateProductBrandFilterDropdown();
    renderAdminProducts();
    renderAdminBrands();
    showAdminToast('ডিফল্ট পণ্য সফলভাবে রিস্টোর হয়েছে!', 'success');
  }
}

function showAdminToast(message, type = 'primary') {
  const toastEl = document.getElementById('adminToast');
  const toastBody = document.getElementById('adminToastBody');
  if (!toastEl || !toastBody) return;

  toastBody.innerText = message;
  toastEl.className = `toast align-items-center text-bg-${type} border-0`;
  const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
  toast.show();
}


// ==================== BRAND MANAGEMENT LOGIC (CRUD & FILTERS) ====================

function getBrands() {
  let brands = JSON.parse(localStorage.getItem('dcb_brands') || 'null');
  if (!brands || brands.length === 0) {
    if (typeof DEFAULT_BRANDS !== 'undefined' && Array.isArray(DEFAULT_BRANDS)) {
      brands = JSON.parse(JSON.stringify(DEFAULT_BRANDS));
    } else {
      brands = [
        { id: 1, name: "Deli", bangla_name: "ডেলি", logo: "https://images.unsplash.com/photo-1583521214690-73421a1829a9?w=200&auto=format&fit=crop&q=80", description: "আন্তর্জাতিক মানের অফিস ও স্টেশনারি ব্র্যান্ড" },
        { id: 2, name: "Casio", bangla_name: "ক্যাসিও", logo: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=200&auto=format&fit=crop&q=80", description: "অরিজিনাল ক্যালকুলেটর ও টেকনোলজি ব্র্যান্ড" },
        { id: 3, name: "Double A", bangla_name: "ডাবল এ", logo: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=200&auto=format&fit=crop&q=80", description: "প্রিমিয়াম পেপার ও ডকুমেন্ট সমাধান" },
        { id: 4, name: "Kangaro", bangla_name: "ক্যাঙ্গারু", logo: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80", description: "স্ট্যাপলার, পাঞ্চ মেশিন ও হেভি ডিউটি বাইন্ডিং টুলস" },
        { id: 5, name: "Brother", bangla_name: "ব্রাদার", logo: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=200&auto=format&fit=crop&q=80", description: "লেবেল প্রিন্টার ও অফিস টেকনোলজি" },
        { id: 6, name: "Dream Cart BD", bangla_name: "ড্রিম কার্ট সিগনেচার", logo: "https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg", description: "ড্রিম কার্ট নিজস্ব এক্সক্লুসিভ কালেকশন" }
      ];
    }
    localStorage.setItem('dcb_brands', JSON.stringify(brands));
  }
  return brands;
}

function saveBrands(brands) {
  localStorage.setItem('dcb_brands', JSON.stringify(brands));
}

function handleBrandSearch(val) {
  currentBrandSearch = (val || '').toLowerCase().trim();
  renderAdminBrands();
}

// Filter brands by type: all, with_products, without_products
function filterBrandsByType(type) {
  currentBrandFilterType = type;
  document.querySelectorAll('.brand-filter-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`brandFilter_${type}`);
  if (activeBtn) activeBtn.classList.add('active');
  renderAdminBrands();
}

// Switch to products pane and filter by the selected brand
function viewProductsByBrand(brandName) {
  const prodBtn = document.getElementById('sideNav_products');
  switchAdminPane('productsPane', prodBtn);

  currentAdminBrandFilter = brandName;
  const filterSelect = document.getElementById('adminProductBrandFilter');
  if (filterSelect) filterSelect.value = brandName;
  renderProductActiveFilterChips();
  renderAdminProducts();
  showAdminToast(`'${brandName}' ব্র্যান্ডের পণ্য ফিল্টার করা হয়েছে`, 'info');
}

function renderAdminBrands() {
  const brands = getBrands();
  const products = JSON.parse(localStorage.getItem('dcb_products') || '[]');
  const tbody = document.getElementById('adminBrandsTableBody');
  if (!tbody) return;

  let filtered = brands.filter(b => {
    if (!currentBrandSearch) return true;
    return (b.name && b.name.toLowerCase().includes(currentBrandSearch)) ||
           (b.bangla_name && b.bangla_name.toLowerCase().includes(currentBrandSearch)) ||
           (b.description && b.description.toLowerCase().includes(currentBrandSearch));
  });

  // Filter by products attached
  if (currentBrandFilterType === 'with_products') {
    filtered = filtered.filter(b => {
      const count = products.filter(p => p.brand === b.name || p.brand === b.bangla_name).length;
      return count > 0;
    });
  } else if (currentBrandFilterType === 'without_products') {
    filtered = filtered.filter(b => {
      const count = products.filter(p => p.brand === b.name || p.brand === b.bangla_name).length;
      return count === 0;
    });
  }

  // Update brand counter elements
  setElText('brandsCountInTable', filtered.length);
  setElText('sideBrandCount', brands.length);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-muted"><i class="fa-solid fa-tags fa-2x mb-2 text-secondary"></i><br>কোনো ব্র্যান্ড পাওয়া যায়নি।</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(b => {
    const prodCount = products.filter(p => p.brand === b.name || p.brand === b.bangla_name).length;
    const logoImg = b.logo ? `<img src="${b.logo}" alt="${b.name}" style="width: 44px; height: 44px; object-fit: contain; border-radius: 8px; background: #fff; border: 1px solid #e2e8f0; padding: 2px;" onerror="this.src='https://via.placeholder.com/44?text=Brand'">` : `<div style="width: 44px; height: 44px; border-radius: 8px; background: #f8fafc; color: #64748b; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 1px dashed #cbd5e1;"><i class="fa-solid fa-tag text-warning"></i></div>`;

    return `
      <tr>
        <td>${logoImg}</td>
        <td><strong class="text-dark fs-6">${b.name}</strong></td>
        <td><span class="badge bg-light text-dark border">${b.bangla_name || '-'}</span></td>
        <td><small class="text-muted">${b.description || 'কোনো বিবরণ নেই'}</small></td>
        <td>
          <span class="badge bg-warning-subtle text-dark border border-warning px-2 py-1">
            <i class="fa-solid fa-boxes-stacked me-1"></i>${prodCount} টি পণ্য
          </span>
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-info rounded-pill me-1" onclick="viewProductsByBrand('${b.name}')" title="এই ব্র্যান্ডের পণ্যগুলো দেখুন">
            <i class="fa-solid fa-boxes-stacked me-1"></i>পণ্য দেখুন
          </button>
          <button class="btn btn-sm btn-outline-primary rounded-pill me-1" onclick="openEditBrandModal(${b.id})" title="সম্পাদনা">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger rounded-pill" onclick="deleteBrand(${b.id})" title="মুছে ফেলুন">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function populateBrandDropdown(selectedBrand = '') {
  const select = document.getElementById('prodBrand');
  if (!select) return;
  const brands = getBrands();
  let html = `<option value="">-- কোনো ব্র্যান্ড নেই --</option>`;
  brands.forEach(b => {
    const isSel = (selectedBrand && (selectedBrand === b.name || selectedBrand === b.bangla_name)) ? 'selected' : '';
    html += `<option value="${b.name}" ${isSel}>${b.name} (${b.bangla_name || b.name})</option>`;
  });
  select.innerHTML = html;
}

function openAddBrandModal() {
  document.getElementById('brandModalTitle').innerText = 'নতুন ব্র্যান্ড যোগ করুন';
  document.getElementById('adminBrandForm').reset();
  document.getElementById('editBrandId').value = '';
  updateBrandLogoPreview();
  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('adminBrandModal'));
  modal.show();
}

function openEditBrandModal(id) {
  const brands = getBrands();
  const b = brands.find(item => item.id == id);
  if (!b) return;

  document.getElementById('brandModalTitle').innerText = 'ব্র্যান্ড সম্পাদনা করুন';
  document.getElementById('editBrandId').value = b.id;
  document.getElementById('brandName').value = b.name || '';
  document.getElementById('brandBanglaName').value = b.bangla_name || '';
  document.getElementById('brandLogo').value = b.logo || '';
  document.getElementById('brandDescription').value = b.description || '';
  updateBrandLogoPreview();

  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('adminBrandModal'));
  modal.show();
}

// Handle direct logo file upload from device using FileReader
function handleBrandLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const logoInput = document.getElementById('brandLogo');
    if (logoInput) {
      logoInput.value = e.target.result;
      updateBrandLogoPreview();
      showAdminToast('লোগো ফাইল আপলোড সম্পন্ন হয়েছে!', 'success');
    }
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

// Update live logo preview inside Brand Modal
function updateBrandLogoPreview() {
  const container = document.getElementById('brandLogoPreviewContainer');
  const input = document.getElementById('brandLogo');
  if (!container) return;

  const val = input ? input.value.trim() : '';
  if (val) {
    container.innerHTML = `
      <img src="${val}" alt="লোগো প্রিভিউ" style="width: 44px; height: 44px; object-fit: contain; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff;" onerror="this.src='https://via.placeholder.com/44?text=Error'">
      <div class="small text-muted">লোগো প্রিভিউ প্রদর্শিত হচ্ছে</div>
    `;
  } else {
    container.innerHTML = `<span class="text-muted small m-auto">লোগো লিংক দিলে বা আপলোড করলে এখানে প্রিভিউ দেখা যাবে</span>`;
  }
}

function handleBrandFormSubmit(e) {
  e.preventDefault();
  const idVal = document.getElementById('editBrandId').value;
  const name = document.getElementById('brandName').value.trim();
  const bangla_name = document.getElementById('brandBanglaName').value.trim();
  const logo = document.getElementById('brandLogo').value.trim();
  const description = document.getElementById('brandDescription').value.trim();

  if (!name) {
    showAdminToast('ব্র্যান্ডের নাম প্রদান করুন!', 'danger');
    return;
  }

  let brands = getBrands();
  if (idVal) {
    const idx = brands.findIndex(b => b.id == idVal);
    if (idx !== -1) {
      const oldName = brands[idx].name;
      brands[idx].name = name;
      brands[idx].bangla_name = bangla_name;
      brands[idx].logo = logo;
      brands[idx].description = description;

      // Update associated products if brand name changed
      if (oldName !== name) {
        let products = JSON.parse(localStorage.getItem('dcb_products') || '[]');
        products.forEach(p => {
          if (p.brand === oldName) p.brand = name;
        });
        localStorage.setItem('dcb_products', JSON.stringify(products));
      }

      showAdminToast(`'${name}' ব্র্যান্ড তথ্য আপডেট করা হয়েছে!`, 'success');
    }
  } else {
    const newId = brands.length > 0 ? Math.max(...brands.map(b => b.id || 0)) + 1 : 1;
    brands.push({
      id: newId,
      name,
      bangla_name,
      logo,
      description
    });
    showAdminToast(`'${name}' নতুন ব্র্যান্ড সফলভাবে যুক্ত হয়েছে!`, 'success');
  }

  saveBrands(brands);
  renderAdminBrands();
  populateBrandDropdown();
  populateProductBrandFilterDropdown();
  renderAdminProducts();
  updateDashboardStats();

  const modal = bootstrap.Modal.getInstance(document.getElementById('adminBrandModal'));
  if (modal) modal.hide();
}

function deleteBrand(id) {
  const brands = getBrands();
  const brandToDelete = brands.find(b => b.id == id);
  if (!brandToDelete) return;

  const products = JSON.parse(localStorage.getItem('dcb_products') || '[]');
  const count = products.filter(p => p.brand === brandToDelete.name || p.brand === brandToDelete.bangla_name).length;

  let msg = `আপনি কি নিশ্চিত যে '${brandToDelete.name}' ব্র্যান্ডটি মুছে ফেলতে চান?`;
  if (count > 0) {
    msg += `\nসতর্কতা: এই ব্র্যান্ডের সাথে ${count}টি পণ্য সংযুক্ত আছে। ডিলিট করলে পণ্যগুলোর ব্র্যান্ড ফিল্ড খালি হয়ে যাবে।`;
  }

  if (!confirm(msg)) return;

  let updatedBrands = brands.filter(b => b.id != id);
  saveBrands(updatedBrands);

  // Clear brand from linked products
  if (count > 0) {
    products.forEach(p => {
      if (p.brand === brandToDelete.name || p.brand === brandToDelete.bangla_name) {
        p.brand = '';
      }
    });
    localStorage.setItem('dcb_products', JSON.stringify(products));
  }

  renderAdminBrands();
  populateBrandDropdown();
  populateProductBrandFilterDropdown();
  renderAdminProducts();
  updateDashboardStats();
  showAdminToast(`'${brandToDelete.name}' ব্র্যান্ড মুছে ফেলা হয়েছে!`, 'info');
}


// ==================== CATEGORY MANAGEMENT LOGIC (CRUD & FILTERS) ====================

function getCategories() {
  let categories = JSON.parse(localStorage.getItem('dcb_categories') || 'null');
  if (!categories || categories.length === 0) {
    if (typeof DEFAULT_CATEGORIES !== 'undefined' && Array.isArray(DEFAULT_CATEGORIES)) {
      categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
    } else {
      categories = [
        { id: 1, name: "ফাইল ও ফোল্ডার", english_name: "Files & Folders", icon: "fa-solid fa-folder-open", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80", description: "অফিসের জরুরি ডকুমেন্টস ও ফাইল সংরক্ষণের সামগ্রী" },
        { id: 2, name: "ডেস্ক অর্গানাইজার", english_name: "Desk Organizers", icon: "fa-solid fa-boxes-stacked", image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&auto=format&fit=crop&q=80", description: "টেবিল ও ওয়ার্কস্পেস গুছিয়ে রাখার প্রিমিয়াম ট্রয় ও স্ট্যান্ড" },
        { id: 3, name: "কাগজ ও প্রিন্টিং", english_name: "Paper & Printing", icon: "fa-solid fa-print", image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&auto=format&fit=crop&q=80", description: "উচ্চমানের A4, F4 পেপার ও প্রিন্টিং এক্সেসরিজ" },
        { id: 4, name: "খাতা ও নোটপ্যাড", english_name: "Notebooks & Notepads", icon: "fa-solid fa-book-open", image: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=400&auto=format&fit=crop&q=80", description: "অফিস মিটিং, নোট ও হিসাব সংরক্ষণের খাতা" },
        { id: 5, name: "কলম ও মার্কার", english_name: "Pens & Markers", icon: "fa-solid fa-pen-fancy", image: "https://images.unsplash.com/photo-1583521214690-73421a1829a9?w=400&auto=format&fit=crop&q=80", description: "স্মুথ রাইটিং জেল পেন, বলপেন ও হোয়াইটবোর্ড মার্কার" },
        { id: 6, name: "স্টেশনারি টুলস", english_name: "Stationery Tools", icon: "fa-solid fa-scissors", image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&auto=format&fit=crop&q=80", description: "স্ট্যাপলার, পাঞ্চ মেশিন, কাটার ও অফিস অ্যাক্সেসরিজ" },
        { id: 7, name: "ইলেকট্রনিক্স ও হিসাব", english_name: "Electronics & Calculators", icon: "fa-solid fa-calculator", image: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=400&auto=format&fit=crop&q=80", description: "সঠিক হিসাবের জন্য অরিজিনাল ক্যালকুলেটর ও ব্যাটারি" }
      ];
    }
    localStorage.setItem('dcb_categories', JSON.stringify(categories));
  }
  return categories;
}

function saveCategories(categories) {
  localStorage.setItem('dcb_categories', JSON.stringify(categories));
}

function handleCategorySearch(val) {
  currentCategorySearch = (val || '').toLowerCase().trim();
  renderAdminCategories();
}

function filterCategoriesByType(type) {
  currentCategoryFilterType = type;
  document.querySelectorAll('.cat-filter-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`catFilter_${type}`);
  if (activeBtn) activeBtn.classList.add('active');
  renderAdminCategories();
}

function viewProductsByCategory(catName) {
  const prodBtn = document.getElementById('sideNav_products');
  switchAdminPane('productsPane', prodBtn);

  currentAdminCategoryFilter = catName;
  const filterSelect = document.getElementById('adminProductCategoryFilter');
  if (filterSelect) filterSelect.value = catName;
  renderProductActiveFilterChips();
  renderAdminProducts();
  showAdminToast(`'${catName}' ক্যাটাগরির পণ্য ফিল্টার করা হয়েছে`, 'info');
}

function renderAdminCategories() {
  const categories = getCategories();
  const products = JSON.parse(localStorage.getItem('dcb_products') || '[]');
  const tbody = document.getElementById('adminCategoriesTableBody');
  if (!tbody) return;

  let filtered = categories.filter(c => {
    if (!currentCategorySearch) return true;
    return (c.name && c.name.toLowerCase().includes(currentCategorySearch)) ||
           (c.english_name && c.english_name.toLowerCase().includes(currentCategorySearch)) ||
           (c.description && c.description.toLowerCase().includes(currentCategorySearch));
  });

  // Filter by products attached
  if (currentCategoryFilterType === 'with_products') {
    filtered = filtered.filter(c => {
      const count = products.filter(p => p.category === c.name || p.category === c.english_name).length;
      return count > 0;
    });
  } else if (currentCategoryFilterType === 'without_products') {
    filtered = filtered.filter(c => {
      const count = products.filter(p => p.category === c.name || p.category === c.english_name).length;
      return count === 0;
    });
  }

  // Update counters
  setElText('categoriesCountInTable', filtered.length);
  setElText('sideCatCount', categories.length);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-muted"><i class="fa-solid fa-layer-group fa-2x mb-2 text-secondary"></i><br>কোনো ক্যাটাগরি পাওয়া যায়নি।</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(c => {
    const prodCount = products.filter(p => p.category === c.name || p.category === c.english_name).length;
    const iconHtml = c.icon ? `<i class="${c.icon}"></i>` : '<i class="fa-solid fa-layer-group"></i>';
    const visualDisplay = c.image ? `
      <img src="${c.image}" alt="${c.name}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0;" onerror="this.src='https://via.placeholder.com/44?text=Category'">
    ` : `
      <div style="width: 44px; height: 44px; border-radius: 8px; background: #f0f9ff; color: #0284c7; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 1px solid #bae6fd;">
        ${iconHtml}
      </div>
    `;

    return `
      <tr>
        <td>${visualDisplay}</td>
        <td>
          <strong class="text-dark fs-6">${c.name}</strong>
          ${c.icon ? `<small class="text-muted d-block" style="font-size: 11px;"><i class="${c.icon} me-1 text-primary"></i>${c.icon}</small>` : ''}
        </td>
        <td><span class="badge bg-light text-dark border">${c.english_name || '-'}</span></td>
        <td><small class="text-muted">${c.description || 'কোনো বিবরণ নেই'}</small></td>
        <td>
          <span class="badge bg-info-subtle text-info-emphasis border border-info px-2 py-1">
            <i class="fa-solid fa-boxes-stacked me-1"></i>${prodCount} টি পণ্য
          </span>
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-info rounded-pill me-1" onclick="viewProductsByCategory('${c.name}')" title="এই ক্যাটাগরির পণ্যগুলো দেখুন">
            <i class="fa-solid fa-boxes-stacked me-1"></i>পণ্য দেখুন
          </button>
          <button class="btn btn-sm btn-outline-primary rounded-pill me-1" onclick="openEditCategoryModal(${c.id})" title="সম্পাদনা">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger rounded-pill" onclick="deleteCategory(${c.id})" title="মুছে ফেলুন">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function populateCategoryDropdown(selectedCategory = '') {
  const select = document.getElementById('prodCategory');
  if (!select) return;

  const categories = getCategories();
  let html = '';
  categories.forEach(c => {
    const isSel = (selectedCategory && (selectedCategory === c.name || selectedCategory === c.english_name)) ? 'selected' : '';
    html += `<option value="${c.name}" ${isSel}>${c.name} (${c.english_name || c.name})</option>`;
  });
  select.innerHTML = html;
}

function openAddCategoryModal() {
  document.getElementById('categoryModalTitle').innerText = 'নতুন ক্যাটাগরি যোগ করুন';
  document.getElementById('adminCategoryForm').reset();
  document.getElementById('editCategoryId').value = '';
  document.getElementById('catIcon').value = 'fa-solid fa-folder-open';
  updateCatIconPreview();
  updateCatImagePreview();

  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('adminCategoryModal'));
  modal.show();
}

function openEditCategoryModal(id) {
  const categories = getCategories();
  const c = categories.find(item => item.id == id);
  if (!c) return;

  document.getElementById('categoryModalTitle').innerText = 'ক্যাটাগরি সম্পাদনা করুন';
  document.getElementById('editCategoryId').value = c.id;
  document.getElementById('catName').value = c.name || '';
  document.getElementById('catEnglishName').value = c.english_name || '';
  document.getElementById('catIcon').value = c.icon || 'fa-solid fa-layer-group';
  document.getElementById('catImage').value = c.image || '';
  document.getElementById('catDescription').value = c.description || '';

  updateCatIconPreview();
  updateCatImagePreview();

  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('adminCategoryModal'));
  modal.show();
}

function selectCatIcon(iconClass) {
  const input = document.getElementById('catIcon');
  if (input) {
    input.value = iconClass;
    updateCatIconPreview();
  }
}

function updateCatIconPreview() {
  const input = document.getElementById('catIcon');
  const preview = document.getElementById('catIconPreview');
  if (!preview) return;
  const val = input ? input.value.trim() : '';
  preview.innerHTML = `<i class="${val || 'fa-solid fa-layer-group'}"></i>`;
}

function handleCatImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const imgInput = document.getElementById('catImage');
    if (imgInput) {
      imgInput.value = e.target.result;
      updateCatImagePreview();
      showAdminToast('ক্যাটাগরি ছবি আপলোড সফল হয়েছে!', 'success');
    }
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function updateCatImagePreview() {
  const container = document.getElementById('catImagePreviewContainer');
  const input = document.getElementById('catImage');
  if (!container) return;

  const val = input ? input.value.trim() : '';
  if (val) {
    container.innerHTML = `
      <img src="${val}" alt="ক্যাটাগরি প্রিভিউ" style="width: 44px; height: 44px; object-fit: cover; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff;" onerror="this.src='https://via.placeholder.com/44?text=Error'">
      <div class="small text-muted">ক্যাটাগরি ছবি প্রিভিউ প্রদর্শিত হচ্ছে</div>
    `;
  } else {
    container.innerHTML = `<span class="text-muted small m-auto">ছবির লিংক দিলে বা আপলোড করলে এখানে প্রিভিউ দেখা যাবে</span>`;
  }
}

function handleCategoryFormSubmit(e) {
  e.preventDefault();
  const idVal = document.getElementById('editCategoryId').value;
  const name = document.getElementById('catName').value.trim();
  const english_name = document.getElementById('catEnglishName').value.trim();
  const icon = document.getElementById('catIcon').value.trim() || 'fa-solid fa-layer-group';
  const image = document.getElementById('catImage').value.trim();
  const description = document.getElementById('catDescription').value.trim();

  if (!name) {
    showAdminToast('ক্যাটাগরির নাম প্রদান করুন!', 'danger');
    return;
  }

  let categories = getCategories();
  if (idVal) {
    const idx = categories.findIndex(c => c.id == idVal);
    if (idx !== -1) {
      const oldName = categories[idx].name;
      categories[idx].name = name;
      categories[idx].english_name = english_name;
      categories[idx].icon = icon;
      categories[idx].image = image;
      categories[idx].description = description;

      // Update associated products if category name changed
      if (oldName !== name) {
        let products = JSON.parse(localStorage.getItem('dcb_products') || '[]');
        products.forEach(p => {
          if (p.category === oldName) p.category = name;
        });
        localStorage.setItem('dcb_products', JSON.stringify(products));
      }

      showAdminToast(`'${name}' ক্যাটাগরি তথ্য আপডেট করা হয়েছে!`, 'success');
    }
  } else {
    const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id || 0)) + 1 : 1;
    categories.push({
      id: newId,
      name,
      english_name,
      icon,
      image,
      description
    });
    showAdminToast(`'${name}' নতুন ক্যাটাগরি সফলভাবে যুক্ত হয়েছে!`, 'success');
  }

  saveCategories(categories);
  renderAdminCategories();
  populateCategoryDropdown();
  populateProductCategoryFilterDropdown();
  renderAdminProducts();
  updateDashboardStats();

  const modal = bootstrap.Modal.getInstance(document.getElementById('adminCategoryModal'));
  if (modal) modal.hide();
}

function deleteCategory(id) {
  const categories = getCategories();
  const catToDelete = categories.find(c => c.id == id);
  if (!catToDelete) return;

  const products = JSON.parse(localStorage.getItem('dcb_products') || '[]');
  const count = products.filter(p => p.category === catToDelete.name || p.category === catToDelete.english_name).length;

  let msg = `আপনি কি নিশ্চিত যে '${catToDelete.name}' ক্যাটাগরি মুছে ফেলতে চান?`;
  if (count > 0) {
    msg += `\nসতর্কতা: এই ক্যাটাগরির সাথে ${count}টি পণ্য সংযুক্ত আছে। ডিলিট করলে পণ্যগুলোর ক্যাটাগরি 'সাধারণ সামগ্রী' হিসেবে সেট হবে।`;
  }

  if (!confirm(msg)) return;

  let updatedCategories = categories.filter(c => c.id != id);
  saveCategories(updatedCategories);

  // Re-assign category on linked products
  if (count > 0) {
    products.forEach(p => {
      if (p.category === catToDelete.name || p.category === catToDelete.english_name) {
        p.category = 'সাধারণ সামগ্রী';
      }
    });
    localStorage.setItem('dcb_products', JSON.stringify(products));
  }

  renderAdminCategories();
  populateCategoryDropdown();
  populateProductCategoryFilterDropdown();
  renderAdminProducts();
  updateDashboardStats();
  showAdminToast(`'${catToDelete.name}' ক্যাটাগরি মুছে ফেলা হয়েছে!`, 'info');
}
