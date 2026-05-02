# 🏥 МедиКер — Backend API

Node.js + Express + TypeScript REST API for the MediCare Hospital Management System. Connects to PostgreSQL and serves all data to the React frontend.

---

## 📁 Project Structure

```
hospital-backend-kz/
├── src/
│   ├── index.ts                    # Express app entry point, middleware, route mounting
│   ├── types/
│   │   └── index.ts                # All TypeScript interfaces, DTOs, ROLE_PERMISSIONS map
│   ├── db/
│   │   ├── pool.ts                 # PostgreSQL connection pool (pg)
│   │   ├── migrate.ts              # Creates patients, staff, bills, supplies tables + triggers
│   │   ├── migrate_users.ts        # Creates users auth table
│   │   ├── migrate_permissions.ts  # Adds allowed_routes TEXT[] column to users
│   │   ├── seed.ts                 # Sample data in Kazakh Cyrillic
│   │   ├── seed_users.ts           # Default user accounts (bcrypt hashed passwords)
│   │   └── update_to_kazakh.ts     # Migrates existing English DB values to Kazakh
│   ├── middleware/
│   │   ├── auth.ts                 # verifyToken(), requireRole() middleware
│   │   ├── errorHandler.ts         # Global error handler + AppError class + 404
│   │   └── logger.ts               # Coloured HTTP request logger
│   ├── controllers/
│   │   ├── authController.ts       # login, getMe, changePassword, updatePermissions, getAllUsers
│   │   ├── patientController.ts    # Patient CRUD + stats
│   │   ├── staffController.ts      # Staff CRUD + stats
│   │   ├── billController.ts       # Bill CRUD + stats
│   │   └── supplyController.ts     # Supply CRUD + stats + low-stock + stock patch
│   └── routes/
│       ├── auth.ts                 # /api/auth/*
│       ├── patients.ts             # /api/patients/* (role-guarded)
│       ├── staff.ts                # /api/staff/* (role-guarded)
│       ├── bills.ts                # /api/bills/* (role-guarded)
│       └── supplies.ts             # /api/supplies/* (role-guarded)
├── .env.example
├── package.json
└── tsconfig.json
```

---

## ⚙️ Setup

### Prerequisites

- Node.js ≥ 18
- PostgreSQL 16 running locally

### Install dependencies

```bash
npm install
```

### Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=hospital_db
DB_USER=postgres
DB_PASSWORD=your_password_here

CLIENT_URL=http://localhost:5173

JWT_SECRET=your_super_secret_key_minimum_32_characters
JWT_EXPIRES_IN=8h
```

### Database setup (run in order)

```bash
# 1. Create the PostgreSQL database
psql -U postgres -c "CREATE DATABASE hospital_db;"

# 2. Create domain tables + auto-update trigger
npm run db:migrate

# 3. Create users/auth table
npm run db:migrate-users

# 4. Add per-user permissions column
npm run db:migrate-permissions

# 5. Insert sample Kazakh data
npm run db:seed

# 6. Create default login accounts
npm run db:seed-users
```

### Start the server

```bash
npm run dev        # Development (hot reload via ts-node-dev)
npm run build      # Compile TypeScript → dist/
npm start          # Run production build
```

API available at **http://localhost:5000**

---

## 🔄 Full Database Reset

```bash
psql -U postgres -d hospital_db -c "
  DROP TABLE IF EXISTS bills, supplies, patients, staff, users CASCADE;
  DROP FUNCTION IF EXISTS update_updated_at CASCADE;
