// ======================================
// JOBTRACK - AUTHENTICATION LOGIC (auth.js)
// ======================================

// TOAST NOTIFICATION COMPONENT
function showToast(message, type = "info") {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    const icon = type === "success" ? "✓" : type === "error" ? "⚠" : "ℹ";
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

// STORAGE HELPERS
function getUsers() {
    try {
        const raw = localStorage.getItem("jobtrack_users");
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Error reading users from localStorage:", e);
        return [];
    }
}

function saveUsers(users) {
    try {
        localStorage.setItem("jobtrack_users", JSON.stringify(users));
    } catch (e) {
        console.error("Error saving users to localStorage:", e);
    }
}

// ======================================
// REGISTRATION
// ======================================
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const nameInput = document.getElementById("registerName");
        const emailInput = document.getElementById("registerEmail");
        const passwordInput = document.getElementById("registerPassword");
        const confirmPasswordInput = document.getElementById("confirmPassword");
        const messageEl = document.getElementById("registerMessage");

        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (name.length < 2) {
            messageEl.textContent = "Please enter your full name.";
            messageEl.style.color = "#dc2626";
            nameInput.focus();
            return;
        }

        // Email basic validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            messageEl.textContent = "Please enter a valid email address.";
            messageEl.style.color = "#dc2626";
            emailInput.focus();
            return;
        }

        if (password.length < 6) {
            messageEl.textContent = "Password must be at least 6 characters long.";
            messageEl.style.color = "#dc2626";
            passwordInput.focus();
            return;
        }

        if (password !== confirmPassword) {
            messageEl.textContent = "Passwords do not match.";
            messageEl.style.color = "#dc2626";
            confirmPasswordInput.focus();
            return;
        }

        const users = getUsers();
        const existingUser = users.find(u => u.email && u.email.toLowerCase().trim() === email);

        if (existingUser) {
            messageEl.textContent = "An account with this email already exists. Please log in.";
            messageEl.style.color = "#dc2626";
            showToast("Account already exists. Please login.", "error");
            emailInput.focus();
            return;
        }

        // CREATE NEW USER RECORD
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers(users);

        // Pre-fill email on login page
        localStorage.setItem("jobtrack_lastEmail", email);

        messageEl.textContent = "Account created successfully! Redirecting to login...";
        messageEl.style.color = "#16a34a";
        showToast("Account created successfully!", "success");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 900);
    });
}

// ======================================
// LOGIN
// ======================================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    // Auto pre-fill last registered or logged in email
    const savedEmail = localStorage.getItem("jobtrack_lastEmail");
    const emailInput = document.getElementById("loginEmail");
    if (savedEmail && emailInput && !emailInput.value) {
        emailInput.value = savedEmail;
        const passwordInput = document.getElementById("loginPassword");
        if (passwordInput) passwordInput.focus();
    }

    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const emailInput = document.getElementById("loginEmail");
        const passwordInput = document.getElementById("loginPassword");
        const messageEl = document.getElementById("loginMessage");

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        const users = getUsers();

        if (users.length === 0) {
            messageEl.textContent = "No accounts registered yet. Please create an account first.";
            messageEl.style.color = "#dc2626";
            showToast("No account found. Please register.", "error");
            return;
        }

        const userWithEmail = users.find(u => u.email && u.email.toLowerCase().trim() === email);

        if (!userWithEmail) {
            messageEl.textContent = "No account found with this email. Please check spelling or register.";
            messageEl.style.color = "#dc2626";
            showToast("Account not found", "error");
            emailInput.focus();
            return;
        }

        if (userWithEmail.password !== password) {
            messageEl.textContent = "Incorrect password. Please try again.";
            messageEl.style.color = "#dc2626";
            showToast("Incorrect password", "error");
            passwordInput.value = "";
            passwordInput.focus();
            return;
        }

        // VALID USER FOUND: SAVE SESSION
        const sessionUser = {
            id: userWithEmail.id,
            name: userWithEmail.name,
            email: userWithEmail.email
        };

        localStorage.setItem("jobtrack_currentUser", JSON.stringify(sessionUser));
        localStorage.setItem("jobtrack_lastEmail", userWithEmail.email);

        messageEl.textContent = "Login successful! Redirecting to dashboard...";
        messageEl.style.color = "#16a34a";
        showToast(`Welcome back, ${userWithEmail.name.split(" ")[0]}!`, "success");

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 500);
    });
}

// ======================================
// PASSWORD VISIBILITY TOGGLE
// ======================================
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}
