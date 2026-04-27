# МедиКер — Express API (Қазақша)

## Стек
**Node.js + Express + TypeScript + PostgreSQL**

---

## Орнату

```bash
# 1. Тәуелділіктерді орнату
npm install

# 2. PostgreSQL дерекқорын жасау
CREATE DATABASE hospital_db;

# 3. .env файлын баптау
cp .env.example .env
# .env ішіндегі DB_PASSWORD-ты өзгертіңіз

# 4. Кестелерді жасау
npm run db:migrate

# 5. Деректерді жүктеу
npm run db:seed

# 6. Сервер іске қосу
npm run dev
```

Сервер: **http://localhost:5000**

---

## API маршруттары

### Науқастар — `/api/patients`
| Әдіс   | Маршрут                  | Сипаттама                |
|--------|--------------------------|--------------------------|
| GET    | `/api/patients`          | Барлық науқастар         |
| GET    | `/api/patients/stats`    | Мәртебе санақтары        |
| GET    | `/api/patients/:id`      | Бір науқас               |
| POST   | `/api/patients`          | Науқас қосу              |
| PUT    | `/api/patients/:id`      | Науқасты жаңарту         |
| DELETE | `/api/patients/:id`      | Науқасты жою             |

### Қызметкерлер — `/api/staff`
| Әдіс   | Маршрут               | Сипаттама                   |
|--------|-----------------------|-----------------------------|
| GET    | `/api/staff`          | Барлық қызметкерлер         |
| GET    | `/api/staff/stats`    | Лауазым/кезек санақтары     |
| GET    | `/api/staff/:id`      | Бір қызметкер               |
| POST   | `/api/staff`          | Қызметкер қосу              |
| PUT    | `/api/staff/:id`      | Қызметкерді жаңарту         |
| DELETE | `/api/staff/:id`      | Қызметкерді жою             |

### Шоттар — `/api/bills`
| Әдіс   | Маршрут               | Сипаттама                   |
|--------|-----------------------|-----------------------------|
| GET    | `/api/bills`          | Барлық шоттар               |
| GET    | `/api/bills/stats`    | Қаржы статистикасы          |
| GET    | `/api/bills/:id`      | Бір шот                     |
| POST   | `/api/bills`          | Шот қосу                    |
| PUT    | `/api/bills/:id`      | Шотты жаңарту               |
| DELETE | `/api/bills/:id`      | Шотты жою                   |

**GET /api/bills/stats жауабы:**
```json
{
  "total": "8",
  "paid": "4",
  "pending": "2",
  "overdue": "2",
  "total_collected": "77100.00",
  "total_pending": "133000.00",
  "total_overdue": "15200.00",
  "total_billed": "225300.00"
}
```

### Дәрі-дәрмектер — `/api/supplies`
| Әдіс   | Маршрут                      | Сипаттама                   |
|--------|------------------------------|-----------------------------|
| GET    | `/api/supplies`              | Барлық дәрілер              |
| GET    | `/api/supplies/stats`        | Қойма статистикасы          |
| GET    | `/api/supplies/low-stock`    | Аз қалған дәрілер           |
| GET    | `/api/supplies/:id`          | Бір дәрі                    |
| POST   | `/api/supplies`              | Дәрі қосу                   |
| PUT    | `/api/supplies/:id`          | Дәріні жаңарту              |
| PATCH  | `/api/supplies/:id/stock`    | Тек қойманы жаңарту         |
| DELETE | `/api/supplies/:id`          | Дәріні жою                  |

**PATCH /api/supplies/Д-001/stock:**
```json
{ "stock": 150 }
```

---

## Frontend байланысы

`src/services/api.ts` файлына қосыңыз:

```ts
// Шоттар
export const billApi = {
  getAll:   (params?) => request('/bills' + (params ? '?' + new URLSearchParams(params) : '')),
  getStats: ()        => request('/bills/stats'),
  create:   (body)    => request('/bills', { method: 'POST', body: JSON.stringify(body) }),
  update:   (id, body)=> request(`/bills/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete:   (id)      => request(`/bills/${id}`, { method: 'DELETE' }),
}

// Дәрі-дәрмектер
export const supplyApi = {
  getAll:      (params?) => request('/supplies' + (params ? '?' + new URLSearchParams(params) : '')),
  getStats:    ()        => request('/supplies/stats'),
  getLowStock: ()        => request('/supplies/low-stock'),
  create:      (body)    => request('/supplies', { method: 'POST', body: JSON.stringify(body) }),
  update:      (id, body)=> request(`/supplies/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  updateStock: (id, stock)=> request(`/supplies/${id}/stock`, { method: 'PATCH', body: JSON.stringify({ stock }) }),
  delete:      (id)      => request(`/supplies/${id}`, { method: 'DELETE' }),
}
```
