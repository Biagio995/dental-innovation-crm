import type {
  Patient,
  PatientFormData,
  PatientsListResponse,
  PatientResponse,
  PatientFilters,
} from '@/types/patient'
import { apiGet, apiPost, apiPut, apiDelete } from './client'

const BASE_PATH = '/api/patients'

export async function getPatients(filters?: PatientFilters): Promise<PatientsListResponse> {
  const params = new URLSearchParams()

  if (filters?.status) {
    params.set('status', filters.status)
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

  return apiGet<PatientsListResponse>(url)
}

export async function getPatient(id: number): Promise<Patient> {
  const response = await apiGet<PatientResponse>(`${BASE_PATH}/${id}`)
  return response.data
}

export async function createPatient(data: PatientFormData): Promise<Patient> {
  const response = await apiPost<PatientResponse>(BASE_PATH, data)
  return response.data
}

export async function updatePatient(id: number, data: PatientFormData): Promise<Patient> {
  const response = await apiPut<PatientResponse>(`${BASE_PATH}/${id}`, data)
  return response.data
}

export async function deletePatient(id: number): Promise<void> {
  return apiDelete(`${BASE_PATH}/${id}`)
}
