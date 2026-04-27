// ── Науқас (Patient) ──────────────────────────────
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
  status?:    string
  ward?:      string
  phone:      string
  admit_date?: string
  notes?:     string
}

export type UpdatePatientDTO = Partial<CreatePatientDTO>

// ── Қызметкер (Staff) ─────────────────────────────
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
  specialty?: string
  status?:    string
  patients?:  number
  experience: string
  rating:     number
  phone:      string
  email:      string
}

export type UpdateStaffDTO = Partial<CreateStaffDTO>

// ── Шот (Bill) ────────────────────────────────────
export interface Bill {
  id:         number
  bill_id:    string
  patient:    string
  service:    string
  amount:     number
  bill_date:  string
  status:     string
  created_at: string
  updated_at: string
}

export interface CreateBillDTO {
  patient:    string
  service:    string
  amount:     number
  bill_date?: string
  status?:    string
}

export type UpdateBillDTO = Partial<CreateBillDTO>

// ── Дәрі-дәрмек (Supply) ─────────────────────────
export interface Supply {
  id:         number
  supply_id:  string
  name:       string
  category:   string
  stock:      number
  reorder:    number
  unit:       string
  cost:       number
  expiry:     string
  created_at: string
  updated_at: string
}

export interface CreateSupplyDTO {
  name:     string
  category: string
  stock:    number
  reorder:  number
  unit:     string
  cost:     number
  expiry:   string
}

export type UpdateSupplyDTO = Partial<CreateSupplyDTO>

// ── API жауабы ────────────────────────────────────
export interface ApiResponse<T> {
  success:  boolean
  data?:    T
  error?:   string
  message?: string
}

// ── Сұраныс параметрлері ──────────────────────────
export interface PatientQuery  { search?: string; status?: string; doctor?: string; ward?: string; page?: string; limit?: string }
export interface StaffQuery    { search?: string; role?: string; status?: string; page?: string; limit?: string }
export interface BillQuery     { search?: string; status?: string; page?: string; limit?: string }
export interface SupplyQuery   { search?: string; category?: string; page?: string; limit?: string }
