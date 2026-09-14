import type { Patient } from './patient'

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'no_show' | 'completed'

export interface Visit {
  id: number
  appointment_id: number
  patient_id: number
  treatment_notes: string | null
  recommended_recall_date: string | null
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: number
  patient_id: number
  patient?: Patient
  scheduled_at: string
  duration_minutes: number
  type: string | null
  notes: string | null
  status: AppointmentStatus
  visit?: Visit | null
  created_at: string
  updated_at: string
}

export interface AppointmentFormData {
  patient_id: number
  scheduled_at: string
  duration_minutes?: number
  type?: string | null
  notes?: string | null
}

export interface AppointmentStatusUpdate {
  status: AppointmentStatus
}

export interface VisitCompleteData {
  treatment_notes?: string
  recommended_recall_date?: string
}

export interface AppointmentsListResponse {
  data: Appointment[]
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number | null
    last_page: number
    path: string
    per_page: number
    to: number | null
    total: number
  }
}

export interface AppointmentResponse {
  data: Appointment
}

export interface VisitResponse {
  data: Visit
}

export interface AppointmentFilters {
  patient_id?: number
  status?: AppointmentStatus
  date?: string
  from?: string
  to?: string
  page?: number
  per_page?: number
}

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: 'Programmato',
  confirmed: 'Confermato',
  completed: 'Completato',
  cancelled: 'Annullato',
  no_show: 'Non presentato',
}

export const APPOINTMENT_TYPES = [
  'Prima visita',
  'Controllo',
  'Pulizia',
  'Cura carie',
  'Estrazione',
  'Ortodonzia',
  'Impianto',
  'Altro',
] as const

export function isEditableStatus(status: AppointmentStatus): boolean {
  return status === 'scheduled' || status === 'confirmed'
}

export function isCompletableStatus(status: AppointmentStatus): boolean {
  return status === 'scheduled' || status === 'confirmed'
}
