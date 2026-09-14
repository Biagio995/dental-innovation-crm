import type { PaginationLinks, PaginationMeta } from './patient'

export type TemplateChannel = 'sms' | 'email'
export type TemplateType = 'reminder_24h' | 'reminder_48h' | 'post_visit' | 'recall' | 'custom'

export interface TemplateVariable {
  key: string
  description: string
  example: string
}

export interface Template {
  id: number
  name: string
  channel: TemplateChannel
  type: TemplateType
  subject: string | null
  content: string
  variables: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TemplateFormData {
  name: string
  channel: TemplateChannel
  type: TemplateType
  subject?: string | null
  content: string
  is_active?: boolean
}

export interface TemplatesListResponse {
  data: Template[]
  links: PaginationLinks
  meta: PaginationMeta
}

export interface TemplateResponse {
  data: Template
}

export interface TemplateFilters {
  channel?: TemplateChannel
  type?: TemplateType
  is_active?: boolean
  search?: string
  page?: number
  per_page?: number
}

export const TEMPLATE_CHANNEL_LABELS: Record<TemplateChannel, string> = {
  sms: 'SMS',
  email: 'Email',
}

export const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  reminder_24h: 'Promemoria 24h',
  reminder_48h: 'Promemoria 48h',
  post_visit: 'Post visita',
  recall: 'Richiamo',
  custom: 'Personalizzato',
}

export const AVAILABLE_VARIABLES: TemplateVariable[] = [
  { key: '{nome}', description: 'Nome del paziente', example: 'Mario' },
  { key: '{cognome}', description: 'Cognome del paziente', example: 'Rossi' },
  { key: '{data}', description: 'Data appuntamento', example: '15/01/2024' },
  { key: '{ora}', description: 'Ora appuntamento', example: '10:30' },
  { key: '{telefono}', description: 'Telefono studio', example: '+39 02 1234567' },
  { key: '{data_richiamo}', description: 'Data richiamo consigliata', example: '15/07/2024' },
  { key: '{tipo_visita}', description: 'Tipo di visita', example: 'Controllo' },
]

export const TEMPLATE_EXAMPLES: Record<string, { subject?: string; content: string }> = {
  'sms_reminder_48h': {
    content: 'Ciao {nome}, ti ricordiamo l\'appuntamento del {data} alle {ora} presso Dental Innovation. Per modificare: {telefono}.',
  },
  'sms_reminder_24h': {
    content: 'Promemoria: domani alle {ora} ti aspettiamo in studio. A presto — Dental Innovation.',
  },
  'email_reminder_48h': {
    subject: 'Promemoria appuntamento — {data}',
    content: 'Gentile {nome},\n\nLe ricordiamo il suo appuntamento presso Dental Innovation:\n\nData: {data}\nOra: {ora}\n\nPer modificare o annullare l\'appuntamento, contattaci al {telefono}.\n\nCordiali saluti,\nDental Innovation',
  },
  'sms_post_visit': {
    content: 'Grazie per la visita, {nome}. Il prossimo controllo consigliato è intorno al {data_richiamo}.',
  },
}
