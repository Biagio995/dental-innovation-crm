import type { PaginationLinks, PaginationMeta } from './patient'

export type TemplateChannel = 'sms' | 'email'

export interface TemplateVariable {
  key: string
  description: string
  example: string
}

export interface MessageTemplate {
  id: number
  name: string
  channel: TemplateChannel
  subject: string | null
  body: string
  variables: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MessageTemplateCreate {
  name: string
  channel: TemplateChannel
  subject?: string | null
  body: string
  variables?: string[]
  is_active?: boolean
}

export interface MessageTemplateUpdate {
  name?: string
  channel?: TemplateChannel
  subject?: string | null
  body?: string
  variables?: string[]
  is_active?: boolean
}

export interface TemplatePreviewRequest {
  data?: Record<string, string>
}

export interface TemplatePreviewResponse {
  data: {
    subject: string | null
    body: string
    variables_used: string[]
  }
}

export interface TemplatesListResponse {
  data: MessageTemplate[]
  links: PaginationLinks
  meta: PaginationMeta
}

export interface TemplateResponse {
  data: MessageTemplate
}

export interface TemplateFilters {
  channel?: TemplateChannel
  active_only?: boolean
  search?: string
  page?: number
  per_page?: number
}

export const TEMPLATE_CHANNEL_LABELS: Record<TemplateChannel, string> = {
  sms: 'SMS',
  email: 'Email',
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

export const TEMPLATE_EXAMPLES: Record<string, { subject?: string; body: string }> = {
  'sms_reminder_48h': {
    body: 'Ciao {nome}, ti ricordiamo l\'appuntamento del {data} alle {ora} presso Dental Innovation. Per modificare: {telefono}.',
  },
  'sms_reminder_24h': {
    body: 'Promemoria: domani alle {ora} ti aspettiamo in studio. A presto — Dental Innovation.',
  },
  'email_reminder': {
    subject: 'Promemoria appuntamento — {data}',
    body: 'Gentile {nome},\n\nLe ricordiamo il suo appuntamento presso Dental Innovation:\n\nData: {data}\nOra: {ora}\n\nPer modificare o annullare l\'appuntamento, contattaci al {telefono}.\n\nCordiali saluti,\nDental Innovation',
  },
  'sms_post_visit': {
    body: 'Grazie per la visita, {nome}. Il prossimo controllo consigliato è intorno al {data_richiamo}.',
  },
  'sms_recall': {
    body: 'Ciao {nome}, è tempo del tuo controllo periodico! Chiamaci al {telefono} per fissare un appuntamento.',
  },
}
