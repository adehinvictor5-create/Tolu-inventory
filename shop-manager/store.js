// store.js - shared product/sales storage and helpers (admin + cashier use this)

function load(key, fallback) {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch (e) {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadProducts() {
  let p = load("products", null);
  if (!p) {
    p = [
      { id: 1, name: "Rice 5kg", price: 4000, stock: 12, threshold: 5 },
      { id: 2, name: "Detergent", price: 1500, stock: 3, threshold: 5 },
      { id: 3, name: "Cooking Oil 1L", price: 2200, stock: 20, threshold: 5 },
      { id: 4, name: "Bread", price: 800, stock: 0, threshold: 5 },
    ];
    save("products", p);
  }
  return p;
}
function saveProducts(p) { save("products", p); }
function loadSales() { return load("sales", []); }
function saveSales(s) { save("sales", s); }

function formatNaira(n) { return "₦" + Number(n).toLocaleString(); }

// Stops user-typed text from being run as HTML
function esc(str) {
  return String(str).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function stockStatus(p) {
  if (p.stock === 0) return { label: "Out of stock", cls: "status-out" };
  if (p.stock <= p.threshold) return { label: "Low stock", cls: "status-low" };
  return { label: "In stock", cls: "status-ok" };
}

function isToday(iso) { return new Date(iso).toDateString() === new Date().toDateString(); }

function saleItemsText(s) { return s.items.map((i) => `${esc(i.name)} x${i.qty}`).join(", "); }
