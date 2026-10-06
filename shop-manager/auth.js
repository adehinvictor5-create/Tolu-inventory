function loadUsers() {
  const stored = localStorage.getItem("users");
  return stored ? JSON.parse(stored) : [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getCurrentUser() {
  const stored = localStorage.getItem("currentUser");
  return stored ? JSON.parse(stored) : null;
}

function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(str) {
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
}

async function hashPassword(password, saltBytes) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return bytesToBase64(new Uint8Array(bits));
}

// sign up / log in 
async function signUp(name, email, password) {
  const users = loadUsers();

  if (users.some((u) => u.email === email)) {
    return { ok: false, message: "An account with that email already exists." };
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordHash = await hashPassword(password, salt);

  // The first account becomes admin. Everyone after is a cashier.
  const role = users.length === 0 ? "admin" : "cashier";

  users.push({ name, email, role, salt: bytesToBase64(salt), passwordHash });
  saveUsers(users);
  setCurrentUser({ name, email, role });
  return { ok: true };
}

async function logIn(email, password) {
  const user = loadUsers().find((u) => u.email === email);
  if (!user) {
    return { ok: false, message: "Wrong email or password." };
  }

  const hash = await hashPassword(password, base64ToBytes(user.salt));
  if (hash !== user.passwordHash) {
    return { ok: false, message: "Wrong email or password." };
  }

  setCurrentUser({ name: user.name, email: user.email, role: user.role });
  return { ok: true };
}

// ---------- page protection (authorization) ----------
function requireLogin() {
  if (!getCurrentUser()) {
    window.location.href = "login.html";
  }
}

function requireRole(...allowedRoles) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
  } else if (!allowedRoles.includes(user.role)) {
    alert("You don't have permission to view this page.");
    window.location.href = "index.html";
  }
}

// ---------- show/hide password (used by both pages) ----------
document.querySelectorAll(".toggle-password").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    const label = btn.querySelector(".toggle-text");
    const isHidden = input.type === "password";

    input.type = isHidden ? "text" : "password";
    label.textContent = isHidden ? "Hide" : "Show";
  });
});
