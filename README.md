# 🛡️ GearGuard - Equipment Maintenance & Tracking System

**GearGuard** is a robust MERN Stack application designed to streamline equipment maintenance for industrial facilities. It helps teams track machinery status, schedule preventive maintenance, manage technician assignments, and visualize workflows using Kanban boards and Calendars.

---

## 🚀 Key Features

* **📊 Interactive Dashboard:** Real-time statistics on equipment, open requests, and overdue tasks.
* **📋 Kanban Workflow:** Drag-and-drop board to manage maintenance stages (Open -> In Progress -> Done).
* **📅 Maintenance Calendar:** Visual schedule of upcoming preventive maintenance and repairs.
* **👥 Team Management:** Create teams, assign technicians, and manage roles.
* **🔧 Equipment Database:** Inventory management for all machinery with status tracking.
* **📝 Request System:** Detailed reporting system with priority levels and assignments.

---

## 🛠️ Tech Stack

**Frontend:**
* React.js (Vite)
* React Router DOM
* **@dnd-kit:** For the Drag-and-Drop Kanban Board.
* **FullCalendar:** For the maintenance schedule view.
* **Framer Motion:** For smooth animations.
* **Axios:** For API integration.
* **React Icons:** For UI iconography.

**Backend:**
* Node.js & Express.js
* **MongoDB & Mongoose:** Database and Object Modeling.
* **JWT (JSON Web Tokens):** Secure authentication.
* **Bcryptjs:** Password hashing.

---

## 📸 Application Overview & Screenshots

### 1. Dashboard
An overview of the system health, showing total equipment, active requests, and recent activity.
![Dashboard Screenshot](./screenshots/dashboard.png)

### 2. Maintenance Kanban Board
A drag-and-drop interface to move tickets between "Open", "In Progress", "Completed", and "Scrap".
![Kanban Board Screenshot](./screenshots/kanban.png)

### 3. Maintenance Calendar
A monthly view of scheduled tasks. Events are color-coded by priority.
![Calendar Screenshot](./screenshots/calendar.png)

### 4. Create New Request
A form to log issues, utilizing dynamic equipment and technician dropdowns fetched from the database.
![New Request Screenshot](./screenshots/create-request.png)

### 5. Maintenance List
A tabular view of all requests with filtering, searching, and status badges.
![Maintenance List Screenshot](./screenshots/list-view.png)

### 6. Team Management
Create new teams and assign technicians/leaders.
![Team Form Screenshot](./screenshots/team-form.png)

---

## 📂 Project Structure

Here is the structure of the project connecting the Frontend and Backend.

```text
GearGuard/
├── client/                   # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProfileDropdown.jsx
│   │   ├── pages/            # Main Page Views
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   └── Dashboard.css
│   │   │   ├── Kanban/
│   │   │   │   ├── Kanban.jsx
│   │   │   │   └── Kanban.css
│   │   │   ├── Maintenance/
│   │   │   │   ├── MaintenanceList.jsx
│   │   │   │   ├── MaintenanceForm.jsx
│   │   │   │   ├── MaintenanceDetails.jsx
│   │   │   │   └── MaintenanceCalendar.jsx
│   │   │   ├── Teams/
│   │   │   │   ├── TeamList.jsx
│   │   │   │   └── TeamForm.jsx
│   │   ├── App.jsx           # Routing Setup
│   │   └── main.jsx
│   └── package.json
│
├── server/                   # Backend (Node + Express)
│   ├── src/
│   │   ├── config/           # DB Connection
│   │   │   └── db.js
│   │   ├── models/           # Mongoose Schemas
│   │   │   ├── User.model.js
│   │   │   ├── Equipment.model.js
│   │   │   ├── Team.model.js
│   │   │   └── MaintenanceRequest.model.js
│   │   ├── routes/           # API Routes
│   │   │   ├── auth.routes.js
│   │   │   ├── equipment.routes.js
│   │   │   ├── maintenance.routes.js
│   │   │   └── team.routes.js
│   │   ├── middlewares/      # Auth Middleware
│   │   │   └── auth.middleware.js
│   │   └── server.js         # Entry Point
│   ├── .env
│   └── package.json
│
└── README.md