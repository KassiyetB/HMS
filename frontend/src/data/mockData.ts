// ─────────────────────────────────────────────────
//  Mock Data — replace with real API calls later
// ─────────────────────────────────────────────────

export type PatientStatus = 'Stable' | 'Critical' | 'Recovering' | 'Post-Op' | 'Discharged'
export type StaffStatus   = 'On Duty' | 'Off Duty' | 'On Leave'
export type Ward          = 'General' | 'Cardiology' | 'Surgery' | 'Pediatrics' | 'ICU'
export type BloodType     = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
export type StaffRole     = 'Doctor' | 'Nurse' | 'Lab Technician' | 'Receptionist' | 'Pharmacist'

export interface Patient {
  id:        string
  name:      string
  age:       number
  gender:    string
  blood:     BloodType
  condition: string
  doctor:    string
  status:    PatientStatus
  ward:      Ward
  phone:     string
  admit:     string
  notes:     string
}

export interface StaffMember {
  id:        string
  name:      string
  role:      StaffRole
  specialty: string
  status:    StaffStatus
  patients:  number
  exp:       string
  rating:    number
  phone:     string
  email:     string
}

export interface Supply {
  id:       string
  name:     string
  category: string
  stock:    number
  reorder:  number
  unit:     string
  cost:     number
  expiry:   string
}

export interface RevenueEntry { month: string; revenue: number; expenses: number }
export interface DeptRevenue  { name: string;  value: number }
export interface AdmitEntry   { day: string;   admits: number }

export const DOCTORS:        string[]        = ['Dr. Bekova', 'Dr. Omarov', 'Dr. Sultanov', 'Dr. Kasymova']
export const CONDITIONS:     string[]        = ['Hypertension', 'Type 2 Diabetes', 'Fracture', 'Appendicitis', 'Cardiac Arrhythmia', 'Pneumonia', 'Asthma', 'Gastritis', 'Migraine', 'Other']
export const STATUSES:       PatientStatus[] = ['Stable', 'Critical', 'Recovering', 'Post-Op', 'Discharged']
export const WARDS:          Ward[]          = ['General', 'Cardiology', 'Surgery', 'Pediatrics', 'ICU']
export const BLOOD_TYPES:    BloodType[]     = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
export const SPECIALTIES:    string[]        = ['General Surgery', 'Cardiology', 'Internal Medicine', 'Pediatrics', 'Radiology', 'Orthopedics']
export const STAFF_STATUSES: StaffStatus[]   = ['On Duty', 'Off Duty', 'On Leave']
export const STAFF_ROLES:    StaffRole[]     = ['Doctor', 'Nurse', 'Lab Technician', 'Receptionist', 'Pharmacist']

export const INITIAL_PATIENTS: Patient[] = [
  { id: 'P-001', name: 'Aisha Nurlanovna',   age: 34, gender: 'Female', blood: 'A+',  condition: 'Hypertension',       doctor: 'Dr. Bekova',   status: 'Stable',     ward: 'General',    phone: '+7 701 234 5678', admit: '2026-04-15', notes: 'Regular BP monitoring needed' },
  { id: 'P-002', name: 'Daniyar Seitkali',   age: 58, gender: 'Male',   blood: 'B+',  condition: 'Type 2 Diabetes',    doctor: 'Dr. Omarov',   status: 'Critical',   ward: 'ICU',        phone: '+7 702 345 6789', admit: '2026-04-18', notes: 'Insulin adjustment required' },
  { id: 'P-003', name: 'Elena Marchenko',    age: 45, gender: 'Female', blood: 'O+',  condition: 'Fracture',           doctor: 'Dr. Bekova',   status: 'Recovering', ward: 'Surgery',    phone: '+7 707 456 7890', admit: '2026-04-10', notes: 'Post-op leg fracture, physiotherapy planned' },
  { id: 'P-004', name: 'Marat Akhmetov',     age: 29, gender: 'Male',   blood: 'AB-', condition: 'Appendicitis',       doctor: 'Dr. Sultanov', status: 'Post-Op',    ward: 'Surgery',    phone: '+7 705 567 8901', admit: '2026-04-19', notes: 'Laparoscopic appendectomy done' },
  { id: 'P-005', name: 'Zarina Ospanova',    age: 62, gender: 'Female', blood: 'A-',  condition: 'Cardiac Arrhythmia', doctor: 'Dr. Omarov',   status: 'Stable',     ward: 'Cardiology', phone: '+7 700 678 9012', admit: '2026-04-12', notes: 'On antiarrhythmic medication' },
  { id: 'P-006', name: 'Timur Bekzhanov',    age: 41, gender: 'Male',   blood: 'O-',  condition: 'Pneumonia',          doctor: 'Dr. Sultanov', status: 'Stable',     ward: 'General',    phone: '+7 771 789 0123', admit: '2026-04-17', notes: 'Responding well to antibiotics' },
]

