# LearnSpace — Full-Stack Mini Learning Management System (LMS)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%20%7C%20TailwindCSS%20v4-blue)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MariaDB%2010.6-teal)](https://mariadb.org/)
[![Security](https://img.shields.io/badge/Security-Bcrypt%20%7C%20JWT%20%7C%20RBAC-indigo)](https://jwt.io/)

**LearnSpace** is a comprehensive, production-ready, database-driven Mini Learning Management System (LMS) built with **React 19**, **Vite**, **Tailwind CSS v4**, **Node.js/Express**, and **MariaDB 10.6**. 

It implements authentic database-driven authentication, strict Role-Based Access Control (RBAC), and full workflows across three distinct user roles: **Administrator**, **Teacher / Faculty Instructor**, and **Student Scholar**.

---

## 📋 Table of Contents
1. [Demo Accounts](#-demo-accounts)
2. [Key Features by Role](#-key-features-by-role)
3. [Technology Stack](#-technology-stack)
4. [Prerequisites](#-prerequisites)
5. [Virtual Machine & Database Setup (VirtualBox / Ubuntu VM)](#-virtual-machine--database-setup-virtualbox--ubuntu-vm)
6. [Installation & Setup](#-installation--setup)
7. [Database Initialization](#-database-initialization)
8. [Running the Application](#-running-the-application)
9. [Automated Verification Suites](#-automated-verification-suites)
10. [Project Architecture](#-project-architecture)
11. [Security & Access Control](#-security--access-control)

---

## 🔑 Demo Accounts

All accounts are pre-seeded into the database with bcrypt-hashed passwords. Use these credentials to sign in and test the application across different access levels:

| Role | Account Name | Email | Password | Access / Portal |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Elena Rostova | `admin@learnspace.edu` | `password123` | System Administrator Portal |
| **Teacher / Faculty** | Cameron Williamson | `cameron@learnspace.edu` | `password123` | Faculty Instructor Portal |
| **Student Scholar** | Jane Cooper | `jane.cooper@learnspace.edu` | `password123` | Student Scholar Portal |
| **Student Scholar** | Floyd Miles | `floyd.miles@learnspace.edu` | `password123` | Student Scholar Portal |
| **Student Scholar** | Leslie Alexander | `leslie.alexander@learnspace.edu` | `password123` | Student Scholar Portal |
| **Student Scholar** | Alex Johnson | `student.alex@learnspace.edu` | `password123` | Student Scholar Portal |

> **Note:** Every user role logs in through the real authentication flow. Selecting a role never bypasses authentication; credentials are verified directly against MariaDB.

---

## 🚀 Key Features by Role

### 1. Administrator Portal
- **Executive Dashboard:** Platform metrics, user distribution, course statistics, enrollment overview, and system health.
- **Identity & Access Management:** View all user accounts, provision new accounts (Admin, Teacher, Student), activate/suspend accounts, edit user info, and perform administrative password resets.
- **Student & Teacher Directories:** Dedicated listings for quick filtering and roster inspection.
- **Course & Curriculum Catalog:** Author courses, manage course codes, publish/draft statuses, and categorize curricula.
- **Course Categories:** Organize courses into categories with customizable icons and descriptions.
- **Enrollment Oversight:** Enroll students into courses, update enrollment statuses (`active`, `completed`, `dropped`), and remove enrollments.
- **Campus Announcements:** Broadcast announcements targeted to specific roles (`all`, `teachers`, `students`) with pin controls.
- **Reports & Analytics:** Institutional registration trends, course distribution charts, and student engagement KPIs.
- **Audit Logging:** Immutable audit trail recording user logins, logouts, administrative password resets, and system actions.
- **System Settings:** Configure organization branding, registration policies, timezone, academic terms, and storage quotas.

### 2. Faculty / Instructor Portal
- **Faculty Dashboard:** Active course overview, enrolled student counts, pending submissions queue awaiting grading, upcoming assessment deadlines, and quick creation shortcuts.
- **Course Workspaces:** Manage assigned courses, organize multi-week modules, and publish lesson curricula.
- **Curriculum Authoring:** Rich markdown lesson editor with estimated completion time tracking.
- **Learning Materials:** Upload and attach lecture notes, PDFs, GitHub links, and external references to courses.
- **Student Roster:** Search and inspect students enrolled across your assigned courses.
- **Assignment Hub:** Create deliverables with point weights, deadlines, and markdown instructions.
- **Submission Grading:** Review student deliverables, submit numeric scores, and provide written feedback.
- **Quiz Management:** Author timed quizzes, configure passing thresholds, and build multiple-choice question pools.
- **Cross-Tabulated Gradebook:** Matrix view computing student grades across all assignments and quizzes.
- **Course Announcements & Discussions:** Broadcast course updates and engage in interactive threaded discussion forums with students.
- **Cohort Analytics:** Real-time engagement score distributions and completion rates.

### 3. Student Scholar Portal
- **Student Dashboard:** Active course progress cards, upcoming deadlines calendar, recent quiz results, and unread announcement alerts.
- **Course Catalog & Self-Enrollment:** Browse published courses, inspect curriculum overviews, and self-enroll in programs with 1 click.
- **My Courses & Interactive Lesson Viewer:** Step through course modules and lessons with live reading progress tracking and automatic completion recording.
- **Learning Materials Hub:** Filter and download study materials, syllabi, and reference links.
- **Assignment Submissions:** View upcoming tasks, submit text/file deliverables, and view graded feedback.
- **Timed Online Quizzes:** Take interactive quizzes with real-time countdown timers, radio option selection, immediate auto-scoring, and answer reviews.
- **Grades & Feedback Ledger:** Track academic performance across assignments and quizzes.
- **Calendar & Notifications:** Stay updated on deadlines and course alerts.
- **Gamification & Badges:** Earn achievement shields (First Steps, Deliverable Master, Quiz Ace) based on learning milestones.

---

## 🛠 Technology Stack

- **Frontend:**
  - React 19
  - Vite (build tool & dev server)
  - Tailwind CSS v4
  - Lucide React (SVG icon system)
- **Backend:**
  - Node.js & Express
  - MariaDB / MySQL connector (`mysql2/promise`)
  - Bcrypt.js (password hashing with salt rounds: 10)
  - JSON Web Tokens (`jsonwebtoken` with 7-day expiry)
  - CORS, Dotenv, and Concurrently
- **Database:**
  - MariaDB 10.6+ (compatible with MySQL 8.0+)
  - 28 normalized relational schema tables with foreign key constraints and cascade actions

---

## 📦 Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher, v20+ recommended)
- **npm** (v9+ or higher)
- **MariaDB** or **MySQL** server running locally or accessible over the network

---

## 🖥 Virtual Machine & Database Setup (VirtualBox / Ubuntu VM)

If your MariaDB database is hosted in an **Ubuntu Virtual Machine (VirtualBox)** while your application runs in **WSL / VS Code / Windows Host**, follow this step-by-step guide to configure network connectivity and allow remote database connections.

### Step 1: Configure VirtualBox Network Adapter
To allow your host machine and WSL to reach the Virtual Machine directly via an IP address:
1. Open **VirtualBox** and select your Ubuntu VM (ensure it is powered off).
2. Go to **Settings** → **Network** → **Adapter 1**.
3. Set **Attached to:** to **Bridged Adapter**.
4. In **Name:**, select your active physical network adapter (Wi-Fi or Ethernet).
5. Click **OK** and start your Virtual Machine.

> **Alternative (NAT with Port Forwarding):** If you prefer keeping the default **NAT** adapter:
> Go to **Settings** → **Network** → **Advanced** → **Port Forwarding** and add a rule:
> - Name: `MariaDB`
> - Protocol: `TCP`
> - Host IP: `127.0.0.1` | Host Port: `3306`
> - Guest IP: *(leave blank)* | Guest Port: `3306`

---

### Step 2: Install MariaDB on Ubuntu VM
Inside your Ubuntu VM terminal, install and start MariaDB:
```bash
sudo apt update
sudo apt install mariadb-server -y

# Enable and start the service
sudo systemctl enable mariadb
sudo systemctl start mariadb

# Verify service is running
sudo systemctl status mariadb
```

---

### Step 3: Configure MariaDB to Listen on All Network Interfaces
By default, MariaDB only listens locally on `127.0.0.1`. You must change this so your host and WSL can connect:
1. Open the MariaDB configuration file:
   ```bash
   sudo nano /etc/mysql/mariadb.conf.d/50-server.cnf
   ```
2. Locate the line:
   ```ini
   bind-address = 127.0.0.1
   ```
3. Change it to `0.0.0.0`:
   ```ini
   bind-address = 0.0.0.0
   ```
4. Save and exit (`Ctrl + O`, `Enter`, then `Ctrl + X`).
5. Restart the MariaDB service:
   ```bash
   sudo systemctl restart mariadb
   ```

---

### Step 4: Create Database, User, and Grant Remote Privileges
Log into MariaDB inside the Ubuntu VM as root:
```bash
sudo mariadb -u root
```

Run the following SQL commands to create the database, user, and permissions for remote access from any host (`'%'`):
```sql
-- 1. Create database
CREATE DATABASE IF NOT EXISTS app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Create remote user (replace 'your_password' with your desired password)
CREATE USER 'aljon'@'%' IDENTIFIED BY 'your_password';

-- 3. Grant full privileges to the database
GRANT ALL PRIVILEGES ON app_db.* TO 'aljon'@'%';

-- 4. Apply privilege changes
FLUSH PRIVILEGES;

-- 5. Exit MariaDB
EXIT;
```

---

### Step 5: Configure Ubuntu Firewall (UFW)
Allow traffic on MariaDB port `3306`:
```bash
# Allow from any IP on port 3306:
sudo ufw allow 3306/tcp

# Or allow only from your local subnet (recommended):
# sudo ufw allow from 192.168.1.0/24 to any port 3306

sudo ufw reload
```

---

### Step 6: Find Your Virtual Machine IP Address
Inside the Ubuntu VM terminal, find its assigned IP address:
```bash
hostname -I
# or: ip a
```
*Example IP output: `192.168.1.32`*

---

### Step 7: Test Connection from WSL / VS Code / Host
In your WSL or host terminal, test whether the port is open and accessible:
```bash
# Test network port reachability:
nc -zv 192.168.1.32 3306

# Or test MariaDB connection directly:
mariadb -h 192.168.1.32 -u aljon -p -e "STATUS;"
```
If successful, you will see `Connection to 192.168.1.32 port 3306 [tcp/mysql] succeeded!` and the MariaDB server version.

---

### Step 8: Connect LearnSpace to Your VM Database
In your project directory, set your VM IP in `server/.env`:
```env
PORT=5000
DB_HOST=192.168.1.32      # IP address of your Ubuntu VM
DB_PORT=3306
DB_USER=aljon
DB_PASSWORD=your_password
DB_NAME=app_db
JWT_SECRET=learnspace-secret-key-2026
```

Now you can run database initialization:
```bash
npm run init-db
# or import: mariadb -h 192.168.1.32 -u aljon -p app_db < schema.sql
```

---

## 💻 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/aljonhiii/OS-LEARNSPACE.git
cd OS-LEARNSPACE
```

### 2. Install Dependencies
Install dependencies for both the frontend and backend:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Configure Environment Variables
Create a `.env` file in the `server` directory based on `server/.env.example`:
```bash
cp server/.env.example server/.env
```

Open `server/.env` and update your database credentials:
```env
PORT=5000
DB_HOST=localhost       # or your MariaDB IP (e.g. 192.168.1.32)
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=app_db
JWT_SECRET=learnspace-secret-key-2026
```

---

## 🗄 Database Initialization

Create the database in MariaDB/MySQL if it does not already exist:
```sql
CREATE DATABASE IF NOT EXISTS app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

You can initialize the database using either of the following approaches:

#### Option A: Automated Node Initializer
```bash
npm run init-db
# (Alternatively: node server/scripts/init-db.js)
```

#### Option B: Direct SQL Import (`schema.sql`)
The repository includes a ready-to-import [`schema.sql`](schema.sql) file containing all DDL table structures, indexes, foreign keys, and seed data:
```bash
# Using MariaDB CLI:
mariadb -u your_db_user -p app_db < schema.sql

# Using MySQL CLI:
mysql -u your_db_user -p app_db < schema.sql
```

---

## 🚀 Running the Application

### Start Both Frontend and Backend Concurrently
From the project root:
```bash
npm run dev
```

This launches:
- **Express Backend API:** `http://localhost:5000`
- **Vite React Frontend:** `http://localhost:5173`

You can also run them independently if desired:
```bash
# Terminal 1 - Backend API:
npm run server

# Terminal 2 - Frontend Client:
npm run client
```

Open your browser and navigate to **[http://localhost:5173](http://localhost:5173)** to sign in.

---

## 🧪 Automated Verification Suites

LearnSpace includes comprehensive automated test scripts to ensure system integrity:

### 1. Authentication & Security Suite (37 Tests)
Verifies database credentials, bcrypt hashing, JWT issuance, unauthenticated request rejection, token forgery defense, suspended account blocking, role-based API protection, and audit log tracking:
```bash
node server/scripts/verify-auth.js
```
*Expected: 37 / 37 PASSED (0 failed)*

### 2. Full-Stack LMS Workflow Suite (50 Tests)
Verifies database table existence, course/module/lesson authoring, student self-enrollment, lesson progress recording, assignment submission & grading, timed quiz auto-scoring, and gradebook cross-tabulation:
```bash
node server/scripts/verify-system.js
```
*Expected: 50 / 50 PASSED (0 failed)*

### 3. Production Frontend Build
```bash
npm run build
```
*Expected: Builds cleanly into `dist/` with zero errors.*

---

## 📂 Project Architecture

```text
OS-LEARNSPACE/
├── server/
│   ├── db.js                      # MariaDB connection pool & health check
│   ├── index.js                   # Express application entry point
│   ├── .env.example               # Template environment configuration
│   ├── scripts/
│   │   ├── init-db.js             # DDL schema creation and initial seeding
│   │   ├── verify-auth.js         # 37-test authentication & RBAC suite
│   │   └── verify-system.js       # 50-test end-to-end LMS workflow suite
│   └── src/
│       ├── middleware/
│       │   └── auth.js            # JWT verification & requireRole middleware
│       └── routes/
│           ├── auth.js            # Login, logout, session /me, password reset
│           ├── courses.js         # Course catalog, workspace, modules, lessons
│           ├── assignments.js     # Assignment creation, submissions, grading
│           ├── quizzes.js         # Quizzes, question pools, timed attempts
│           ├── gradebook.js       # Aggregated grade matrix
│           ├── users.js           # User identity & status management
│           ├── enrollments.js     # Course enrollment management
│           ├── categories.js      # Curriculum categorization
│           ├── announcements.js   # Campus & course announcements
│           ├── discussions.js     # Discussion forums & replies
│           ├── materials.js       # Curriculum resources & attachments
│           ├── notifications.js   # In-app notifications
│           ├── reports.js         # Platform analytics & charts
│           ├── settings.js        # Organization settings
│           └── auditLogs.js       # Security audit log inspection
├── src/
│   ├── components/
│   │   ├── common/                # Shared badges, shields, modals
│   │   ├── dashboard/             # Role dashboards (Teacher, Student)
│   │   └── layout/
│   │       └── AppShell.jsx       # Responsive sidebar, topbar & navigation
│   ├── context/
│   │   └── AuthContext.jsx        # Auth state provider, JWT persistence
│   ├── pages/
│   │   ├── admin/                 # 11 Administrator management screens
│   │   ├── teacher/               # 13 Faculty workspace & grading screens
│   │   ├── student/               # 12 Student learning & quiz screens
│   │   ├── auth/
│   │   │   ├── Login.jsx          # Institutional sign-in screen
│   │   │   └── Unauthorized.jsx   # 403 Access Forbidden guard screen
│   │   └── LessonViewer.jsx       # Interactive lesson reader & progress tracker
│   ├── App.jsx                    # Root routing & role-based access gates
│   ├── main.jsx                   # React DOM root
│   └── index.css                  # Tailwind CSS v4 styling rules
├── package.json                   # Root configuration & concurrent scripts
└── README.md                      # Documentation & setup guide
```

---

## 🔒 Security & Access Control

1. **Authentication:**
   - Passwords securely hashed with Bcrypt (10 salt rounds).
   - Signed JSON Web Tokens (JWT) required for all protected endpoints.
   - Session verification via `/api/auth/me` on startup.
2. **Authorization (RBAC):**
   - Server-side role enforcement via `requireRole(...)`.
   - Client-side navigation guards prevent users from accessing out-of-role views.
3. **Session Revocation:**
   - Logout clears tokens and terminates sessions.
   - Nonexistent or suspended user tokens are rejected immediately.
4. **Audit Trail:**
   - System actions, logins, logouts, and password resets are permanently recorded in MariaDB's `audit_logs` table.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
