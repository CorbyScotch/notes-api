const API_URL = "https://notes-api-2sl8.onrender.com";

// ============================================================
// SWITCH BETWEEN LOGIN AND REGISTER TABS
// ============================================================
function switchTab(tab) {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const tabs = document.querySelectorAll(".auth-tab");

  if (tab === "login") {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    tabs[0].classList.add("active");
    tabs[1].classList.remove("active");
  } else {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    tabs[0].classList.remove("active");
    tabs[1].classList.add("active");
  }
}

// ============================================================
// LOGIN
// ============================================================
async function login() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!username || !password) {
    showAuthStatus("login-status", "Please fill in all fields", true);
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Save both tokens to localStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Redirect to notes page
      window.location.href = "notes.html";
    } else {
      showAuthStatus("login-status", data.message, true);
    }
  } catch (error) {
    showAuthStatus("login-status", "Could not connect to server.", true);
  }
}

// ============================================================
// REGISTER
// ============================================================
async function register() {
  const username = document.getElementById("reg-username").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  if (!username || !password) {
    showAuthStatus("register-status", "Please fill in all fields", true);
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      showAuthStatus("register-status", "Account created! Please login.");
      // Switch to login tab after successful register
      setTimeout(() => switchTab("login"), 1500);
    } else {
      showAuthStatus("register-status", data.message, true);
    }
  } catch (error) {
    showAuthStatus("register-status", "Could not connect to server.", true);
  }
}

// ============================================================
// HELPER: show status message
// ============================================================
function showAuthStatus(elementId, message, isError = false) {
  const status = document.getElementById(elementId);
  status.textContent = message;
  status.className = isError ? "error" : "";
  setTimeout(() => (status.textContent = ""), 3000);
}

// ============================================================
// If already logged in, skip to notes page
// ============================================================
if (localStorage.getItem("accessToken")) {
  window.location.href = "notes.html";
}
