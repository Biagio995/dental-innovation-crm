export interface Patient {
  id: number
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  date_of_birth: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PatientFormData {
  first_name: string
  last_name: string
  email?: string
  phone?: string
  date_of_birth?: string
  notes?: string
}

export interface PatientsListResponse {
  data: Patient[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface PatientFilters {
  search?: string
  page?: number
  per_page?: number
}
