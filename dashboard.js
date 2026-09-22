// ======================================
// JOBTRACK DASHBOARD
// ======================================

// ======================================
// CURRENT USER
// ======================================
const currentUser = JSON.parse(
    localStorage.getItem("jobtrack_currentUser")
);

if (!currentUser) {
    window.location.href = "index.html";
}

// ======================================
// ELEMENTS
// ======================================
const welcomeName = document.getElementById("welcomeName");
const sidebarName = document.getElementById("sidebarName");
const sidebarEmail = document.getElementById("sidebarEmail");
const sidebarAvatar = document.getElementById("sidebarAvatar");

// ======================================
// DISPLAY USER
// ======================================
if (currentUser) {
    if (welcomeName) welcomeName.textContent = currentUser.name.split(" ")[0];
    if (sidebarName) sidebarName.textContent = currentUser.name;
    if (sidebarEmail) sidebarEmail.textContent = currentUser.email;
    if (sidebarAvatar) sidebarAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
}

// ======================================
// APPLICATION STORAGE
// ======================================
function getApplications() {
    if (!currentUser) return [];
    const key = `jobtrack_applications_${currentUser.id}`;
    return JSON.parse(localStorage.getItem(key)) || [];
}

function saveApplications(applications) {
    if (!currentUser) return;
    const key = `jobtrack_applications_${currentUser.id}`;
    localStorage.setItem(key, JSON.stringify(applications));
}

// ======================================
// MODAL
// ======================================
function openModal() {
    document.getElementById("modalOverlay").classList.add("show");
    document.getElementById("modalTitle").textContent = "Add Application";
    document.getElementById("applicationForm").reset();
    document.getElementById("editId").value = "";

    // Default to today's date
    document.getElementById("applicationDate").value = new Date().toISOString().split("T")[0];
}

function closeModal() {
    document.getElementById("modalOverlay").classList.remove("show");
}

// Close modal when clicking on the dark backdrop
const modalOverlay = document.getElementById("modalOverlay");
if (modalOverlay) {
    modalOverlay.addEventListener("click", function(event) {
        if (event.target === this) {
            closeModal();
        }
    });
}

// ======================================
// ADD / EDIT APPLICATION
// ======================================
const applicationForm = document.getElementById("applicationForm");

if (applicationForm) {
    applicationForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const company = document.getElementById("company").value.trim();
        const jobRole = document.getElementById("jobRole").value.trim();
        const applicationDate = document.getElementById("applicationDate").value;
        const location = document.getElementById("location").value.trim();
        const status = document.getElementById("status").value;
        const jobLink = document.getElementById("jobLink").value.trim();
        const notes = document.getElementById("notes").value.trim();
        const editId = document.getElementById("editId").value;

        let applications = getApplications();

        // EDIT
        if (editId) {
            applications = applications.map(application => {
                if (application.id == editId) {
                    return {
                        ...application,
                        company,
                        jobRole,
                        applicationDate,
                        location,
                        status,
                        jobLink,
                        notes
                    };
                }
                return application;
            });
        }
        // ADD
        else {
            const newApplication = {
                id: Date.now(),
                company,
                jobRole,
                applicationDate,
                location,
                status,
                jobLink,
                notes
            };
            applications.push(newApplication);
        }

        saveApplications(applications);
        closeModal();
        renderApplications();
        updateStatistics();
    });
}

