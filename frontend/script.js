const API_BASE_URL =
  window.location.protocol === "file:"
    ? "http://localhost:5000"
    : `${window.location.protocol}//${window.location.hostname}:5000`;
const LAPTOPS_URL = `${API_BASE_URL}/api/laptops`;
const CART_URL = `${API_BASE_URL}/api/cart`;
const ORDERS_URL = `${API_BASE_URL}/api/orders`;
const ADMIN_URL = `${API_BASE_URL}/api/admin`;
const SESSION_STORAGE_KEY = "laptop-store-session-id";
const ADMIN_TOKEN_STORAGE_KEY = "laptop-store-admin-token";

const currentPage = document.body.dataset.page || "storefront";
const isAdminPage = currentPage === "admin";
const isProductPage = currentPage === "product";

const laptopList = document.getElementById("laptopList");
const addLaptopBtn = document.getElementById("addLaptop");
const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const cartMessage = document.getElementById("cartMessage");
const applyFiltersBtn = document.getElementById("applyFilters");
const cancelEditBtn = document.getElementById("cancelEdit");
const footerYearEl = document.getElementById("footerYear");
const footerDateEl = document.getElementById("footerDate");
const adminLoginWrap = document.getElementById("adminLoginWrap");
const adminShell = document.getElementById("adminShell");
const adminPasswordEl = document.getElementById("adminPassword");
const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminLoginMessage = document.getElementById("adminLoginMessage");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");
const orderList = document.getElementById("orderList");
const customerFullNameEl = document.getElementById("customerFullName");
const customerEmailEl = document.getElementById("customerEmail");
const customerPhoneEl = document.getElementById("customerPhone");
const customerAddressEl = document.getElementById("customerAddress");
const productDetail = document.getElementById("productDetail");
const toastRegion = document.getElementById("toastRegion");
const adminGridViewBtn = document.getElementById("adminGridViewBtn");
const adminListViewBtn = document.getElementById("adminListViewBtn");

const sessionId = getSessionId();

