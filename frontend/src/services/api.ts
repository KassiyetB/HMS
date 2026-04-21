// ─────────────────────────────────────────────────
//  API Service — all backend calls live here
//  Base URL reads from .env (VITE_API_URL)
// ─────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

// ── Generic fetch wrapper ─────────────────────────
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const json = await res.json()

  if (!res.ok || !json.success) {
    throw new Error(json.error ?? `Request failed: ${res.status}`)
  }

  return json
}

// ─────────────────────────────────────────────────
//  Patient API
// ─────────────────────────────────────────────────
export interface PatientRow {
  id:         number
  patient_id: string
  name:       string
  age:        number
  gender:     string
  blood:      string
  condition:  string
  doctor:     string
  status:     string
  ward:       string
  phone:      string
  admit_date: string
  notes:      string | null
  created_at: string
  updated_at: string
}

export interface PatientListResponse {
  success: boolean
  data:    PatientRow[]
  total:   number
  page:    number
  limit:   number
}

export interface PatientStatsResponse {
  success: boolean
  data: {
    total:      string
    critical:   string
    stable:     string
    recovering: string
    post_op:    string
    discharged: string
  }
}

export interface CreatePatientPayload {
  name:       string
  age:        number
  gender:     string
  blood:      string
  condition:  string
  doctor:     string
  status:     string
  ward:       string
  phone:      string
  admit_date: string
  notes?:     string
}

export type UpdatePatientPayload = Partial<CreatePatientPayload>

export const patientApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<PatientListResponse>(`/patients${qs}`)
  },

  getStats: () => request<PatientStatsResponse>('/patients/stats'),

  getById: (id: string) => request<{ success: boolean; data: PatientRow }>(`/patients/${id}`),

  create: (body: CreatePatientPayload) =>
    request<{ success: boolean; data: PatientRow; message: string }>('/patients', {
      method: 'POST',
      body:   JSON.stringify(body),
    }),

  update: (id: string, body: UpdatePatientPayload) =>
    request<{ success: boolean; data: PatientRow; message: string }>(`/patients/${id}`, {
      method: 'PUT',
      body:   JSON.stringify(body),
    }),

  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/patients/${id}`, { method: 'DELETE' }),
}

// ─────────────────────────────────────────────────
//  Staff API
// ─────────────────────────────────────────────────
export interface StaffRow {
  id:         number
  staff_id:   string
  name:       string
  role:       string
  specialty:  string
  status:     string
  patients:   number
  experience: string
  rating:     number
  phone:      string
  email:      string
  created_at: string
  updated_at: string
}

export interface StaffListResponse {
  success: boolean
  data:    StaffRow[]
  total:   number
  page:    number
  limit:   number
}

export interface StaffStatsResponse {
  success: boolean
  data: {
    total:      string
    on_duty:    string
    off_duty:   string
    on_leave:   string
    doctors:    string
    nurses:     string
    avg_rating: string
  }
}

export interface CreateStaffPayload {
  name:       string
  role:       string
  specialty:  string
  status:     string
  experience: string
  rating:     number
  phone:      string
  email:      string
  patients?:  number
}

export type UpdateStaffPayload = Partial<CreateStaffPayload>

export const staffApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<StaffListResponse>(`/staff${qs}`)
  },

  getStats: () => request<StaffStatsResponse>('/staff/stats'),

  getById: (id: string) => request<{ success: boolean; data: StaffRow }>(`/staff/${id}`),

  create: (body: CreateStaffPayload) =>
    request<{ success: boolean; data: StaffRow; message: string }>('/staff', {
      method: 'POST',
      body:   JSON.stringify(body),
    }),

  update: (id: string, body: UpdateStaffPayload) =>
    request<{ success: boolean; data: StaffRow; message: string }>(`/staff/${id}`, {
      method: 'PUT',
      body:   JSON.stringify(body),
    }),

  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/staff/${id}`, { method: 'DELETE' }),
}