"
npm run db:migrate
npm run db:migrate-users
npm run db:migrate-permissions
npm run db:seed
npm run db:seed-users
```

---

## 🗄️ Database Schema

### `patients`

| Column     | Type         | Constraint        | Notes                               |
|------------|--------------|-------------------|-------------------------------------|
| id         | SERIAL       | PRIMARY KEY       | Internal auto-increment             |
| patient_id | VARCHAR(10)  | UNIQUE NOT NULL   | Human ID — e.g. `Н-001`            |
| name       | VARCHAR(150) | NOT NULL          |                                     |
| age        | INTEGER      | 1–130             |                                     |
| gender     | VARCHAR(20)  | NOT NULL          | Ер / Әйел / Басқа                   |
| blood      | VARCHAR(5)   | NOT NULL          | A+, B-, AB+, O- etc.                |
| condition  | VARCHAR(100) | NOT NULL          | Diagnosis in Kazakh                 |
| doctor     | VARCHAR(100) | NOT NULL          | Denormalised — not FK to staff      |
| status     | VARCHAR(50)  | DEFAULT Тұрақты   | Тұрақты / Ауыр / Сауығуда etc.      |
| ward       | VARCHAR(50)  | DEFAULT Жалпы     | Жалпы / ЖҚББ / Хирургия etc.        |
| phone      | VARCHAR(30)  | NOT NULL          |                                     |
| admit_date | DATE         | DEFAULT today     |                                     |
| notes      | TEXT         | nullable          | Clinical notes                      |
| created_at | TIMESTAMPTZ  | DEFAULT NOW()     |                                     |
| updated_at | TIMESTAMPTZ  | auto via trigger  |                                     |

### `staff`

| Column     | Type          | Notes                                    |
|------------|---------------|------------------------------------------|
| staff_id   | VARCHAR(10)   | e.g. `Қ-001`                             |
| name       | VARCHAR(150)  |                                          |
| role       | VARCHAR(50)   | Дәрігер / Мейіргер / Зертханашы etc.     |
| specialty  | VARCHAR(100)  | DEFAULT '—'                              |
| status     | VARCHAR(30)   | Кезекте / Кезектен тыс / Демалыста       |
| patients   | INTEGER       | Current patient count, DEFAULT 0         |
| experience | VARCHAR(20)   | e.g. `12 жыл`                            |
| rating     | NUMERIC(3,1)  | Constraint: 1.0–5.0                      |
| phone      | VARCHAR(30)   |                                          |
| email      | VARCHAR(150)  | UNIQUE                                   |

### `bills`

| Column    | Type           | Notes                               |
|-----------|----------------|-------------------------------------|
| bill_id   | VARCHAR(10)    | e.g. `Ш-001`                        |
| patient   | VARCHAR(150)   | Patient name (denormalised)         |
| service   | VARCHAR(100)   | Service type in Kazakh              |
| amount    | NUMERIC(12,2)  | In Kazakhstani Tenge (₸), ≥ 0      |
| bill_date | DATE           | DEFAULT today                       |
| status    | VARCHAR(30)    | Төленді / Күтуде / Мерзімі өткен    |

### `supplies`

| Column    | Type           | Notes                               |
|-----------|----------------|-------------------------------------|
| supply_id | VARCHAR(10)    | e.g. `Д-001`                        |
| name      | VARCHAR(150)   | Drug/supply name in Kazakh          |
| category  | VARCHAR(80)    | Антибиотик / ЖҚЗ / Диабет etc.      |
| stock     | INTEGER        | Current quantity ≥ 0               |
| reorder   | INTEGER        | Low-stock threshold > 0             |
| unit      | VARCHAR(30)    | таблетка / флакон / қорап etc.      |
| cost      | NUMERIC(10,2)  | Unit cost in ₸                      |
| expiry    | VARCHAR(10)    | Format: YYYY-MM                     |

### `users`

| Column         | Type         | Notes                                         |
|----------------|--------------|-----------------------------------------------|
| email          | VARCHAR(150) | UNIQUE — used as login username               |
| password       | VARCHAR(255) | bcrypt hash (cost factor 10)                  |
| name           | VARCHAR(150) |                                               |
| role           | VARCHAR(50)  | Must match a valid staff role string          |
| staff_id       | VARCHAR(10)  | Links to staff table — nullable               |
| is_active      | BOOLEAN      | DEFAULT true; false = login disabled          |
| allowed_routes | TEXT[]       | NULL = role defaults; array = custom override |

---

## 🔌 API Reference

All protected routes require the header:
```
Authorization: Bearer <token>
```

---

### Auth `/api/auth`

| Method | Endpoint                          | Auth      | Description                            |
|--------|-----------------------------------|-----------|----------------------------------------|
| POST   | `/api/auth/login`                 | Public    | Login — returns JWT + user + routes    |
| GET    | `/api/auth/me`                    | Required  | Current user profile + allowed routes  |
| POST   | `/api/auth/change-password`       | Required  | Change own password                    |
| GET    | `/api/auth/users`                 | Admin     | List all user accounts                 |
| PATCH  | `/api/auth/users/:id/permissions` | Admin     | Set per-user route overrides           |

**Login request / response:**
```json
// POST /api/auth/login
{ "email": "admin@medicare.kz", "password": "Admin123!" }

// 200 OK
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "Әкімші",
    "role": "Әкімші",
    "allowedRoutes": ["/dashboard","/patients","/staff","/revenue","/supplies"]
  }
}
```

**Update permissions:**
```json
// PATCH /api/auth/users/3/permissions
{ "allowed_routes": ["/dashboard", "/patients", "/supplies"] }

