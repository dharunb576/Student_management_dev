const API_URL = 'http://localhost:3000';

function getToken() { return localStorage.getItem('token'); }
function getUser()  { return JSON.parse(localStorage.getItem('user') || 'null'); }

function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function requireAuth() {
  if (!getToken()) { window.location.href = 'index.html'; return; }
}

function logout() {
  clearAuth();
  window.location.href = 'index.html';
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(API_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

function showAlert(id, message, type = 'success') {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `alert alert-${type} show`;
  el.textContent = message;
  setTimeout(() => el.classList.remove('show'), 4000);
}

function renderUserInfo() {
  const user = getUser();
  if (!user) return;
  const nameEl   = document.getElementById('userName');
  const roleEl   = document.getElementById('userRole');
  const avatarEl = document.getElementById('userAvatar');
  if (nameEl)   nameEl.textContent   = user.name;
  if (roleEl)   roleEl.textContent   = user.role;
  if (avatarEl) avatarEl.textContent = user.name?.charAt(0).toUpperCase();
}

// ✅ ROLE BASED PERMISSIONS
function canDo(action) {
  const role = getUser()?.role;
  const perms = {
    admin:   ['view', 'create', 'edit', 'delete', 'enroll', 'status'],
    teacher: ['view', 'create', 'edit', 'enroll', 'status'],
    student: ['view'],
  };
  return perms[role]?.includes(action) ?? false;
}

// ✅ RESTRICT PAGE ACCESS BY ROLE
function restrictPage(allowedRoles) {
  const role = getUser()?.role;
  if (!allowedRoles.includes(role)) {
    document.body.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#f1f5f9">
        <div style="background:white;padding:40px;border-radius:12px;text-align:center;box-shadow:0 4px 16px rgba(0,0,0,0.1)">
          <div style="font-size:48px;margin-bottom:16px">🚫</div>
          <h2 style="margin-bottom:8px;color:#0f172a">Access Denied</h2>
          <p style="color:#64748b;margin-bottom:24px">You don't have permission to view this page.</p>
          <a href="dashboard.html" style="background:#2563eb;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:500">Go to Dashboard</a>
        </div>
      </div>`;
  }
}

function openModal(id) {
  document.getElementById(id)?.classList.add('active');
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('active');
  const form = document.querySelector(`#${id} form`);
  if (form) form.reset();
}