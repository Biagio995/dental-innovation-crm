import type {
  Communication,
  CommunicationFormData,
  CommunicationsListResponse,
  CommunicationResponse,
  CommunicationFilters,
} from '@/types/communication'
import { apiGet, apiPost } from './client'

const BASE_PATH = '/api/communications'

export async function getCommunications(filters?: CommunicationFilters): Promise<CommunicationsListResponse> {
  const params = new URLSearchParams()

  if (filters?.patient_id) {
    params.set('patient_id', String(filters.patient_id))
  }
  if (filters?.channel) {
    params.set('channel', filters.channel)
  }
  if (filters?.type) {
    params.set('type', filters.type)
  }
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

  return apiGet<CommunicationsListResponse>(url)
}

export async function getCommunication(id: number): Promise<Communication> {
  const response = await apiGet<CommunicationResponse>(`${BASE_PATH}/${id}`)
  return response.data
}

export async function createCommunication(data: CommunicationFormData): Promise<Communication> {
  const response = await apiPost<CommunicationResponse>(BASE_PATH, data)
  return response.data
}
