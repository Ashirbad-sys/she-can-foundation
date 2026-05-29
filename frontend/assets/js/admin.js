// Admin Panel JavaScript — She Can Foundation

const ADMIN_PASSWORD = "shecan2025"; // change this to your preferred password
const API_BASE = "/api"; // uses relative path since frontend is served from Express

let allData = [];

/* ══════════════════════════════════════
   LOGIN
══════════════════════════════════════ */
const loginScreen = document.getElementById("loginScreen");
const adminPanel  = document.getElementById("adminPanel");
const loginError  = document.getElementById("loginError");

// Check if already logged in
if (sessionStorage.getItem("adminLoggedIn") === "true") {
  showAdminPanel();
}

document.getElementById("loginBtn").addEventListener("click", () => {
  const password = document.getElementById("passwordInput").value;

  if (!password) {
    loginError.textContent = "Please enter the password.";
    loginError.classList.add("visible");
    return;
  }

  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem("adminLoggedIn", "true");
    showAdminPanel();
  } else {
    loginError.textContent = "Incorrect password. Try again.";
    loginError.classList.add("visible");
    document.getElementById("passwordInput").value = "";
  }
});

// Allow pressing Enter to login
document.getElementById("passwordInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("loginBtn").click();
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem("adminLoggedIn");
  adminPanel.setAttribute("hidden", "");
  loginScreen.style.display = "flex";
});

function showAdminPanel() {
  loginScreen.style.display = "none";
  adminPanel.removeAttribute("hidden");
  loadSubmissions();
}

/* ══════════════════════════════════════
   LOAD SUBMISSIONS
══════════════════════════════════════ */
async function loadSubmissions() {
  try {
    const res  = await fetch(`${API_BASE}/contact`);
    const json = await res.json();

    if (!json.success) throw new Error("Failed to fetch");

    allData = json.data;
    renderTable(allData);
    updateStats(allData);

  } catch (err) {
    document.getElementById("submissionsBody").innerHTML =
      `<tr><td colspan="6" class="loading">❌ Could not load submissions. Is the backend running?</td></tr>`;
  }
}

/* ══════════════════════════════════════
   RENDER TABLE
══════════════════════════════════════ */
function renderTable(data) {
  const tbody = document.getElementById("submissionsBody");

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="loading">No submissions yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((row, index) => `
    <tr id="row-${row.id}">
      <td>${index + 1}</td>
      <td><strong>${escapeHTML(row.full_name)}</strong></td>
      <td class="td-email">${escapeHTML(row.email)}</td>
      <td class="td-msg">${escapeHTML(truncate(row.message, 80))}</td>
      <td class="td-date">${formatDate(row.created_at)}</td>
      <td>
        <button class="btn-delete" onclick="deleteRow(${row.id})">🗑 Delete</button>
      </td>
    </tr>
  `).join("");
}

/* ══════════════════════════════════════
   UPDATE STATS
══════════════════════════════════════ */
function updateStats(data) {
  document.getElementById("totalCount").textContent = data.length;

  const today      = new Date().toLocaleDateString("en-CA");
  const todayCount = data.filter(r => r.created_at?.startsWith(today)).length;
  document.getElementById("todayCount").textContent = todayCount;

  document.getElementById("latestEmail").textContent =
    data.length > 0 ? data[0].email : "—";
}

/* ══════════════════════════════════════
   DELETE
══════════════════════════════════════ */
async function deleteRow(id) {
  if (!confirm("Delete this submission? This cannot be undone.")) return;

  try {
    const res  = await fetch(`${API_BASE}/contact/${id}`, { method: "DELETE" });
    const json = await res.json();

    if (json.success) {
      document.getElementById(`row-${id}`)?.remove();
      allData = allData.filter(r => r.id !== id);
      updateStats(allData);
    }
  } catch (err) {
    alert("Could not delete. Please try again.");
  }
}

/* ══════════════════════════════════════
   SEARCH
══════════════════════════════════════ */
document.getElementById("searchInput").addEventListener("input", (e) => {
  const q        = e.target.value.toLowerCase();
  const filtered = allData.filter(r =>
    r.full_name.toLowerCase().includes(q) ||
    r.email.toLowerCase().includes(q) ||
    r.message.toLowerCase().includes(q)
  );
  renderTable(filtered);
});

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
function escapeHTML(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function truncate(str, len) {
  return str.length > len ? str.slice(0, len) + "…" : str;
}

function formatDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

// Expose for inline onclick
window.deleteRow = deleteRow;