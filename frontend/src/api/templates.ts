import type {
  Template,
  TemplateFormData,
  TemplatesListResponse,
  TemplateResponse,
  TemplateFilters,
} from '@/types/template'
import { apiGet, apiPost, apiPut, apiDelete } from './client'

const BASE_PATH = '/api/templates'

export async function getTemplates(filters?: TemplateFilters): Promise<TemplatesListResponse> {
  const params = new URLSearchParams()

  if (filters?.channel) {
    params.set('channel', filters.channel)
  }
  if (filters?.type) {
    params.set('type', filters.type)
  }
  if (filters?.is_active !== undefined) {
    params.set('is_active', String(filters.is_active))
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

export async function getTemplate(id: number): Promise<Template> {
  const response = await apiGet<TemplateResponse>(`${BASE_PATH}/${id}`)
  return response.data
}

export async function createTemplate(data: TemplateFormData): Promise<Template> {
  const response = await apiPost<TemplateResponse>(BASE_PATH, data)
  return response.data
}

export async function updateTemplate(id: number, data: TemplateFormData): Promise<Template> {
  const response = await apiPut<TemplateResponse>(`${BASE_PATH}/${id}`, data)
  return response.data
}

export async function deleteTemplate(id: number): Promise<void> {
  return apiDelete(`${BASE_PATH}/${id}`)
}
