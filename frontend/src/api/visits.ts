import type { Visit } from '@/types/appointment'
import { apiGet } from './client'

const BASE_PATH = '/api/visits'

export interface VisitsListResponse {
  data: Visit[]
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number | null
    last_page: number
    path: string
    per_page: number
    to: number | null
    total: number
  }
}

export interface VisitFilters {
  patient_id?: number
  page?: number
  per_page?: number
}

export async function getVisits(filters?: VisitFilters): Promise<VisitsListResponse> {
  const params = new URLSearchParams()

  if (filters?.patient_id) {
    params.set('patient_id', String(filters.patient_id))
  }
  if (filters?.page) {
    params.set('page', String(filters.page))
  }
  if (filters?.per_page) {
    params.set('per_page', String(filters.per_page))
  }

  const query = params.toString()
  const url = query ? `${BASE_PATH}?${query}` : BASE_PATH

  return apiGet<VisitsListResponse>(url)
}

export async function getVisit(id: number): Promise<Visit> {
  const response = await apiGet<{ data: Visit }>(`${BASE_PATH}/${id}`)
  return response.data
}