function getSessionId() {
  const existing = localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const generated =
    window.crypto?.randomUUID?.() || `session-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  localStorage.setItem(SESSION_STORAGE_KEY, generated);
  return generated;
}

function getAdminToken() {
  return sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || "";
}

function setAdminToken(token) {
  if (token) {
    sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
  } else {
    sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
  }
}

function updateFooterDate() {
  const now = new Date();

  if (footerYearEl) {
    footerYearEl.textContent = String(now.getFullYear());
  }

  if (footerDateEl) {
    footerDateEl.textContent = now.toLocaleDateString(undefined, {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
}

function showToast(message, variant = "default") {
  if (!toastRegion) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = `toast ${variant !== "default" ? `toast-${variant}` : ""}`.trim();
  toast.textContent = message;
  toastRegion.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("is-visible"));

  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 220);
  }, 2400);
}

async function apiFetch(url, options = {}) {
  const adminToken = getAdminToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      "x-session-id": sessionId,
      ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data;
}

function setAdminUiAuthenticated(isAuthenticated) {
  if (adminLoginWrap) {
    adminLoginWrap.hidden = isAuthenticated;
  }

  if (adminShell) {
    adminShell.hidden = !isAuthenticated;
  }

  if (adminLogoutBtn) {
    adminLogoutBtn.hidden = !isAuthenticated;
  }
}

async function verifyAdminSession() {
  if (!isAdminPage) {
    return true;
  }

  const token = getAdminToken();
  if (!token) {
    setAdminUiAuthenticated(false);
    return false;
  }

  try {
    await apiFetch(`${ADMIN_URL}/session`);
    setAdminUiAuthenticated(true);
    return true;
  } catch {
    setAdminToken("");
    setAdminUiAuthenticated(false);
    return false;
  }
}

function buildLaptopQueryString() {
  const searchEl = document.getElementById("search");
  const filterBrandEl = document.getElementById("filterBrand");
  const filterCategoryEl = document.getElementById("filterCategory");
  const minPriceEl = document.getElementById("minPrice");
  const maxPriceEl = document.getElementById("maxPrice");
  const sortEl = document.getElementById("sort");
  const orderEl = document.getElementById("order");
  const inStockEl = document.getElementById("inStock");

  if (!searchEl || !filterBrandEl || !filterCategoryEl || !minPriceEl || !maxPriceEl || !sortEl || !orderEl || !inStockEl) {
    return "";
  }

  const params = new URLSearchParams();
  const values = {
    q: searchEl.value.trim(),
    brand: filterBrandEl.value.trim(),
    category: filterCategoryEl.value,
    minPrice: minPriceEl.value,
    maxPrice: maxPriceEl.value,
    sort: sortEl.value,
    order: orderEl.value,
    inStock: inStockEl.checked,
  };

  Object.entries(values).forEach(([key, value]) => {
    if (value !== "" && value !== false) {
      params.set(key, value);
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}

function buildLaptopCardMarkup(laptop) {
  const imageURL = laptop.image ? `${API_BASE_URL}${laptop.image}` : "https://via.placeholder.com/250x150";
  const stockClass = laptop.quantity === 0 ? "stock-empty" : laptop.quantity <= 3 ? "stock-low" : "";

  return `
    <a class="product-link" href="product.html?id=${encodeURIComponent(laptop._id)}">
      <img src="${imageURL}" alt="${laptop.title}">
    </a>
    <a class="product-link product-title" href="product.html?id=${encodeURIComponent(laptop._id)}">${laptop.title}</a>
    <div class="specs">${laptop.brand} • ${capitalize(laptop.category)} • ${laptop.processor}</div>
    <div class="price-badge">$${laptop.price}</div>
    <div class="quantity ${stockClass}">Stock: ${laptop.quantity}</div>
    <div class="specs">${laptop.ramGb}GB RAM • ${laptop.storageGb}GB Storage</div>
    <p>${laptop.description}</p>
    ${
      isAdminPage
        ? `
          <button class="edit">Edit</button>
          <button class="delete">Delete</button>
          <button class="update">Restock +1</button>
        `
        : `
          <button class="cart" ${laptop.quantity === 0 ? "disabled" : ""}>Add to Cart</button>
          <a class="ghost-link" href="product.html?id=${encodeURIComponent(laptop._id)}">View Details</a>
        `
    }
  `;
}

async function fetchLaptops() {
  if (!laptopList) {
    return;
  }

  try {
    const data = await apiFetch(`${LAPTOPS_URL}${buildLaptopQueryString()}`);
    laptopList.innerHTML = "";

    if (data.length === 0) {
      laptopList.innerHTML = "<li class='empty-state'>No laptops match the current filters.</li>";
      return;
    }

    data.forEach((laptop) => {
      const li = document.createElement("li");
      li.innerHTML = buildLaptopCardMarkup(laptop);

      if (isAdminPage) {
        li.querySelector(".edit").addEventListener("click", () => startEditLaptop(laptop));
        li.querySelector(".delete").addEventListener("click", () => deleteLaptop(laptop._id));
        li.querySelector(".update").addEventListener("click", () => updateLaptop(laptop._id));
      } else {
        li.querySelector(".cart").addEventListener("click", () => addToCart(laptop._id));
      }

      laptopList.appendChild(li);
    });
  } catch (error) {
    laptopList.innerHTML = `<li class="empty-state">${error.message}</li>`;
  }
}

function resetForm() {
  if (!addLaptopBtn || !cancelEditBtn) {
    return;
  }

  const ids = [
    "editingLaptopId",
    "title",
    "brand",
    "category",
    "processor",
    "price",
    "quantity",
    "ramGb",
    "storageGb",
    "description",
    "image",
  ];

  ids.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.value = "";
    }
  });

  addLaptopBtn.textContent = "Add Laptop";
  cancelEditBtn.hidden = true;
}

function startEditLaptop(laptop) {
  if (!addLaptopBtn || !cancelEditBtn) {
    return;
  }

  document.getElementById("editingLaptopId").value = laptop._id;
  document.getElementById("title").value = laptop.title;
  document.getElementById("brand").value = laptop.brand;
  document.getElementById("category").value = laptop.category;
  document.getElementById("processor").value = laptop.processor;
  document.getElementById("price").value = laptop.price;
  document.getElementById("quantity").value = laptop.quantity;
  document.getElementById("ramGb").value = laptop.ramGb;
  document.getElementById("storageGb").value = laptop.storageGb;
  document.getElementById("description").value = laptop.description;

  addLaptopBtn.textContent = "Save Changes";
  cancelEditBtn.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

if (addLaptopBtn) {
  addLaptopBtn.addEventListener("click", async () => {
    const title = document.getElementById("title").value.trim();
    const brand = document.getElementById("brand").value.trim();
    const category = document.getElementById("category").value;
    const processor = document.getElementById("processor").value.trim();
    const price = parseFloat(document.getElementById("price").value);
    const quantity = parseInt(document.getElementById("quantity").value, 10) || 1;
    const ramGb = parseInt(document.getElementById("ramGb").value, 10);
    const storageGb = parseInt(document.getElementById("storageGb").value, 10);
    const description = document.getElementById("description").value.trim();
    const imageFile = document.getElementById("image").files[0];
    const editingLaptopId = document.getElementById("editingLaptopId").value;

    if (!title || !brand || !category || !processor || Number.isNaN(price) || Number.isNaN(ramGb) || Number.isNaN(storageGb)) {
      showToast("Complete all required product fields.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("brand", brand);
    formData.append("category", category);
    formData.append("processor", processor);
    formData.append("price", price);
    formData.append("quantity", quantity);
    formData.append("ramGb", ramGb);
    formData.append("storageGb", storageGb);
    formData.append("description", description);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      if (editingLaptopId) {
        await apiFetch(`${LAPTOPS_URL}/${editingLaptopId}`, {
          method: "PUT",
          body: formData,
        });
        showToast("Product updated", "success");
      } else {
        await apiFetch(LAPTOPS_URL, {
          method: "POST",
          body: formData,
        });
        showToast("Product created", "success");
      }

      resetForm();
      await fetchLaptops();
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

async function deleteLaptop(id) {
  if (!window.confirm("Delete this product from the catalog?")) {
    return;
  }

  try {
    await apiFetch(`${LAPTOPS_URL}/${id}`, { method: "DELETE" });
    showToast("Product deleted", "success");
    await fetchLaptops();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function updateLaptop(id) {
  try {
    const laptop = await apiFetch(`${LAPTOPS_URL}/${id}`);
    await apiFetch(`${LAPTOPS_URL}/${id}`, {
      method: "PUT",
      body: (() => {
        const formData = new FormData();
        formData.append("quantity", laptop.quantity + 1);
        return formData;
      })(),
    });
    showToast("Stock updated", "success");
    await fetchLaptops();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function addToCart(laptopId) {
  try {
    await apiFetch(`${CART_URL}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ laptopId, quantity: 1 }),
    });
    if (cartMessage) {
      cartMessage.textContent = "Item added to cart.";
    }
    showToast("Item added to cart", "success");
    await loadCart();
  } catch (error) {
    if (cartMessage) {
      cartMessage.textContent = error.message;
    }
    showToast(error.message, "error");
  }
}

