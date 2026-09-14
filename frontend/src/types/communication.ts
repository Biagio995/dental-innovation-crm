import type { PaginationLinks, PaginationMeta } from './patient'
import type { PatientSummary, UserSummary } from './recall'

export type CommunicationChannel = 'sms' | 'email'
export type CommunicationStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced'
export type ReminderType = 'appointment_48h' | 'appointment_24h' | 'post_visit' | 'recall'

export interface CommunicationLog {
  id: number
  patient_id: number
  patient?: PatientSummary
  appointment_id: number | null
  recall_task_id: number | null
  message_template_id: number | null
  channel: CommunicationChannel
  channel_label: string
  status: CommunicationStatus
  status_label: string
  recipient: string
  subject: string | null
  body: string
  reminder_type: ReminderType | null
  reminder_type_label: string | null
  external_id: string | null
  error_message: string | null
  metadata: Record<string, unknown> | null
  sent_at: string | null
  sent_by: number | null
  sender: UserSummary | null
  created_at: string
  updated_at: string
}

export interface CommunicationLogCreate {
  patient_id: number
  appointment_id?: number | null
  recall_task_id?: number | null
  message_template_id?: number | null
  channel: CommunicationChannel
  status?: CommunicationStatus
  recipient: string
  subject?: string | null
  body: string
  reminder_type?: ReminderType | null
  external_id?: string | null
  metadata?: Record<string, unknown> | null
}

export interface CommunicationStatusUpdate {
  status: CommunicationStatus
  external_id?: string | null
  error_message?: string | null
}

export interface CommunicationsListResponse {
  data: CommunicationLog[]
  links: PaginationLinks
  meta: PaginationMeta
}

export interface CommunicationResponse {
  data: CommunicationLog
}

export interface CommunicationFilters {
  patient_id?: number
  appointment_id?: number
  recall_task_id?: number
  channel?: CommunicationChannel
  status?: CommunicationStatus
  reminder_type?: ReminderType
  from?: string
  to?: string
  page?: number
  per_page?: number
}

export const COMMUNICATION_CHANNEL_LABELS: Record<CommunicationChannel, string> = {
  sms: 'SMS',
  email: 'Email',
}

export const COMMUNICATION_STATUS_LABELS: Record<CommunicationStatus, string> = {
  queued: 'In coda',
  sent: 'Inviato',
  delivered: 'Consegnato',
  failed: 'Fallito',
  bounced: 'Rifiutato',
}

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  appointment_48h: 'Promemoria 48h',
  appointment_24h: 'Promemoria 24h',
  post_visit: 'Post visita',
  recall: 'Richiamo',
}

export function getStatusColor(status: CommunicationStatus): string {
  switch (status) {
    case 'delivered':
      return 'success'
    case 'sent':
      return 'info'
    case 'queued':
      return 'warning'
    case 'failed':
    case 'bounced':
      return 'danger'
    default:
      return 'secondary'
  }
}
