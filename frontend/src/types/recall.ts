import type { Patient } from './patient'
import type { PaginationLinks, PaginationMeta } from './patient'

export type RecallStatus = 'pending' | 'scheduled' | 'contacted' | 'completed' | 'cancelled'
export type RecallOutcome = 'scheduled' | 'not_interested' | 'unreachable' | 'postponed' | 'cancelled'

export interface Recall {
  id: number
  patient_id: number
  patient?: Patient
  visit_id: number | null
  recall_date: string
  reason: string | null
  notes: string | null
  status: RecallStatus
  outcome: RecallOutcome | null
  outcome_notes: string | null
  contacted_at: string | null
  created_at: string
  updated_at: string
}

export interface RecallOutcomeData {
  outcome: RecallOutcome
  outcome_notes?: string | null
}

export interface RecallsListResponse {
  data: Recall[]
  links: PaginationLinks
  meta: PaginationMeta
}

export interface RecallResponse {
  data: Recall
}

export interface RecallFilters {
  status?: RecallStatus
  from?: string
  to?: string
  search?: string
  page?: number
  per_page?: number
}

export const RECALL_STATUS_LABELS: Record<RecallStatus, string> = {
  pending: 'In attesa',
  scheduled: 'Programmato',
  contacted: 'Contattato',
  completed: 'Completato',
  cancelled: 'Annullato',
}

export const RECALL_OUTCOME_LABELS: Record<RecallOutcome, string> = {
  scheduled: 'Appuntamento fissato',
  not_interested: 'Non interessato',
  unreachable: 'Non raggiungibile',
  postponed: 'Rimandato',
  cancelled: 'Annullato',
}
