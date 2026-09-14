export type PatientStatus = 'active' | 'inactive' | 'archived'

export interface PatientConsents {
  marketing?: boolean
  data_processing?: boolean
  medical_records?: boolean
}

export interface Patient {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string | null
  phone: string | null
  date_of_birth: string | null
  notes: string | null
  consents: PatientConsents | null
  status: PatientStatus
  created_at: string
  updated_at: string
}

export interface PatientFormData {
  first_name: string
  last_name: string
  email?: string | null
  phone?: string | null
  date_of_birth?: string | null
  notes?: string | null
  consents?: PatientConsents | null
  status?: PatientStatus
}

export interface PaginationLinks {
  first: string
  last: string
  prev: string | null
  next: string | null
}

export interface PaginationMeta {
  current_page: number
  from: number | null
  last_page: number
  path: string
  per_page: number
  to: number | null
  total: number
}

export interface PatientsListResponse {
  data: Patient[]
  links: PaginationLinks
  meta: PaginationMeta
}

export interface PatientResponse {
  data: Patient
}

export interface PatientFilters {
  status?: PatientStatus
  search?: string
  page?: number
  per_page?: number
}

export const PATIENT_STATUS_LABELS: Record<PatientStatus, string> = {
  active: 'Attivo',
  inactive: 'Inattivo',
  archived: 'Archiviato',
}
