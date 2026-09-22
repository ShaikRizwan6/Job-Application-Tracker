# Job Application Tracker (JobTrack)

A complete, working Job Application Tracker built with **vanilla HTML, CSS, and JavaScript**. It uses browser `localStorage` for data persistence and authentication.

## Folder Structure

```text
Job-Application-Tracker/
│
├── index.html          # Login page
├── register.html       # Account creation page
├── dashboard.html      # Main application dashboard
│
├── css/
│   ├── style.css       # Base & reset styles
│   ├── auth.css        # Authentication pages styling
│   └── dashboard.css   # Dashboard, cards, table, and modal styling
│
└── js/
    ├── auth.js         # Authentication, registration & session logic
    └── dashboard.js    # Applications CRUD, statistics, search & filter
```

## How to Run

1. Open `index.html` directly in your web browser (Chrome, Edge, Firefox, Safari).
2. Or use the **Live Server** extension in VS Code:
   * Right-click `index.html` and select **Open with Live Server**.

## Features Included

- **Account Authentication**: Register and login with validation (min 6-character password, password matching check, duplicate email prevention).
- **Session Management**: Automatically redirects unauthenticated users back to `index.html`.
- **User Data Isolation**: Separate storage per user account (`jobtrack_applications_<userId>`).
- **Interactive Statistics**: Total Applications, Applied, Assessments, Interviews, Selected, and Rejected counts automatically recalculate.
- **Application CRUD**:
  - Add applications via popup modal.
  - Edit existing records.
  - Delete with confirmation.
- **Search & Filter**: Real-time searching by company or role and filtering by application status.
- **Responsive Layout**: Designed for desktop, tablet, and mobile screens.
