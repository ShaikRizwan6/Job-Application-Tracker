// ======================================
// JOBTRACK - DASHBOARD LOGIC (dashboard.js)
// ======================================

// CURRENT SESSION VALIDATION
let currentUser = null;
try {
    const raw = localStorage.getItem("jobtrack_currentUser");
    if (raw && raw !== "null" && raw !== "undefined") {
        currentUser = JSON.parse(raw);
    }
} catch (e) {
    currentUser = null;
}

if (!currentUser || !currentUser.id) {
    localStorage.removeItem("jobtrack_currentUser");
    window.location.replace("index.html");
}

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

// POPULATE USER PROFILE IN DASHBOARD
if (currentUser) {
    const welcomeName = document.getElementById("welcomeName");
    const sidebarName = document.getElementById("sidebarName");
    const sidebarEmail = document.getElementById("sidebarEmail");
    const sidebarAvatar = document.getElementById("sidebarAvatar");

    const firstName = (currentUser.name || "User").split(" ")[0];
    if (welcomeName) welcomeName.textContent = firstName;
    if (sidebarName) sidebarName.textContent = currentUser.name || "User";
    if (sidebarEmail) sidebarEmail.textContent = currentUser.email || "";
    if (sidebarAvatar) sidebarAvatar.textContent = (currentUser.name || "U").charAt(0).toUpperCase();
}

// APPLICATION STORAGE (SCOPED TO CURRENT USER ID)
function getApplications() {
    if (!currentUser || !currentUser.id) return [];
    const storageKey = `jobtrack_applications_${currentUser.id}`;
    try {
        const raw = localStorage.getItem(storageKey);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error("Error reading applications:", e);
        return [];
    }
}

function saveApplications(applications) {
    if (!currentUser || !currentUser.id) return;
    const storageKey = `jobtrack_applications_${currentUser.id}`;
    try {
        localStorage.setItem(storageKey, JSON.stringify(applications));
    } catch (e) {
        console.error("Error saving applications:", e);
    }
}

// MODAL CONTROLS
function openModal() {
    const modal = document.getElementById("modalOverlay");
    const form = document.getElementById("applicationForm");
    const title = document.getElementById("modalTitle");
    const submitBtn = document.getElementById("submitBtn");
    const dateInput = document.getElementById("applicationDate");

    title.textContent = "Add Application";
    submitBtn.textContent = "Save Application";
    form.reset();
    document.getElementById("editId").value = "";

    // Default to today's date
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;

    modal.classList.add("show");
    setTimeout(() => document.getElementById("company").focus(), 80);
}

function closeModal() {
    const modal = document.getElementById("modalOverlay");
    if (modal) modal.classList.remove("show");
}

function closeNoteModal() {
    const noteModal = document.getElementById("noteModalOverlay");
    if (noteModal) noteModal.classList.remove("show");
}

// VIEW NOTES MODAL
function viewNote(id) {
    const applications = getApplications();
    const app = applications.find(item => item.id == id);
    if (!app) return;

    document.getElementById("noteModalTitle").textContent = `${app.company} - Application Notes`;
    document.getElementById("noteModalSubtitle").textContent = `${app.jobRole} • Status: ${app.status}`;
    document.getElementById("noteContent").textContent = app.notes || "No notes entered for this application.";
    document.getElementById("noteModalOverlay").classList.add("show");
}

// CLOSE MODALS ON ESCAPE OR BACKDROP CLICK
window.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
        closeModal();
        closeNoteModal();
    }
});

const modalOverlay = document.getElementById("modalOverlay");
if (modalOverlay) {
    modalOverlay.addEventListener("click", function(event) {
        if (event.target === this) closeModal();
    });
}

const noteModalOverlay = document.getElementById("noteModalOverlay");
if (noteModalOverlay) {
    noteModalOverlay.addEventListener("click", function(event) {
        if (event.target === this) closeNoteModal();
    });
}

