# 🎓 EduManage — Student Management System (SMS)

A full-stack **MERN (MongoDB, Express, React, Node.js)** Student Management System designed for managing student profiles, academic progress, enrollments, and performance with a modern and intuitive UI.

---

## ✨ Features

- **📊 Interactive Dashboard**:
  - Live metric cards showing Total Students, Active Enrollments, Average GPA, and Department counts.
- **📋 Student Directory & Management**:
  - Full CRUD capabilities: Create, Read, Update, and Delete students.
  - Dedicated **Student Profile Modal** with avatar, academic breakdown, and contact details.
  - Safe **Delete Confirmation Modal** to prevent accidental removals.
- **🔍 Search & Filter Tools**:
  - Real-time search across Name, Roll ID, Email, and Course.
  - Department filtering (School of Engineering, Business, Science, etc.).
  - Status filtering (Active, Inactive, Graduated, Suspended).
  - Multi-criteria sorting (A-Z, Z-A, GPA Highest, Roll Number, Newest).
- **📥 CSV Data Export**:
  - Export filtered student directory into a structured CSV file with a single click.
- **⚡ 1-Click Demo Data Seeder**:
  - Built-in "Seed Demo Data" action on the navbar and dashboard to populate the database with realistic sample records instantly.
- **🛡️ Data Validation & Error Handling**:
  - Field validation with visual feedback for required fields, valid email patterns, roll number formatting, and numeric bounds.
  - Responsive floating Toast alerts for operations (Create, Update, Delete, Seeding).
- **🎨 Modern UI/UX**:
  - Built with Bootstrap 5, Bootstrap Icons, and custom CSS styling. Fully responsive across desktop, tablet, and mobile displays.

---

## 🏗️ Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Axios, Bootstrap 5, Bootstrap Icons
- **Backend**: Node.js, Express.js, Mongoose ODM, CORS
- **Database**: MongoDB (Local or Atlas)

---

## 📁 Project Structure

```
Student Management System/
├── client/                     # Frontend (React + Vite)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Navigation bar with branding & seed action
│   │   │   ├── DashboardStats.jsx       # 4 Metric cards
│   │   │   ├── StudentDetailsModal.jsx  # Student profile details modal
│   │   │   ├── DeleteConfirmationModal.jsx # Delete warning modal
│   │   │   └── Toast.jsx                # Toast alerts
│   │   ├── App.jsx             # Main routing component
│   │   ├── App.css             # Custom styles & design system
│   │   ├── main.jsx            # React root mount
│   │   ├── Users.jsx           # Student Directory & Table
│   │   ├── CreateUser.jsx      # Add Student Form
│   │   └── UpdateUser.jsx      # Edit Student Form
│   ├── index.html              # HTML template
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend (Node.js + Express)
│   ├── models/
│   │   ├── Users.js            # Comprehensive Student Mongoose Schema
│   │   └── Student.js          # Model alias export
│   ├── index.js                # Express API with routes & MongoDB connection
│   ├── .env                    # Environment config (Port & Mongo URI)
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── package.json                # Root package with helper scripts
├── start-project.bat           # 1-click Windows launcher for both servers
└── README.md                   # Documentation
```

---

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v16.0 or higher recommended)
2. **MongoDB** running locally on port `27017` or a MongoDB Atlas connection string.

---

### Quick Launch (Windows)

Simply double-click:
```bat
start-project.bat
```
This opens two terminal windows: one for the backend server on `http://localhost:3001` and one for the React Vite client on `http://localhost:5173`.

---

### Manual Setup & Execution

#### 1. Start MongoDB
Ensure MongoDB is running locally:
```bash
mongod
```

#### 2. Start Backend Server
```bash
cd server
npm start
```
The server will start on `http://localhost:3001`.

#### 3. Start Frontend Client
Open a new terminal window:
```bash
cd client
npm run dev
```
Open your browser and navigate to:
```
http://localhost:5173
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/students` or `/` | Fetch all students (supports `?search=`, `?department=`, `?status=`, `?sortBy=`) |
| `GET` | `/api/students/:id` or `/getUser/:id` | Fetch a single student by ID |
| `POST` | `/api/students` or `/createUser` | Register a new student |
| `PUT` | `/api/students/:id` or `/updateUser/:id` | Update an existing student |
| `DELETE` | `/api/students/:id` or `/deleteUser/:id` | Remove a student |
| `GET` | `/api/stats` | Retrieve aggregated dashboard metrics |
| `POST` | `/api/seed?force=true` | Seed realistic demo students into database |
| `GET` | `/api/health` | API health check & MongoDB connection status |

---

## 🎓 Student Schema Fields

| Field | Type | Description |
|---|---|---|
| `rollNo` | String | Unique Student ID (e.g., `STU-1001`) |
| `name` | String | Student Full Name (Required) |
| `email` | String | Student Email (Unique, Required) |
| `age` | Number | Student Age (1 - 120) |
| `gender` | String | Male / Female / Other / Not Specified |
| `course` | String | Enrolled program (e.g. Computer Science, AI, Business) |
| `department` | String | Department (e.g. School of Engineering) |
| `semester` | String | Current semester (e.g. 1st Semester to 8th Semester) |
| `phone` | String | Contact phone number |
| `address` | String | Residential address / city |
| `gpa` | Number | Grade Point Average (0.00 - 4.00) |
| `status` | String | Active / Inactive / Graduated / Suspended |
| `enrollmentDate` | Date | Date of admission |

---

## 📄 License
MIT
