import type { Patient } from './patient'

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export interface Appointment {
  id: number
  patient_id: number
  patient?: Patient
  scheduled_at: string
  duration_minutes: number
  type: string | null
  notes: string | null
  status: AppointmentStatus
  created_at: string
  updated_at: string
}

export interface AppointmentFormData {
  patient_id: number
  scheduled_at: string
  duration_minutes: number
  type?: string
  notes?: string
  status?: AppointmentStatus
}

export interface AppointmentsListResponse {
  data: Appointment[]
}

export interface AppointmentFilters {
  date?: string
  patient_id?: number
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
