# 🏥 ErentauMed — Hospital Management System

A full-stack hospital management system built for **ErentauMed LLP**, a private medical care centre in Almaty, Kazakhstan. The system digitalises core administrative workflows — patient records, staff management, medical supplies inventory, and billing — with a fully **Kazakh Cyrillic** interface and **role-based access control**.

---

## 📁 Project Structure

```
HMS/
├── backend/     # Node.js + Express + TypeScript REST API
├── frontend/   # React 18 + TypeScript frontend (Vite)
└── README.md                # ← You are here
```

---

## ⚙️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, TypeScript, Vite, Recharts |
| Backend    | Node.js, Express, TypeScript        |
| Database   | PostgreSQL 16                       |
| Auth       | JWT (jsonwebtoken) + bcryptjs       |
| Language   | Kazakh Cyrillic (full localisation) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- PostgreSQL 16 running locally
- npm

### 1. Clone and install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env — set DB_PASSWORD and JWT_SECRET
```

```bash
# Frontend
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api  (already set)
```

### 3. Set up the database

```bash
cd backend

# Create tables
npm run db:migrate

# Create users table
npm run db:migrate-users

# Add permissions column
npm run db:migrate-permissions

# Seed sample data
npm run db:seed

# Seed user accounts
npm run db:seed-users
```

### 4. Run both servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 👤 Default Login Accounts

| Role         | Email                        | Password     |
|--------------|------------------------------|--------------|
| Әкімші (Admin)      | admin@medicare.kz            | Admin123!    |
| Дәрігер (Doctor)    | a.bekova@medicare.kz         | Doctor123!   |
| Дәрігер (Doctor)    | r.omarov@medicare.kz         | Doctor123!   |
| Мейіргер (Nurse)    | a.seitkali@medicare.kz       | Nurse123!    |
| Зертханашы (Lab)    | b.djak@medicare.kz           | Lab123!      |
| Регистратор         | reception@medicare.kz        | Recept123!   |
| Фармацевт           | pharmacy@medicare.kz         | Pharma123!   |

> ⚠️ Change all passwords before any production deployment.

---

## 🔐 Role Permissions

| Role         | Dashboard | Patients | Staff    | Revenue | Supplies |
|--------------|:---------:|:--------:|:--------:|:-------:|:--------:|
| Әкімші       | ✅        | ✅       | ✅ Full  | ✅      | ✅       |
| Дәрігер      | ✅        | ✅       | 👁 View  | ❌      | ❌       |
| Мейіргер     | ✅        | ✅       | ❌       | ❌      | ❌       |
| Зертханашы   | ✅        | ❌       | ❌       | ❌      | ✅       |
| Регистратор  | ✅        | ✅       | ❌       | ✅      | ❌       |
| Фармацевт    | ✅        | ❌       | ❌       | ❌      | ✅       |

> The Admin can grant individual users access to additional routes via the **🔐 permission panel** inside the Staff page.

---

## 📋 Features

- **Patient Management** — full CRUD with search, status filtering, clinical notes
- **Staff Management** — personnel records with per-user permission overrides
- **Revenue & Billing** — financial tracking with Paid / Pending / Overdue statuses
- **Medical Supplies** — inventory with low-stock alerts and reorder thresholds
- **Analytics Dashboard** — area charts, bar charts, pie charts (Recharts)
- **Authentication** — JWT tokens, bcrypt password hashing, 8-hour sessions
- **Kazakh Localisation** — full UI, database values, and error messages in Kazakh Cyrillic

---

## 📄 Documentation

- [`hospital-backend/README.md`](./backend/README.md) — API reference, database setup, endpoints
- [`frontend/README.md`](./frontend/README.md) — Frontend architecture, components, pages
