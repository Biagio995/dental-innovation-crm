import type { Patient } from './patient'
import type { PaginationLinks, PaginationMeta } from './patient'

export type CommunicationChannel = 'sms' | 'email'
export type CommunicationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced'
export type CommunicationType = 'reminder' | 'recall' | 'post_visit' | 'manual'

export interface Communication {
  id: number
  patient_id: number
  patient?: Patient
  template_id: number | null
  channel: CommunicationChannel
  type: CommunicationType
  recipient: string
  subject: string | null
  content: string
  status: CommunicationStatus
  sent_at: string | null
  delivered_at: string | null
  failed_at: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface CommunicationFormData {
  patient_id: number
  template_id?: number | null
  channel: CommunicationChannel
  type: CommunicationType
  recipient: string
  subject?: string | null
  content: string
}

export interface CommunicationsListResponse {
  data: Communication[]
  links: PaginationLinks
  meta: PaginationMeta
}

export interface CommunicationResponse {
  data: Communication
}

export interface CommunicationFilters {
  patient_id?: number
  channel?: CommunicationChannel
  type?: CommunicationType
  status?: CommunicationStatus
  from?: string
  to?: string
  search?: string
  page?: number
  per_page?: number
}

export const COMMUNICATION_CHANNEL_LABELS: Record<CommunicationChannel, string> = {
  sms: 'SMS',
  email: 'Email',
}

export const COMMUNICATION_STATUS_LABELS: Record<CommunicationStatus, string> = {
  pending: 'In attesa',
  sent: 'Inviato',
  delivered: 'Consegnato',
  failed: 'Fallito',
  bounced: 'Rifiutato',
}

export const COMMUNICATION_TYPE_LABELS: Record<CommunicationType, string> = {
  reminder: 'Promemoria',
  recall: 'Richiamo',
  post_visit: 'Post visita',
  manual: 'Manuale',
}

export function getStatusColor(status: CommunicationStatus): string {
  switch (status) {
    case 'delivered':
      return 'success'
    case 'sent':
      return 'info'
    case 'pending':
      return 'warning'
    case 'failed':
    case 'bounced':
      return 'danger'
    default:
      return 'secondary'
  }
}
