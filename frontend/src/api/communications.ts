import type {
  CommunicationLog,
  CommunicationLogCreate,
  CommunicationStatusUpdate,
  CommunicationsListResponse,
  CommunicationResponse,
  CommunicationFilters,
} from '@/types/communication'
import { apiGet, apiPost, apiPatch, apiDelete } from './client'

const BASE_PATH = '/api/communication-logs'

export async function getCommunications(filters?: CommunicationFilters): Promise<CommunicationsListResponse> {
  const params = new URLSearchParams()

  if (filters?.patient_id) {
    params.set('patient_id', String(filters.patient_id))
  }
  if (filters?.appointment_id) {
    params.set('appointment_id', String(filters.appointment_id))
  }
  if (filters?.recall_task_id) {
    params.set('recall_task_id', String(filters.recall_task_id))
  }
  if (filters?.channel) {
    params.set('channel', filters.channel)
  }
  if (filters?.status) {
    params.set('status', filters.status)
  }
  if (filters?.reminder_type) {
    params.set('reminder_type', filters.reminder_type)
  }
  if (filters?.from) {
    params.set('from', filters.from)
  }
  if (filters?.to) {
    params.set('to', filters.to)
  }
  if (filters?.page) {
    params.set('page', String(filters.page))
  }
  if (filters?.per_page) {
    params.set('per_page', String(filters.per_page))
  }

  const query = params.toString()
  const url = query ? `${BASE_PATH}?${query}` : BASE_PATH

  return apiGet<CommunicationsListResponse>(url)
}

export async function getCommunication(id: number): Promise<CommunicationLog> {
  const response = await apiGet<CommunicationResponse>(`${BASE_PATH}/${id}`)
  return response.data
}

export async function createCommunication(data: CommunicationLogCreate): Promise<CommunicationLog> {
  const response = await apiPost<CommunicationResponse>(BASE_PATH, data)
  return response.data
}

export async function deleteCommunication(id: number): Promise<void> {
  return apiDelete(`${BASE_PATH}/${id}`)
}

export async function updateCommunicationStatus(id: number, data: CommunicationStatusUpdate): Promise<CommunicationLog> {
  const response = await apiPatch<CommunicationResponse>(`${BASE_PATH}/${id}/status`, data)
  return response.data
}