// APPLICATION FORM SUBMIT (ADD / EDIT)
const applicationForm = document.getElementById("applicationForm");
if (applicationForm) {
    applicationForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const company = document.getElementById("company").value.trim();
        const jobRole = document.getElementById("jobRole").value.trim();
        const applicationDate = document.getElementById("applicationDate").value;
        const location = document.getElementById("location").value.trim();
        const status = document.getElementById("status").value;
        const rawJobLink = document.getElementById("jobLink").value.trim();
        const notes = document.getElementById("notes").value.trim();
        const editId = document.getElementById("editId").value;

        // SAFE URL FORMATTING
        let jobLink = rawJobLink;
        if (jobLink) {
            if (/^javascript:/i.test(jobLink) || /^data:/i.test(jobLink)) {
                jobLink = "";
            } else if (!/^https?:\/\//i.test(jobLink)) {
                jobLink = "https://" + jobLink;
            }
        }

        let applications = getApplications();

        // EDIT EXISTING
        if (editId) {
            applications = applications.map(app => {
                if (app.id == editId) {
                    return {
                        ...app,
                        company,
                        jobRole,
                        applicationDate,
                        location,
                        status,
                        jobLink,
                        notes,
                        updatedAt: new Date().toISOString()
                    };
                }
                return app;
            });
            showToast("Application updated successfully", "success");
        }
        // ADD NEW
        else {
            const newApp = {
                id: Date.now(),
                company,
                jobRole,
                applicationDate,
                location,
                status,
                jobLink,
                notes,
                createdAt: new Date().toISOString()
            };
            applications.push(newApp);
            showToast("Application added successfully!", "success");
        }

        saveApplications(applications);
        closeModal();
        renderApplications();
        updateStatistics();
    });
}

