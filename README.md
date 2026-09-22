# JobTrack - Job Application Tracker

A modern, responsive, client-side web application designed to help students and job seekers track their internship and job applications across every stage of the hiring process.

Built with **pure HTML5, CSS3, and modern JavaScript (ES6+)**, running entirely client-side with `localStorage` for offline-capable, isolated data persistence.

---

## 🌟 Key Features & Enhancements

- 🔐 **Authentication & Route Protection**:
  - Registration with duplicate email check and password validation (min 6 characters, confirmation matching).
  - Session verification with automatic redirection to prevent Flash of Unauthenticated Content (FOUC).
  - Isolated multi-user storage (`jobtrack_applications_<userId>`).
- 📊 **Real-Time Analytics Dashboard**:
  - Live metric counters: **Total Applications**, **Applied**, **Assessments**, **Interviews**, **Selected**, and **Rejected**.
  - Dynamic updates whenever applications are added, edited, or deleted.
- 💼 **Full CRUD Application Management**:
  - Add new applications with company, role, date, location, status, job posting URL, and notes.
  - Edit existing entries with pre-filled inputs.
  - Delete entries with confirmation.
- 📝 **Dedicated Notes & Details Viewer**:
  - View detailed interview rounds, recruiter notes, and compensation in a clean popup modal.
- 🔍 **Instant Search & Status Filtering**:
  - Filter across company names, job roles, and locations in real time.
  - Status dropdown filter.
- 📥 **Export to CSV**:
  - One-click export of all saved applications to a `.csv` spreadsheet file (compatible with Excel & Google Sheets).
- ✨ **Instant Demo Data**:
  - One-click "Load Demo Data" button to quickly preview the dashboard with sample applications.
- 🔔 **Toast Notification System**:
  - Non-intrusive feedback for actions (login, logout, application saved, deleted, exported).
- 🛡️ **Security & Accessibility**:
  - XSS defense with HTML/attribute sanitizers and safe external URL protocol handling.
  - Keyboard navigation (`Escape` closes open modals) and full responsive layout down to mobile screens.

---

## 📁 Project Structure

```text
Job-Application-Tracker/
│
├── index.html          # Login page (auto-redirects if already logged in)
├── register.html       # Registration page
├── dashboard.html      # Main dashboard & application manager
├── README.md           # Project documentation
│
├── css/
│   ├── style.css       # Design tokens, resets, toast notifications
│   ├── auth.css        # Hero layout and authentication cards
│   └── dashboard.css   # Responsive sidebar, stats cards, tables & modals
│
└── js/
    ├── auth.js         # Signup, login, validation & toast alerts
    └── dashboard.js    # CRUD, search, filter, CSV export, notes modal & demo data
```

---

## 🚀 How to Run

1. Open [index.html](file:///C:/Users/Rizwan/Downloads/Job-Application-Tracker/index.html) in any web browser (Chrome, Edge, Firefox, Safari).
2. Or use the **Live Server** extension in VS Code:
   * Right-click `index.html` → **Open with Live Server**.
3. Create an account, log in, and click **+ Add Application** or **✨ Load Demo Data** to explore!
