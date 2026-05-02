# 🏥 ErentauMed — Frontend Dashboard

React 18 + TypeScript single-page application for the MediCare Hospital Management System. Dark-themed, fully localised in **Kazakh Cyrillic**, with role-based navigation and live backend integration.

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── main.tsx                    # React entry point — BrowserRouter + AuthProvider
│   ├── App.tsx                     # Route definitions + ProtectedRoute wrappers
│   ├── index.css                   # Global CSS variables (design tokens), resets, utilities
│   │
│   ├── context/
│   │   └── AuthContext.tsx         # JWT storage, login/logout, canAccess(), user state
│   │
│   ├── services/
│   │   └── api.ts                  # All fetch() calls — auto-injects Bearer token
│   │
│   ├── hooks/
│   │   └── useApi.tsx              # Generic async state hook, <Spinner />, <ErrorBox />
│   │
│   ├── i18n/
│   │   └── kz.ts                   # Full Kazakh Cyrillic translation object (200+ keys)
│   │
│   ├── data/
│   │   └── mockData.ts             # Typed constants — status lists, ward names, etc. (Kazakh)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── DashboardLayout.tsx # Sidebar (role-filtered nav) + topbar + user menu
│   │   ├── ui/
│   │   │   └── index.tsx           # Shared components: Badge, StatCard, Toast, Avatar, Modal, Field
│   │   └── ProtectedRoute.tsx      # Auth guard — redirects to /login or shows 403
│   │
│   └── pages/
│       ├── Login.tsx               # Login form + demo account selector
│       ├── Dashboard.tsx           # Overview — stat cards + area/bar/pie charts
│       ├── Patients.tsx            # Patient CRUD — table, modals, search, filters
│       ├── Staff.tsx               # Staff CRUD — card grid + permission management modal
│       ├── Revenue.tsx             # Billing — bills table + financial charts
│       ├── Supplies.tsx            # Inventory — table + low-stock alert banner
│       └── NotFound.tsx            # 404 page
│
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## ⚙️ Setup

### Prerequisites

- Node.js ≥ 18
- Backend API running (see `root/backend/`)

### Install

```bash
npm install
```

### Configure environment

```bash
cp .env.example .env
```

`.env` contains one variable:
```env
VITE_API_URL=http://localhost:5000/api
```

### Run

```bash
npm run dev        # Dev server at http://localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview production build
```

---

## 🔐 Authentication Flow

```
User enters email + password
        ↓
POST /api/auth/login
        ↓
Backend returns JWT token + user object + allowedRoutes[]
        ↓
AuthContext stores token in localStorage
        ↓
All subsequent API calls include: Authorization: Bearer <token>
        ↓
Sidebar filters nav links to only show allowedRoutes
        ↓
ProtectedRoute blocks direct URL access to unauthorised pages
```

The `AuthContext` exposes:

| Member       | Type                          | Description                         |
|--------------|-------------------------------|-------------------------------------|
| `user`       | `AuthUser \| null`            | Current logged-in user              |
| `token`      | `string \| null`              | JWT token string                    |
| `loading`    | `boolean`                     | True while restoring session        |
| `login()`    | `(email, password) => Promise`| Calls API, stores token + user      |
| `logout()`   | `() => void`                  | Clears localStorage + state         |
| `canAccess()`| `(route: string) => boolean`  | Checks user.allowedRoutes           |

---

## 🧩 Shared UI Components (`src/components/ui/index.tsx`)

| Component   | Props                                  | Description                              |
|-------------|----------------------------------------|------------------------------------------|
| `<Badge>`   | `status: string`                       | Coloured status pill — maps status to colour |
| `<StatCard>`| `label, value, sub?, color?`           | Dashboard metric card                    |
| `<Toast>`   | `message, color?`                      | Fixed-position notification              |
| `<Avatar>`  | `name, size?, color?`                  | Initials circle avatar                   |
| `<Modal>`   | `title, onClose, children, maxWidth?`  | Overlay modal with Escape key handler    |
| `<Field>`   | `label, half?, error?, children`       | Form field wrapper with label + error    |

**Status colour map:**

| Status (Kazakh)     | Colour            |
|---------------------|-------------------|
| Тұрақты             | `--green`         |
| Ауыр                | `--red`           |
| Сауығуда            | `--amber`         |
| Операциядан кейін   | `--purple`        |
| Шығарылды           | `--muted`         |
| Кезекте             | `--green`         |
| Кезектен тыс        | `--muted`         |
| Демалыста           | `--amber`         |
| Төленді             | `--green`         |
| Күтуде              | `--amber`         |
| Мерзімі өткен       | `--red`           |

