import type {
  RecallTask,
  RecallTaskCreate,
  RecallTaskUpdate,
  ContactOutcome,
  RecallsListResponse,
  RecallResponse,
  RecallFilters,
  RecallQueueFilters,
  GenerateRecallsResponse,
} from '@/types/recall'
import { apiGet, apiPost, apiPut, apiDelete } from './client'

const BASE_PATH = '/api/recalls'

export async function getRecalls(filters?: RecallFilters): Promise<RecallsListResponse> {
  const params = new URLSearchParams()

  if (filters?.status) {
    params.set('status', filters.status)
  }
  if (filters?.patient_id) {
    params.set('patient_id', String(filters.patient_id))
  }
  if (filters?.assigned_to) {
    params.set('assigned_to', String(filters.assigned_to))
  }
  if (filters?.overdue_only) {
    params.set('overdue_only', 'true')
  }
  if (filters?.due_from) {
    params.set('due_from', filters.due_from)
  }
  if (filters?.due_to) {
    params.set('due_to', filters.due_to)
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

export async function getRecallsQueue(filters?: RecallQueueFilters): Promise<RecallsListResponse> {
  const params = new URLSearchParams()

  if (filters?.days_ahead) {
    params.set('days_ahead', String(filters.days_ahead))
  }
  if (filters?.page) {
    params.set('page', String(filters.page))
  }
  if (filters?.per_page) {
    params.set('per_page', String(filters.per_page))
  }

  const query = params.toString()
  const url = query ? `${BASE_PATH}/queue?${query}` : `${BASE_PATH}/queue`

  return apiGet<RecallsListResponse>(url)
}

export async function getRecall(id: number): Promise<RecallTask> {
  const response = await apiGet<RecallResponse>(`${BASE_PATH}/${id}`)
  return response.data
}

export async function createRecall(data: RecallTaskCreate): Promise<RecallTask> {
  const response = await apiPost<RecallResponse>(BASE_PATH, data)
  return response.data
}

export async function updateRecall(id: number, data: RecallTaskUpdate): Promise<RecallTask> {
  const response = await apiPut<RecallResponse>(`${BASE_PATH}/${id}`, data)
  return response.data
}

export async function deleteRecall(id: number): Promise<void> {
  return apiDelete(`${BASE_PATH}/${id}`)
}

export async function recordContactOutcome(id: number, data: ContactOutcome): Promise<RecallTask> {
  const response = await apiPost<RecallResponse>(`${BASE_PATH}/${id}/contact-outcome`, data)
  return response.data
}

export async function generateFromVisits(daysAhead?: number): Promise<GenerateRecallsResponse> {
  return apiPost<GenerateRecallsResponse>(`${BASE_PATH}/generate-from-visits`, {
    days_ahead: daysAhead,
  })
}
