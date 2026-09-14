import type { PaginationLinks, PaginationMeta } from './patient'

export type RecallStatus = 'pending' | 'contacted' | 'scheduled' | 'no_answer' | 'declined' | 'expired'
export type ContactOutcomeType = 'contacted' | 'scheduled' | 'no_answer' | 'declined'

export interface UserSummary {
  id: number
  name: string
}

export interface PatientSummary {
  id: number
  first_name: string
  last_name: string
  full_name: string
  phone: string | null
  email: string | null
}

export interface RecallTask {
  id: number
  patient_id: number
  patient?: PatientSummary
  visit_id: number | null
  due_date: string
  status: RecallStatus
  status_label: string
  notes: string | null
  contact_attempts: number
  last_contact_at: string | null
  is_overdue: boolean
  created_by: number | null
  creator: UserSummary | null
  assigned_to: number | null
  assignee: UserSummary | null
  resulting_appointment_id: number | null
  created_at: string
  updated_at: string
}

export interface RecallTaskCreate {
  patient_id: number
  visit_id?: number | null
  due_date: string
  notes?: string | null
  assigned_to?: number | null
}

export interface RecallTaskUpdate {
  due_date?: string
  status?: RecallStatus
  notes?: string | null
  assigned_to?: number | null
  resulting_appointment_id?: number | null
}

export interface ContactOutcome {
  outcome: ContactOutcomeType
  notes?: string | null
  resulting_appointment_id?: number | null
}

export interface RecallsListResponse {
  data: RecallTask[]
  links: PaginationLinks
  meta: PaginationMeta
}

export interface RecallResponse {
  data: RecallTask
}

export interface RecallFilters {
  status?: RecallStatus
  patient_id?: number
  assigned_to?: number
  overdue_only?: boolean
  due_from?: string
  due_to?: string
  page?: number
  per_page?: number
}

export interface RecallQueueFilters {
  days_ahead?: number
  page?: number
  per_page?: number
}

export interface GenerateRecallsResponse {
  message: string
  count: number
}

export const RECALL_STATUS_LABELS: Record<RecallStatus, string> = {
  pending: 'In attesa',
  contacted: 'Contattato',
  scheduled: 'Programmato',
  no_answer: 'Non risponde',
  declined: 'Rifiutato',
  expired: 'Scaduto',
}

export const CONTACT_OUTCOME_LABELS: Record<ContactOutcomeType, string> = {
  contacted: 'Contattato (da richiamare)',
  scheduled: 'Appuntamento fissato',
  no_answer: 'Non risponde',
  declined: 'Rifiutato',
}