---

## 🎨 Design Tokens (`src/index.css`)

All colours, spacing, and sizing values are defined as CSS custom properties:

```css
:root {
  --bg:        #0d1117;   /* Page background */
  --surface:   #161b22;   /* Card / sidebar background */
  --surface-2: #1c2128;   /* Elevated surface */
  --border:    #21262d;   /* Subtle borders */
  --border-2:  #30363d;   /* Input borders */
  --text:      #e6edf3;   /* Primary text */
  --muted:     #8b949e;   /* Secondary text */
  --accent:    #58a6ff;   /* Primary blue */
  --green:     #3fb950;
  --red:       #f85149;
  --amber:     #d29922;
  --purple:    #bc8cff;
  --teal:      #39d353;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --sidebar-w: 220px;
  --topbar-h:  60px;
}
```

---

## 📄 Pages

### `/login` — Login
- Email + password form
- Show/hide password toggle
- Demo account click-to-fill panel (all 6 roles)
- Redirects to `/dashboard` on success

### `/dashboard` — Overview
- 5 stat cards (patients, critical, staff on duty, low stock, revenue)
- Area chart: revenue vs expenses (7 months)
- Pie chart: revenue by department
- Bar chart: weekly admissions
- Stats pulled live from `/api/patients/stats` and `/api/staff/stats`

### `/patients` — Patient Management
- Paginated table with search (name / ID / diagnosis) and multi-filter (status + doctor)
- Add patient — validated form, 11 fields
- Edit patient — pre-populated form
- View patient — detail modal
- Delete patient — confirmation dialog (Admin only)
- Live stat cards update from backend

### `/staff` — Staff Management
- Card grid layout (not table)
- Role-aware UI — Doctors see cards without edit/delete buttons
- **🔐 Permission modal** — Admin can toggle per-user route access with visual checkboxes
- Toggle between "role default" and "custom override" modes

### `/revenue` — Revenue & Billing
- Bills table with search + status filter
- Add / Edit / Delete bills
- Area chart and pie chart (same as dashboard)
- Aggregate stat cards: collected, pending, overdue

### `/supplies` — Medical Supplies
- Inventory table with stock-level progress bars
- Low-stock alert banner (auto-shown when any item is below reorder threshold)
- Stock status badges: Жеткілікті / Аз қалды / Сын деңгей
- Add / Edit / Delete / View supplies
- Filter by category and stock status

---

## 🌐 Localisation (`src/i18n/kz.ts`)

All UI text is stored in a single typed TypeScript object. Example structure:

```typescript
export const kz = {
  nav: { dashboard, patients, staff, revenue, supplies },
  patients: {
    title, subtitle, addPatient,
    form: { fullName, age, gender, ... },
    errors: { nameRequired, ageInvalid, ... },
    toast: { added, updated, removed, ... },
    col: { id, patient, age, condition, ... },
  },
  status: { stable, critical, recovering, ... },
  // 200+ keys total
}
```

To change any UI text, edit only `src/i18n/kz.ts`.

---

## 🔗 API Integration (`src/services/api.ts`)

All backend communication goes through a single `request<T>()` helper that automatically injects the JWT token:

```typescript
const patientApi = {
  getAll:   (params?) => request('/patients' + queryString),
  getStats: ()        => request('/patients/stats'),
  create:   (body)    => request('/patients', { method: 'POST', body }),
  update:   (id, body)=> request(`/patients/${id}`, { method: 'PUT', body }),
  delete:   (id)      => request(`/patients/${id}`, { method: 'DELETE' }),
}
```

Available API objects: `patientApi`, `staffApi`, `billApi` (in Revenue), `supplyApi` (in Supplies), `userApi`.

---

## 📦 Dependencies

| Package             | Version  | Purpose                              |
|---------------------|----------|--------------------------------------|
| react               | ^18.3.1  | UI framework                         |
| react-dom           | ^18.3.1  | DOM rendering                        |
| react-router-dom    | ^6.26.1  | Client-side routing                  |
| recharts            | ^2.12.7  | Charts (area, bar, pie)              |
| typescript          | ^5.5.3   | Type safety                          |
| vite                | ^5.4.2   | Build tool and dev server            |
| @vitejs/plugin-react| ^4.3.1   | Vite React plugin                    |
| @types/react        | ^18.3.3  | TypeScript definitions               |