// ======================================
// RENDER APPLICATIONS
// ======================================
function renderApplications() {
    const table = document.getElementById("applicationsTable");
    const emptyState = document.getElementById("emptyState");

    if (!table) return;

    const search = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
    const filter = document.getElementById("statusFilter")?.value || "All";

    let applications = getApplications();

    // SEARCH & FILTER
    applications = applications.filter(application => {
        const matchesSearch =
            application.company.toLowerCase().includes(search) ||
            application.jobRole.toLowerCase().includes(search);

        const matchesStatus =
            filter === "All" || application.status === filter;

        return matchesSearch && matchesStatus;
    });

    table.innerHTML = "";

    if (applications.length === 0) {
        if (emptyState) emptyState.style.display = "block";
        return;
    }

    if (emptyState) emptyState.style.display = "none";

    // SORT NEWEST FIRST
    applications.sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate));

    applications.forEach(application => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <div class="company-name">
                    ${escapeHTML(application.company)}
                </div>
            </td>
            <td>
                <div class="role-name">
                    ${escapeHTML(application.jobRole)}
                </div>
            </td>
            <td>
                ${formatDate(application.applicationDate)}
            </td>
            <td>
                ${escapeHTML(application.location || "-")}
            </td>
            <td>
                <span class="status ${getStatusClass(application.status)}">
                    ${escapeHTML(application.status)}
                </span>
            </td>
            <td>
                ${
                    application.jobLink
                        ? `<a
                            href="${escapeAttribute(application.jobLink)}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="action-btn"
                            title="Open Job Link"
                        >🔗</a>`
                        : ""
                }
                <button
                    class="action-btn edit-btn"
                    onclick="editApplication(${application.id})"
                    title="Edit"
                >✏️</button>
                <button
                    class="action-btn delete-btn"
                    onclick="deleteApplication(${application.id})"
                    title="Delete"
                >🗑️</button>
            </td>
        `;

        table.appendChild(row);
    });
}

// ======================================
// STATUS CLASS
// ======================================
function getStatusClass(status) {
    switch (status) {
        case "Applied":
            return "applied";
        case "Online Assessment":
            return "assessment";
        case "Interview":
            return "interview";
        case "Selected":
            return "selected";
        case "Rejected":
            return "rejected";
        default:
            return "";
    }
}

// ======================================
// DATE FORMAT
// ======================================
function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

// ======================================
// EDIT APPLICATION
// ======================================
function editApplication(id) {
    const applications = getApplications();
    const application = applications.find(item => item.id === id);

    if (!application) return;

    document.getElementById("modalTitle").textContent = "Edit Application";
    document.getElementById("editId").value = application.id;
    document.getElementById("company").value = application.company;
    document.getElementById("jobRole").value = application.jobRole;
    document.getElementById("applicationDate").value = application.applicationDate;
    document.getElementById("location").value = application.location || "";
    document.getElementById("status").value = application.status;
    document.getElementById("jobLink").value = application.jobLink || "";
    document.getElementById("notes").value = application.notes || "";

    document.getElementById("modalOverlay").classList.add("show");
}

// ======================================
// DELETE APPLICATION
// ======================================
function deleteApplication(id) {
    const confirmation = confirm("Are you sure you want to delete this application?");
    if (!confirmation) return;

    let applications = getApplications();
    applications = applications.filter(application => application.id !== id);
    saveApplications(applications);

    renderApplications();
    updateStatistics();
}

// ======================================
// STATISTICS
// ======================================
function updateStatistics() {
    const applications = getApplications();

    const total = applications.length;
    const applied = applications.filter(app => app.status === "Applied").length;
    const assessment = applications.filter(app => app.status === "Online Assessment").length;
    const interview = applications.filter(app => app.status === "Interview").length;
    const selected = applications.filter(app => app.status === "Selected").length;
    const rejected = applications.filter(app => app.status === "Rejected").length;

    const totalCountEl = document.getElementById("totalCount");
    const appliedCountEl = document.getElementById("appliedCount");
    const assessmentCountEl = document.getElementById("assessmentCount");
    const interviewCountEl = document.getElementById("interviewCount");
    const selectedCountEl = document.getElementById("selectedCount");
    const rejectedCountEl = document.getElementById("rejectedCount");

    if (totalCountEl) totalCountEl.textContent = total;
    if (appliedCountEl) appliedCountEl.textContent = applied;
    if (assessmentCountEl) assessmentCountEl.textContent = assessment;
    if (interviewCountEl) interviewCountEl.textContent = interview;
    if (selectedCountEl) selectedCountEl.textContent = selected;
    if (rejectedCountEl) rejectedCountEl.textContent = rejected;
}

// ======================================
// SEARCH & FILTER LISTENERS
// ======================================
const searchInput = document.getElementById("searchInput");
if (searchInput) {
    searchInput.addEventListener("input", renderApplications);
}

const statusFilter = document.getElementById("statusFilter");
if (statusFilter) {
    statusFilter.addEventListener("change", renderApplications);
}

// ======================================
// LOGOUT
// ======================================
function logout() {
    localStorage.removeItem("jobtrack_currentUser");
    window.location.href = "index.html";
}

// ======================================
// SECURITY HELPERS
// ======================================
function escapeHTML(value) {
    if (!value) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    if (!value) return "";
    return String(value)
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ======================================
// INITIAL LOAD
// ======================================
renderApplications();
updateStatistics();
