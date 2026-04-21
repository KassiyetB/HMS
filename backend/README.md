# MediCare — Express API

## Stack
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** via `pg`
- **express-validator** for input validation

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create your database
```sql
-- In psql or pgAdmin:
CREATE DATABASE hospital_db;
```

### 3. Configure environment
```bash
cp .env.example .env
# Then edit .env with your DB credentials
```

### 4. Run migrations (creates tables)
```bash
npm run db:migrate
```

### 5. Seed sample data (optional)
```bash
npm run db:seed
```

### 6. Start the dev server
```bash
npm run dev
```

Server runs at **http://localhost:5000**

---

## API Endpoints

### Patients — `/api/patients`

| Method | Endpoint               | Description              |
|--------|------------------------|--------------------------|
| GET    | `/api/patients`        | List all patients        |
| GET    | `/api/patients/stats`  | Get status counts        |
| GET    | `/api/patients/:id`    | Get single patient       |
| POST   | `/api/patients`        | Create patient           |
| PUT    | `/api/patients/:id`    | Update patient           |
| DELETE | `/api/patients/:id`    | Delete patient           |

**Query params for GET /api/patients:**
- `search` — search name, ID, condition
- `status` — filter by status (Stable, Critical, etc.)
- `doctor` — filter by doctor name
- `ward` — filter by ward
- `page`, `limit` — pagination (default: page=1, limit=20)

**POST /api/patients body:**
```json
{
  "name":       "Aisha Nurlanovna",
  "age":        34,
  "gender":     "Female",
  "blood":      "A+",
  "condition":  "Hypertension",
  "doctor":     "Dr. Bekova",
  "status":     "Stable",
  "ward":       "General",
  "phone":      "+7 701 234 5678",
  "admit_date": "2026-04-15",
  "notes":      "Regular BP monitoring needed"
}
```

---

### Staff — `/api/staff`

| Method | Endpoint            | Description           |
|--------|---------------------|-----------------------|
| GET    | `/api/staff`        | List all staff        |
| GET    | `/api/staff/stats`  | Get role/duty counts  |
| GET    | `/api/staff/:id`    | Get single member     |
| POST   | `/api/staff`        | Create staff member   |
| PUT    | `/api/staff/:id`    | Update staff member   |
| DELETE | `/api/staff/:id`    | Delete staff member   |

**POST /api/staff body:**
```json
{
  "name":       "Dr. Asel Bekova",
  "role":       "Doctor",
  "specialty":  "General Surgery",
  "status":     "On Duty",
  "experience": "12 yrs",
  "rating":     4.9,
  "phone":      "+7 701 111 2233",
  "email":      "a.bekova@medicare.kz"
}
```

---

## Connecting to the React Frontend

In each page, replace the `useState(INITIAL_DATA)` with a `useEffect` fetch:

```ts
// src/pages/Patients.tsx
useEffect(() => {
  fetch('http://localhost:5000/api/patients')
    .then(r => r.json())
    .then(res => setPatients(res.data))
}, [])

// Create
const handleAdd = async (form: PatientFormData) => {
  const res = await fetch('http://localhost:5000/api/patients', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ ...form, age: Number(form.age) }),
  })
  const json = await res.json()
  if (json.success) setPatients(ps => [json.data, ...ps])
}

// Update
const handleEdit = async (form: PatientFormData) => {
  const res = await fetch(`http://localhost:5000/api/patients/${modal.patient.patient_id}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ ...form, age: Number(form.age) }),
  })
  const json = await res.json()
  if (json.success) setPatients(ps => ps.map(p => p.patient_id === json.data.patient_id ? json.data : p))
}

// Delete
const handleDelete = async () => {
  await fetch(`http://localhost:5000/api/patients/${modal.patient.patient_id}`, { method: 'DELETE' })
  setPatients(ps => ps.filter(p => p.patient_id !== modal.patient.patient_id))
}
```