function renderCart(cart) {
  if (!cartList || !cartTotal) {
    return;
  }

  cartList.innerHTML = "";

  if (cart.items.length === 0) {
    cartList.innerHTML = "<li class='empty-cart'>Your cart is empty.</li>";
    cartTotal.textContent = "0.00";
    return;
  }

  cart.items.forEach((item) => {
    const li = document.createElement("li");
    const imageURL = item.image ? `${API_BASE_URL}${item.image}` : "https://via.placeholder.com/50";
    li.innerHTML = `
      <img src="${imageURL}" alt="${item.title}">
      <div class="cart-item-details">
        <strong>${item.title}</strong>
        <span>Unit price: $${item.price}</span>
        <span>Qty: ${item.quantity} • Line total: $${item.lineTotal}</span>
      </div>
      <div class="cart-item-actions">
        <button class="decrease">-</button>
        <button class="increase">+</button>
        <button class="remove">Remove</button>
      </div>
    `;
    li.querySelector(".decrease").addEventListener("click", () => updateCartItem(item, item.quantity - 1));
    li.querySelector(".increase").addEventListener("click", () => updateCartItem(item, item.quantity + 1));
    li.querySelector(".remove").addEventListener("click", () => removeFromCart(item.itemId));
    cartList.appendChild(li);
  });

  cartTotal.textContent = cart.total.toFixed(2);
}