export const INITIAL_STAFF: StaffMember[] = [
  { id: 'S-001', name: 'Dr. Asel Bekova',     role: 'Doctor',         specialty: 'General Surgery',   status: 'On Duty',  patients: 14, exp: '12 yrs', rating: 4.9, phone: '+7 701 111 2233', email: 'a.bekova@medicare.kz' },
  { id: 'S-002', name: 'Dr. Ruslan Omarov',   role: 'Doctor',         specialty: 'Cardiology',        status: 'On Duty',  patients: 9,  exp: '18 yrs', rating: 4.8, phone: '+7 702 222 3344', email: 'r.omarov@medicare.kz' },
  { id: 'S-003', name: 'Dr. Kairat Sultanov', role: 'Doctor',         specialty: 'Internal Medicine', status: 'Off Duty', patients: 11, exp: '7 yrs',  rating: 4.7, phone: '+7 707 333 4455', email: 'k.sultanov@medicare.kz' },
  { id: 'S-004', name: 'Dr. Nurgul Kasymova', role: 'Doctor',         specialty: 'Pediatrics',        status: 'On Duty',  patients: 6,  exp: '10 yrs', rating: 4.9, phone: '+7 705 444 5566', email: 'n.kasymova@medicare.kz' },
  { id: 'S-005', name: 'Ainur Seitkali',      role: 'Nurse',          specialty: '—',                 status: 'On Duty',  patients: 0,  exp: '5 yrs',  rating: 4.6, phone: '+7 700 555 6677', email: 'a.seitkali@medicare.kz' },
  { id: 'S-006', name: 'Bekzat Dzhaksybekov', role: 'Lab Technician', specialty: 'Haematology',       status: 'On Duty',  patients: 0,  exp: '3 yrs',  rating: 4.5, phone: '+7 771 666 7788', email: 'b.djak@medicare.kz' },
]

export const INITIAL_SUPPLIES: Supply[] = [
  { id: 'M-001', name: 'Paracetamol 500mg',   category: 'Analgesics',  stock: 420, reorder: 100, unit: 'tablets',  cost: 0.05,  expiry: '2027-06' },
  { id: 'M-002', name: 'Amoxicillin 250mg',   category: 'Antibiotics', stock: 85,  reorder: 100, unit: 'capsules', cost: 0.18,  expiry: '2026-12' },
  { id: 'M-003', name: 'Insulin Glargine',    category: 'Endocrine',   stock: 32,  reorder: 50,  unit: 'vials',    cost: 24.50, expiry: '2026-09' },
  { id: 'M-004', name: 'IV Saline 0.9%',      category: 'Fluids',      stock: 210, reorder: 80,  unit: 'bags',     cost: 1.20,  expiry: '2027-01' },
  { id: 'M-005', name: 'Surgical Gloves (L)', category: 'PPE',         stock: 18,  reorder: 30,  unit: 'boxes',    cost: 4.80,  expiry: '2028-06' },
  { id: 'M-006', name: 'Omeprazole 20mg',     category: 'GI',          stock: 155, reorder: 60,  unit: 'capsules', cost: 0.12,  expiry: '2027-03' },
  { id: 'M-007', name: 'Metformin 500mg',     category: 'Diabetes',    stock: 9,   reorder: 120, unit: 'tablets',  cost: 0.08,  expiry: '2026-11' },
]

export const REVENUE_DATA: RevenueEntry[] = [
  { month: 'Oct', revenue: 182000, expenses: 94000  },
  { month: 'Nov', revenue: 196000, expenses: 101000 },
  { month: 'Dec', revenue: 174000, expenses: 98000  },
  { month: 'Jan', revenue: 211000, expenses: 107000 },
  { month: 'Feb', revenue: 228000, expenses: 112000 },
  { month: 'Mar', revenue: 243000, expenses: 118000 },
  { month: 'Apr', revenue: 189000, expenses: 97000  },
]

export const DEPT_REVENUE: DeptRevenue[] = [
  { name: 'Cardiology',   value: 38 },
  { name: 'Surgery',      value: 27 },
  { name: 'Internal Med', value: 18 },
  { name: 'Pediatrics',   value: 11 },
  { name: 'Other',        value: 6  },
]

export const ADMIT_DATA: AdmitEntry[] = [
  { day: 'Mon', admits: 8  },
  { day: 'Tue', admits: 12 },
  { day: 'Wed', admits: 7  },
  { day: 'Thu', admits: 15 },
  { day: 'Fri', admits: 11 },
  { day: 'Sat', admits: 5  },
  { day: 'Sun', admits: 4  },
]
