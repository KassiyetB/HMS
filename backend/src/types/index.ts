// ── Patient ───────────────────────────────────────
export interface Patient {
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

export interface CreatePatientDTO {
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

export type UpdatePatientDTO = Partial<CreatePatientDTO>

// ── Staff ─────────────────────────────────────────
export interface StaffMember {
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

export interface CreateStaffDTO {
  name:       string
  role:       string
  specialty:  string
  status:     string
  patients?:  number
  experience: string
  rating:     number
  phone:      string
  email:      string
}

export type UpdateStaffDTO = Partial<CreateStaffDTO>

// ── API Response wrapper ──────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data?:   T
  error?:  string
  message?: string
}

// ── Query params ──────────────────────────────────
export interface PatientQuery {
  search?:  string
  status?:  string
  doctor?:  string
  ward?:    string
  page?:    string
  limit?:   string
}

export interface StaffQuery {
  search?:  string
  role?:    string
  status?:  string
  page?:    string
  limit?:   string
}
