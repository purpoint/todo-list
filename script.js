const authView = document.getElementById("auth-view");
const authForm = document.getElementById("auth-form");
const authUsername = document.getElementById("auth-username");
const authPassword = document.getElementById("auth-password");
const authSubmit = document.getElementById("auth-submit");
const authError = document.getElementById("auth-error");
const authToggle = document.getElementById("auth-toggle");
const authSwitchText = document.getElementById("auth-switch-text");

const todoView = document.getElementById("todo-view");
const userName = document.getElementById("user-name");
const signOutBtn = document.getElementById("sign-out");
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");

// ---- Auth ----
// Demo-grade auth: accounts live in this browser's localStorage only.
let authMode = "signin";
let currentUser = localStorage.getItem("session");

function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "{}");
}

function toHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(new Uint8Array(digest));
}

function showAuthError(message) {
  authError.textContent = message;
  authError.hidden = false;
}

function setAuthMode(mode) {
  authMode = mode;
  authError.hidden = true;
  authSubmit.textContent = mode === "signin" ? "Sign in" : "Sign up";
  authSwitchText.textContent = mode === "signin" ? "No account?" : "Have an account?";
  authToggle.textContent = mode === "signin" ? "Sign up" : "Sign in";
  authPassword.autocomplete = mode === "signin" ? "current-password" : "new-password";
}

authToggle.addEventListener("click", () => {
  setAuthMode(authMode === "signin" ? "signup" : "signin");
});

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = authUsername.value.trim();
  const password = authPassword.value;
  if (!username || !password) return;

  const users = getUsers();

  if (authMode === "signup") {
    if (users[username]) {
      showAuthError("That username is already taken.");
      return;
    }
    const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
    users[username] = { salt, hash: await hashPassword(password, salt) };
    localStorage.setItem("users", JSON.stringify(users));
  } else {
    const user = users[username];
    if (!user || (await hashPassword(password, user.salt)) !== user.hash) {
      showAuthError("Wrong username or password.");
      return;
    }
  }

  currentUser = username;
  localStorage.setItem("session", username);
  authForm.reset();
  setAuthMode("signin");
  render();
});

signOutBtn.addEventListener("click", () => {
  currentUser = null;
  localStorage.removeItem("session");
  render();
});

// ---- Todos ----
function todosKey() {
  return `todos:${currentUser}`;
}

function getTodos() {
  return JSON.parse(localStorage.getItem(todosKey()) || "[]");
}

function saveTodos(todos) {
  localStorage.setItem(todosKey(), JSON.stringify(todos));
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  const todos = getTodos();
  todos.push({ text, done: false });
  saveTodos(todos);
  input.value = "";
  render();
});

function renderTodos() {
  const todos = getTodos();
  list.innerHTML = "";
  emptyState.style.display = todos.length ? "none" : "block";

  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    if (todo.done) li.classList.add("done");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", () => {
      todos[index].done = checkbox.checked;
      saveTodos(todos);
      render();
    });

    const span = document.createElement("span");
    span.textContent = todo.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "×";
    deleteBtn.setAttribute("aria-label", "Delete task");
    deleteBtn.addEventListener("click", () => {
      todos.splice(index, 1);
      saveTodos(todos);
      render();
    });

    li.append(checkbox, span, deleteBtn);
    list.appendChild(li);
  });
}

function render() {
  const signedIn = Boolean(currentUser);
  authView.hidden = signedIn;
  todoView.hidden = !signedIn;
  if (signedIn) {
    userName.textContent = currentUser;
    renderTodos();
  }
}

render();
