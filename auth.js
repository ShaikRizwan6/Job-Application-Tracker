// ================================
// JOBTRACK AUTHENTICATION
// ================================

// GET USERS
function getUsers() {
    return JSON.parse(
        localStorage.getItem("jobtrack_users")
    ) || [];
}

// SAVE USERS
function saveUsers(users) {
    localStorage.setItem(
        "jobtrack_users",
        JSON.stringify(users)
    );
}

// ================================
// REGISTER
// ================================
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim().toLowerCase();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const message = document.getElementById("registerMessage");

        // PASSWORD CHECK
        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match.";
            message.style.color = "#dc2626";
            return;
        }

        if (password.length < 6) {
            message.textContent = "Password must contain at least 6 characters.";
            message.style.color = "#dc2626";
            return;
        }

        // GET EXISTING USERS
        const users = getUsers();

        // CHECK EMAIL
        const existingUser = users.find(user => user.email === email);

        if (existingUser) {
            message.textContent = "An account with this email already exists.";
            message.style.color = "#dc2626";
            return;
        }

        // CREATE USER
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password
        };

        users.push(newUser);
        saveUsers(users);

        message.textContent = "Account created successfully! Redirecting...";
        message.style.color = "#16a34a";

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1200);
    });
}

// ================================
// LOGIN
// ================================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;
        const message = document.getElementById("loginMessage");

        const users = getUsers();

        const user = users.find(
            user => user.email === email && user.password === password
        );

        if (!user) {
            message.textContent = "Invalid email or password.";
            message.style.color = "#dc2626";
            return;
        }

        // SAVE CURRENT USER
        localStorage.setItem(
            "jobtrack_currentUser",
            JSON.stringify(user)
        );

        message.textContent = "Login successful! Redirecting...";
        message.style.color = "#16a34a";

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 700);
    });
}

// ================================
// PASSWORD TOGGLE
// ================================
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}
