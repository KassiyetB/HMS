export type PatientStatus = 'Тұрақты' | 'Ауыр' | 'Сауығуда' | 'Операциядан кейін' | 'Шығарылды'
export type StaffStatus   = 'Кезекте' | 'Кезектен тыс' | 'Демалыста'
export type Ward          = 'Жалпы' | 'Кардиология' | 'Хирургия' | 'Педиатрия' | 'ЖҚББ'
export type BloodType     = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
export type StaffRole     = 'Дәрігер' | 'Мейіргер' | 'Зертханашы' | 'Регистратор' | 'Фармацевт'

export interface Patient {
  id:         number
  patient_id: string
  name:       string
  age:        number
  gender:     string
  blood:      BloodType
  condition:  string
  doctor:     string
  status:     PatientStatus
  ward:       Ward
  phone:      string
  admit_date: string
  notes:      string | null
  created_at: string
  updated_at: string
}

export interface StaffMember {
  id:         number
  staff_id:   string
  name:       string
  role:       StaffRole
  specialty:  string
  status:     StaffStatus
  patients:   number
  experience: string
  rating:     number
  phone:      string
  email:      string
  created_at: string
  updated_at: string
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

export const DOCTORS:        string[]        = ['Др. Бекова', 'Др. Омаров', 'Др. Сұлтанов', 'Др. Қасымова']
export const CONDITIONS:     string[]        = ['Гипертония', 'Қант диабеті 2 типі', 'Сынық', 'Аппендицит', 'Жүрек аритмиясы', 'Пневмония', 'Астма', 'Гастрит', 'Мигрень', 'Басқа']
export const STATUSES:       PatientStatus[] = ['Тұрақты', 'Ауыр', 'Сауығуда', 'Операциядан кейін', 'Шығарылды']
export const WARDS:          Ward[]          = ['Жалпы', 'Кардиология', 'Хирургия', 'Педиатрия', 'ЖҚББ']
export const BLOOD_TYPES:    BloodType[]     = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
export const SPECIALTIES:    string[]        = ['Жалпы хирургия', 'Кардиология', 'Ішкі аурулар', 'Педиатрия', 'Радиология', 'Ортопедия']
export const STAFF_STATUSES: StaffStatus[]   = ['Кезекте', 'Кезектен тыс', 'Демалыста']
export const STAFF_ROLES:    StaffRole[]     = ['Дәрігер', 'Мейіргер', 'Зертханашы', 'Регистратор', 'Фармацевт']
export const GENDERS:        string[]        = ['Ер', 'Әйел', 'Басқа']
export const SERVICES:       string[]        = ['Кеңес беру', 'Хирургия', 'Зертханалық талдау', 'Рентген / Бейнелеу', 'ЖҚББ орны', 'Физиотерапия', 'Дәрі-дәрмек', 'Жедел жәрдем']
export const CATEGORIES:     string[]        = ['Ауырсынуды басатын', 'Антибиотик', 'Эндокрин', 'Сұйықтық', 'ЖҚЗ', 'АІЖ', 'Диабет', 'Кардиология', 'Басқа']
export const UNITS:          string[]        = ['таблетка', 'капсула', 'флакон', 'қап', 'қорап', 'шише', 'ампула', 'пакет']

export const REVENUE_DATA: RevenueEntry[] = [
  { month: 'Қаз', revenue: 182000, expenses: 94000  },
  { month: 'Қар', revenue: 196000, expenses: 101000 },
  { month: 'Жел', revenue: 174000, expenses: 98000  },
  { month: 'Қаң', revenue: 211000, expenses: 107000 },
  { month: 'Ақп', revenue: 228000, expenses: 112000 },
  { month: 'Нау', revenue: 243000, expenses: 118000 },
  { month: 'Сәу', revenue: 189000, expenses: 97000  },
]

export const DEPT_REVENUE: DeptRevenue[] = [
  { name: 'Кардиология',   value: 38 },
  { name: 'Хирургия',      value: 27 },
  { name: 'Ішкі аурулар',  value: 18 },
  { name: 'Педиатрия',     value: 11 },
  { name: 'Басқа',         value: 6  },
]

export const ADMIT_DATA: AdmitEntry[] = [
  { day: 'Дс', admits: 8  },
  { day: 'Сс', admits: 12 },
  { day: 'Ср', admits: 7  },
  { day: 'Бс', admits: 15 },
  { day: 'Жм', admits: 11 },
  { day: 'Сб', admits: 5  },
  { day: 'Жк', admits: 4  },
]