// RENDER TABLE OF APPLICATIONS
function renderApplications() {
    const tableWrapper = document.getElementById("applicationsTableWrapper");
    const tbody = document.getElementById("applicationsTable");
    const emptyState = document.getElementById("emptyState");

    if (!tbody) return;

    const search = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
    const filter = document.getElementById("statusFilter")?.value || "All";

    let applications = getApplications();

    // SEARCH & FILTER
    applications = applications.filter(app => {
        const matchesSearch =
            app.company.toLowerCase().includes(search) ||
            app.jobRole.toLowerCase().includes(search) ||
            (app.location && app.location.toLowerCase().includes(search));

        const matchesStatus = filter === "All" || app.status === filter;

        return matchesSearch && matchesStatus;
    });

    tbody.innerHTML = "";

    // TOGGLE TABLE VS EMPTY STATE DISPLAY
    if (applications.length === 0) {
        if (tableWrapper) tableWrapper.style.display = "none";
        if (emptyState) emptyState.style.display = "block";
        return;
    }

    if (tableWrapper) tableWrapper.style.display = "table";
    if (emptyState) emptyState.style.display = "none";

    // SORT NEWEST FIRST
    applications.sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate));

    applications.forEach(app => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <div class="company-name">${escapeHTML(app.company)}</div>
            </td>
            <td>
                <div class="role-name">${escapeHTML(app.jobRole)}</div>
            </td>
            <td>
                ${formatDate(app.applicationDate)}
            </td>
            <td>
                ${escapeHTML(app.location || "-")}
            </td>
            <td>
                <span class="status ${getStatusClass(app.status)}">
                    ${escapeHTML(app.status)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    ${
                        app.jobLink
                            ? `<a
                                href="${escapeAttribute(app.jobLink)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="action-btn"
                                title="Open Job Link"
                            >🔗</a>`
                            : ""
                    }
                    ${
                        app.notes
                            ? `<button
                                class="action-btn note-btn"
                                onclick="viewNote(${app.id})"
                                title="View Notes"
                            >📝</button>`
                            : ""
                    }
                    <button
                        class="action-btn edit-btn"
                        onclick="editApplication(${app.id})"
                        title="Edit Application"
                    >✏️</button>
                    <button
                        class="action-btn delete-btn"
                        onclick="deleteApplication(${app.id})"
                        title="Delete Application"
                    >🗑️</button>
                </div>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// STATUS CLASS MAPPING
function getStatusClass(status) {
    switch (status) {
        case "Applied": return "applied";
        case "Online Assessment": return "assessment";
        case "Interview": return "interview";
        case "Selected": return "selected";
        case "Rejected": return "rejected";
        default: return "";
    }
}

// FORMAT DATE SAFELY
function formatDate(dateStr) {
    if (!dateStr) return "-";
    const date = new Date(dateStr + "T00:00:00");
    if (isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

// EDIT APPLICATION
function editApplication(id) {
    const applications = getApplications();
    const app = applications.find(item => item.id == id);
    if (!app) return;

    document.getElementById("modalTitle").textContent = "Edit Application";
    document.getElementById("submitBtn").textContent = "Update Application";
    document.getElementById("editId").value = app.id;
    document.getElementById("company").value = app.company;
    document.getElementById("jobRole").value = app.jobRole;
    document.getElementById("applicationDate").value = app.applicationDate;
    document.getElementById("location").value = app.location || "";
    document.getElementById("status").value = app.status;
    document.getElementById("jobLink").value = app.jobLink || "";
    document.getElementById("notes").value = app.notes || "";

    document.getElementById("modalOverlay").classList.add("show");
}

// DELETE APPLICATION
function deleteApplication(id) {
    const confirmation = confirm("Are you sure you want to delete this application?");
    if (!confirmation) return;

    let applications = getApplications();
    applications = applications.filter(app => app.id != id);
    saveApplications(applications);

    showToast("Application deleted", "info");
    renderApplications();
    updateStatistics();
}

// UPDATE REAL-TIME COUNTERS
function updateStatistics() {
    const applications = getApplications();

    const counts = {
        total: applications.length,
        applied: 0,
        assessment: 0,
        interview: 0,
        selected: 0,
        rejected: 0
    };

    applications.forEach(app => {
        if (app.status === "Applied") counts.applied++;
        else if (app.status === "Online Assessment") counts.assessment++;
        else if (app.status === "Interview") counts.interview++;
        else if (app.status === "Selected") counts.selected++;
        else if (app.status === "Rejected") counts.rejected++;
    });

    const setEl = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setEl("totalCount", counts.total);
    setEl("appliedCount", counts.applied);
    setEl("assessmentCount", counts.assessment);
    setEl("interviewCount", counts.interview);
    setEl("selectedCount", counts.selected);
    setEl("rejectedCount", counts.rejected);
}

// LOAD SAMPLE DATA FOR DEMO
function loadSampleData() {
    const demoApps = [
        {
            id: 101,
            company: "Google",
            jobRole: "Software Engineering Intern",
            applicationDate: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
            location: "Bangalore",
            status: "Interview",
            jobLink: "https://careers.google.com",
            notes: "Technical Interview Round 1 scheduled for next Thursday. Topics: Trees & Dynamic Programming."
        },
        {
            id: 102,
            company: "Microsoft",
            jobRole: "Frontend Developer",
            applicationDate: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
            location: "Hyderabad",
            status: "Online Assessment",
            jobLink: "https://careers.microsoft.com",
            notes: "OA completed on Codility with 3 algorithmic questions."
        },
        {
            id: 103,
            company: "Accenture",
            jobRole: "Associate Software Engineer",
            applicationDate: new Date(Date.now() - 12 * 86400000).toISOString().split("T")[0],
            location: "Bangalore",
            status: "Selected",
            jobLink: "https://accenture.com",
            notes: "Selected! Offer letter received. Discussion regarding joining date pending."
        },
        {
            id: 104,
            company: "Amazon",
            jobRole: "SDE 1",
            applicationDate: new Date(Date.now() - 18 * 86400000).toISOString().split("T")[0],
            location: "Remote",
            status: "Applied",
            jobLink: "https://amazon.jobs",
            notes: "Applied with alumni referral."
        }
    ];

    saveApplications(demoApps);
    showToast("Sample applications loaded!", "success");
    renderApplications();
    updateStatistics();
}

// EXPORT TO CSV
function exportToCSV() {
    const applications = getApplications();
    if (applications.length === 0) {
        showToast("No applications to export!", "error");
        return;
    }

    const headers = ["Company", "Job Role", "Application Date", "Location", "Status", "Job Link", "Notes"];
    const rows = applications.map(app => [
        `"${(app.company || "").replace(/"/g, '""')}"`,
        `"${(app.jobRole || "").replace(/"/g, '""')}"`,
        `"${app.applicationDate || ""}"`,
        `"${(app.location || "").replace(/"/g, '""')}"`,
        `"${(app.status || "").replace(/"/g, '""')}"`,
        `"${(app.jobLink || "").replace(/"/g, '""')}"`,
        `"${(app.notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `jobtrack_applications_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Applications exported to CSV!", "success");
}

// SEARCH & FILTER EVENT LISTENERS
const searchInput = document.getElementById("searchInput");
if (searchInput) {
    searchInput.addEventListener("input", renderApplications);
}

const statusFilter = document.getElementById("statusFilter");
if (statusFilter) {
    statusFilter.addEventListener("change", renderApplications);
}

// LOGOUT FUNCTION
function logout() {
    localStorage.removeItem("jobtrack_currentUser");
    showToast("Logged out successfully", "info");
    setTimeout(() => {
        window.location.replace("index.html");
    }, 300);
}

// ESCAPING HELPERS (XSS DEFENSE)
function escapeHTML(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(str) {
    if (!str) return "";
    return String(str)
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// INITIAL RENDER
renderApplications();
updateStatistics();