async function loadCart() {
  if (!cartList || !cartTotal) {
    return;
  }

  try {
    const cart = await apiFetch(CART_URL);
    renderCart(cart);
  } catch (error) {
    if (cartMessage) {
      cartMessage.textContent = error.message;
    }
  }
}

async function updateCartItem(item, quantity) {
  if (quantity < 1) {
    await removeFromCart(item.itemId);
    return;
  }

  try {
    await apiFetch(`${CART_URL}/items/${item.itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    if (cartMessage) {
      cartMessage.textContent = "";
    }
    await loadCart();
    if (!isProductPage) {
      await fetchLaptops();
    }
  } catch (error) {
    if (cartMessage) {
      cartMessage.textContent = error.message;
    }
    showToast(error.message, "error");
  }
}

async function removeFromCart(itemId) {
  try {
    await apiFetch(`${CART_URL}/items/${itemId}`, { method: "DELETE" });
    if (cartMessage) {
      cartMessage.textContent = "";
    }
    await loadCart();
  } catch (error) {
    if (cartMessage) {
      cartMessage.textContent = error.message;
    }
    showToast(error.message, "error");
  }
}

function buildCustomerPayload() {
  if (!customerFullNameEl || !customerEmailEl || !customerPhoneEl || !customerAddressEl) {
    return null;
  }

  return {
    fullName: customerFullNameEl.value.trim(),
    email: customerEmailEl.value.trim(),
    phone: customerPhoneEl.value.trim(),
    address: customerAddressEl.value.trim(),
  };
}

function clearCheckoutFields() {
  if (customerFullNameEl) customerFullNameEl.value = "";
  if (customerEmailEl) customerEmailEl.value = "";
  if (customerPhoneEl) customerPhoneEl.value = "";
  if (customerAddressEl) customerAddressEl.value = "";
}

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", async () => {
    try {
      const customer = buildCustomerPayload();
      const order = await apiFetch(`${ORDERS_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer }),
      });
      if (cartMessage) {
        cartMessage.textContent = `Order ${order.orderId} placed. Total: $${order.total.toFixed(2)}`;
      }
      clearCheckoutFields();
      await loadCart();
      await loadOrders();
      if (!isProductPage) {
        await fetchLaptops();
      }
      showToast("Checkout successful", "success");
    } catch (error) {
      if (cartMessage) {
        cartMessage.textContent = error.message;
      }
      showToast(error.message, "error");
    }
  });
}

function renderOrders(orders) {
  if (!orderList) {
    return;
  }

  orderList.innerHTML = "";

  if (orders.length === 0) {
    orderList.innerHTML = "<li class='empty-state'>No orders yet for this session.</li>";
    return;
  }

  orders.forEach((order) => {
    const li = document.createElement("li");
    li.className = "order-item";
    li.innerHTML = `
      <div>
        <strong>Order ${String(order._id || order.orderId || "").slice(-6)}</strong>
        <div class="specs">${order.customer?.fullName || "Customer"} • ${new Date(order.createdAt).toLocaleString()}</div>
      </div>
      <div class="order-meta">
        <span>${order.items.length} item(s)</span>
        <strong>$${Number(order.total).toFixed(2)}</strong>
      </div>
    `;
    orderList.appendChild(li);
  });
}

