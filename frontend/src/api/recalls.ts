import type {
  Recall,
  RecallOutcomeData,
  RecallsListResponse,
  RecallResponse,
  RecallFilters,
} from '@/types/recall'
import { apiGet, apiPatch } from './client'

const BASE_PATH = '/api/recalls'

export async function getRecalls(filters?: RecallFilters): Promise<RecallsListResponse> {
  const params = new URLSearchParams()

  if (filters?.status) {
    params.set('status', filters.status)
  }
  if (filters?.from) {
    params.set('from', filters.from)
  }
  if (filters?.to) {
    params.set('to', filters.to)
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

  return apiGet<RecallsListResponse>(url)
}

export async function getRecall(id: number): Promise<Recall> {
  const response = await apiGet<RecallResponse>(`${BASE_PATH}/${id}`)
  return response.data
}

export async function updateRecallOutcome(id: number, data: RecallOutcomeData): Promise<Recall> {
  const response = await apiPatch<RecallResponse>(`${BASE_PATH}/${id}`, data)
  return response.data
}
