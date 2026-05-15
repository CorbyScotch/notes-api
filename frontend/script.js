const API_URL = "https://notes-api-2sl8.onrender.com";

// ============================================================
// REDIRECT TO LOGIN IF NOT LOGGED IN
// ============================================================
if (!localStorage.getItem("accessToken")) {
  window.location.href = "index.html";
}

// ============================================================
// LOGOUT
// ============================================================
async function logout() {
  try {
    await fetchWithAuth(`${API_URL}/auth/logout`, { method: "POST" });
  } catch (error) {
    // Even if server logout fails, clear tokens locally
  }
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "index.html";
}

// ============================================================
// FETCH WITH AUTH — attaches token to every request
// and automatically refreshes if token is expired
// ============================================================
async function fetchWithAuth(url, options = {}) {
  const accessToken = localStorage.getItem("accessToken");

  // Attach the token to the request headers
  options.headers = {
    ...options.headers,
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  let response = await fetch(url, options);

  // If 401 — token might be expired, try refreshing
  if (response.status === 401) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      // Retry the original request with the new token
      options.headers.Authorization = `Bearer ${newToken}`;
      response = await fetch(url, options);
    } else {
      // Refresh failed — send user back to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "index.html";
    }
  }

  return response;
}

// ============================================================
// REFRESH ACCESS TOKEN
// ============================================================
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken);
      return data.accessToken;
    }

    return null;
  } catch (error) {
    return null;
  }
}

// ============================================================
// FETCH ALL NOTES  →  GET /notes
// ============================================================
async function loadNotes() {
  try {
    const response = await fetchWithAuth(`${API_URL}/notes`);
    const notes = await response.json();
    displayNotes(notes);
  } catch (error) {
    document.getElementById("notes-list").innerHTML =
      '<div class="empty-state">⚠️ Could not connect to server.</div>';
  }
}

// ============================================================
// DISPLAY NOTES ON THE PAGE
// ============================================================
function displayNotes(notes) {
  const container = document.getElementById("notes-list");

  if (notes.length === 0) {
    container.innerHTML =
      '<div class="empty-state">No notes yet. Write one above!</div>';
    return;
  }

  container.innerHTML = notes
    .map(
      (note) => `
        <div class="note-item" id="note-${note._id}">
          <div style="flex:1">
            <p style="font-weight:700; font-size:1rem; margin-bottom:6px;">${note.title}</p>
            <p class="note-text" style="color:#aaa;">${note.content}</p>
          </div>
          <button class="btn-delete" onclick="deleteNote('${note._id}')">Delete</button>
        </div>
      `,
    )
    .join("");
}

// ============================================================
// CREATE A NOTE  →  POST /notes
// ============================================================
async function createNote() {
  const titleInput = document.getElementById("note-title");
  const contentInput = document.getElementById("note-input");
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) {
    showStatus("Both title and content are required!", true);
    return;
  }

  try {
    const response = await fetchWithAuth(`${API_URL}/notes`, {
      method: "POST",
      body: JSON.stringify({ title, content }),
    });

    if (response.ok) {
      titleInput.value = "";
      contentInput.value = "";
      showStatus("Note saved!");
      loadNotes();
    } else {
      const data = await response.json();
      showStatus(data.message || "Could not save note.", true);
    }
  } catch (error) {
    showStatus("Could not connect to server.", true);
  }
}

// ============================================================
// DELETE A NOTE  →  DELETE /notes/:id
// ============================================================
async function deleteNote(id) {
  try {
    const response = await fetchWithAuth(`${API_URL}/notes/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      const noteCard = document.getElementById(`note-${id}`);
      noteCard.remove();

      const container = document.getElementById("notes-list");
      if (container.children.length === 0) {
        container.innerHTML =
          '<div class="empty-state">No notes yet. Write one above!</div>';
      }
    } else {
      alert("Could not delete note.");
    }
  } catch (error) {
    alert("Could not connect to server.");
  }
}

// ============================================================
// HELPER: Show a status message below the form
// ============================================================
function showStatus(message, isError = false) {
  const status = document.getElementById("status");
  status.textContent = message;
  status.className = isError ? "error" : "";
  setTimeout(() => {
    status.textContent = "";
  }, 3000);
}

// ============================================================
// Run loadNotes() as soon as the page opens
// ============================================================
loadNotes();
