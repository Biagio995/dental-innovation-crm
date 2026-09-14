import type {
  MessageTemplate,
  MessageTemplateCreate,
  MessageTemplateUpdate,
  TemplatesListResponse,
  TemplateResponse,
  TemplateFilters,
  TemplatePreviewRequest,
  TemplatePreviewResponse,
} from '@/types/template'
import { apiGet, apiPost, apiPut, apiDelete } from './client'

const BASE_PATH = '/api/message-templates'

export async function getTemplates(filters?: TemplateFilters): Promise<TemplatesListResponse> {
  const params = new URLSearchParams()

  if (filters?.channel) {
    params.set('channel', filters.channel)
  }
  if (filters?.active_only !== undefined) {
    params.set('active_only', String(filters.active_only))
  }
  if (filters?.search) {
    params.set('search', filters.search)
  }
  if (filters?.page) {
    params.set('page', String(filters.page))
  }
  if (filters?.per_page) {
    params.set('per_page', String(filters.per_page))
  }

  const query = params.toString()
  const url = query ? `${BASE_PATH}?${query}` : BASE_PATH

  return apiGet<TemplatesListResponse>(url)
}

export async function getTemplate(id: number): Promise<MessageTemplate> {
  const response = await apiGet<TemplateResponse>(`${BASE_PATH}/${id}`)
  return response.data
}

export async function createTemplate(data: MessageTemplateCreate): Promise<MessageTemplate> {
  const response = await apiPost<TemplateResponse>(BASE_PATH, data)
  return response.data
}

export async function updateTemplate(id: number, data: MessageTemplateUpdate): Promise<MessageTemplate> {
  const response = await apiPut<TemplateResponse>(`${BASE_PATH}/${id}`, data)
  return response.data
}

export async function deleteTemplate(id: number): Promise<void> {
  return apiDelete(`${BASE_PATH}/${id}`)
}

export async function previewTemplate(id: number, data?: TemplatePreviewRequest): Promise<TemplatePreviewResponse['data']> {
  const response = await apiPost<TemplatePreviewResponse>(`${BASE_PATH}/${id}/preview`, data || {})
  return response.data
}