async function loadOrders() {
  if (!orderList) {
    return;
  }

  try {
    const orders = await apiFetch(ORDERS_URL);
    renderOrders(orders);
  } catch (error) {
    orderList.innerHTML = `<li class="empty-state">${error.message}</li>`;
  }
}

async function loadProductDetail() {
  if (!productDetail) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    productDetail.innerHTML = "<p class='empty-state'>Missing product id.</p>";
    return;
  }

  try {
    const laptop = await apiFetch(`${LAPTOPS_URL}/${id}`);
    const imageURL = laptop.image ? `${API_BASE_URL}${laptop.image}` : "https://via.placeholder.com/420x280";
    productDetail.innerHTML = `
      <div class="product-detail-media">
        <img src="${imageURL}" alt="${laptop.title}">
      </div>
      <div class="product-detail-copy">
        <span class="hero-kicker">${capitalize(laptop.category)}</span>
        <h2>${laptop.title}</h2>
        <div class="specs">${laptop.brand} • ${laptop.processor}</div>
        <div class="price-badge">$${laptop.price}</div>
        <div class="product-spec-grid">
          <div><span>RAM</span><strong>${laptop.ramGb}GB</strong></div>
          <div><span>Storage</span><strong>${laptop.storageGb}GB</strong></div>
          <div><span>Stock</span><strong>${laptop.quantity}</strong></div>
        </div>
        <p>${laptop.description}</p>
        <div class="product-detail-actions">
          <button class="cart" id="productAddToCartBtn" ${laptop.quantity === 0 ? "disabled" : ""}>Add to Cart</button>
          <a class="ghost-link" href="index.html">Back to Storefront</a>
        </div>
      </div>
    `;

    const addBtn = document.getElementById("productAddToCartBtn");
    if (addBtn) {
      addBtn.addEventListener("click", () => addToCart(laptop._id));
    }
  } catch (error) {
    productDetail.innerHTML = `<p class="empty-state">${error.message}</p>`;
  }
}

if (applyFiltersBtn) {
  applyFiltersBtn.addEventListener("click", fetchLaptops);
}

if (cancelEditBtn) {
  cancelEditBtn.addEventListener("click", resetForm);
}

if (adminLoginBtn) {
  adminLoginBtn.addEventListener("click", async () => {
    const password = adminPasswordEl?.value || "";

    if (!password) {
      if (adminLoginMessage) {
        adminLoginMessage.textContent = "Enter the admin password.";
      }
      return;
    }

    try {
      const response = await fetch(`${ADMIN_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Login failed");
      }

      setAdminToken(data.token);
      if (adminPasswordEl) adminPasswordEl.value = "";
      if (adminLoginMessage) adminLoginMessage.textContent = "";
      setAdminUiAuthenticated(true);
      showToast("Admin unlocked", "success");
      await fetchLaptops();
    } catch (error) {
      if (adminLoginMessage) {
        adminLoginMessage.textContent = error.message;
      }
      setAdminUiAuthenticated(false);
      showToast(error.message, "error");
    }
  });
}

if (adminLogoutBtn) {
  adminLogoutBtn.addEventListener("click", () => {
    setAdminToken("");
    setAdminUiAuthenticated(false);
    if (adminLoginMessage) {
      adminLoginMessage.textContent = "";
    }
    showToast("Admin logged out");
  });
}

if (adminGridViewBtn && adminListViewBtn && laptopList) {
  adminGridViewBtn.addEventListener("click", () => {
    laptopList.classList.remove("list-view");
    adminGridViewBtn.classList.add("is-active");
    adminListViewBtn.classList.remove("is-active");
  });

  adminListViewBtn.addEventListener("click", () => {
    laptopList.classList.add("list-view");
    adminListViewBtn.classList.add("is-active");
    adminGridViewBtn.classList.remove("is-active");
  });
}

updateFooterDate();

verifyAdminSession().then(async (authenticated) => {
  if (!isAdminPage || authenticated) {
    await fetchLaptops();
  }
});

if (!isAdminPage && !isProductPage) {
  loadCart();
  loadOrders();
}

if (isProductPage) {
  loadProductDetail();
  loadOrders();
}