// Reset to role default:
{ "allowed_routes": null }
```

---

### Patients `/api/patients`

| Method | Endpoint              | Allowed Roles                                |
|--------|-----------------------|----------------------------------------------|
| GET    | `/`                   | Admin, Doctor, Nurse, Receptionist           |
| GET    | `/stats`              | Admin, Doctor, Nurse, Receptionist           |
| GET    | `/:id`                | Admin, Doctor, Nurse, Receptionist           |
| POST   | `/`                   | Admin, Doctor, Receptionist                  |
| PUT    | `/:id`                | Admin, Doctor, Receptionist                  |
| DELETE | `/:id`                | **Admin only**                               |

**Query params (GET `/`):**
`search`, `status`, `doctor`, `ward`, `page`, `limit`

---

### Staff `/api/staff`

| Method | Endpoint    | Allowed Roles         |
|--------|-------------|-----------------------|
| GET    | `/`         | Admin, Doctor         |
| GET    | `/stats`    | Admin, Doctor         |
| GET    | `/:id`      | Admin, Doctor         |
| POST   | `/`         | **Admin only**        |
| PUT    | `/:id`      | **Admin only**        |
| DELETE | `/:id`      | **Admin only**        |

---

### Bills `/api/bills`

| Method | Endpoint    | Allowed Roles              |
|--------|-------------|----------------------------|
| GET    | `/`         | Admin, Receptionist        |
| GET    | `/stats`    | Admin, Receptionist        |
| GET    | `/:id`      | Admin, Receptionist        |
| POST   | `/`         | Admin, Receptionist        |
| PUT    | `/:id`      | Admin, Receptionist        |
| DELETE | `/:id`      | **Admin only**             |

---

### Supplies `/api/supplies`

| Method | Endpoint        | Allowed Roles                    |
|--------|-----------------|----------------------------------|
| GET    | `/`             | Admin, Lab Tech, Pharmacist      |
| GET    | `/stats`        | Admin, Lab Tech, Pharmacist      |
| GET    | `/low-stock`    | Admin, Lab Tech, Pharmacist      |
| GET    | `/:id`          | Admin, Lab Tech, Pharmacist      |
| POST   | `/`             | Admin, Pharmacist                |
| PUT    | `/:id`          | Admin, Pharmacist                |
| PATCH  | `/:id/stock`    | Admin, Lab Tech, Pharmacist      |
| DELETE | `/:id`          | **Admin only**                   |

```json
// PATCH /api/supplies/Д-001/stock
{ "stock": 150 }
```

---

## ❌ Error Format

```json
{ "success": false, "error": "Description of what went wrong" }
```

| Code | Meaning                           |
|------|-----------------------------------|
| 400  | Validation error / bad input      |
| 401  | No token / invalid / expired      |
| 403  | Authenticated but wrong role      |
| 404  | Record not found                  |
| 409  | Conflict (concurrent write)       |
| 500  | Unexpected server error           |

---

## 📜 Scripts

| Command                         | What it does                                 |
|---------------------------------|----------------------------------------------|
| `npm run dev`                   | Dev server with hot reload                   |
| `npm run build`                 | Compile TypeScript → `dist/`                 |
| `npm start`                     | Run compiled production server               |
| `npm run db:migrate`            | Create all domain tables + trigger function  |
| `npm run db:migrate-users`      | Create `users` auth table                    |
| `npm run db:migrate-permissions`| Add `allowed_routes` column to `users`       |
| `npm run db:seed`               | Insert sample Kazakh data (10 supplies, 6 patients, 6 staff, 8 bills) |
| `npm run db:seed-users`         | Insert 7 default login accounts              |
| `npm run db:update-kz`          | Migrate English DB values → Kazakh           |

---

## 👤 Default Accounts

| Role         | Email                        | Password     |
|--------------|------------------------------|--------------|
| Әкімші       | admin@medicare.kz            | Admin123!    |
| Дәрігер      | a.bekova@medicare.kz         | Doctor123!   |
| Дәрігер      | r.omarov@medicare.kz         | Doctor123!   |
| Мейіргер     | a.seitkali@medicare.kz       | Nurse123!    |
| Зертханашы   | b.djak@medicare.kz           | Lab123!      |
| Регистратор  | reception@medicare.kz        | Recept123!   |
| Фармацевт    | pharmacy@medicare.kz         | Pharma123!   |

> ⚠️ Change all passwords before production deployment.
