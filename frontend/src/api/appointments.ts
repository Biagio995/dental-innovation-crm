import type {
  Appointment,
  AppointmentFormData,
  AppointmentsListResponse,
  AppointmentResponse,
  AppointmentFilters,
  AppointmentStatus,
  Visit,
  VisitResponse,
  VisitCompleteData,
} from '@/types/appointment'
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './client'

const BASE_PATH = '/api/appointments'

export async function getAppointments(filters?: AppointmentFilters): Promise<AppointmentsListResponse> {
  const params = new URLSearchParams()

  if (filters?.patient_id) {
    params.set('patient_id', String(filters.patient_id))
  }
  if (filters?.status) {
    params.set('status', filters.status)
  }
  if (filters?.date) {
    params.set('date', filters.date)
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

  return apiGet<AppointmentsListResponse>(url)
}

export async function getAppointment(id: number): Promise<Appointment> {
  const response = await apiGet<AppointmentResponse>(`${BASE_PATH}/${id}`)
  return response.data
}

export async function createAppointment(data: AppointmentFormData): Promise<Appointment> {
  const response = await apiPost<AppointmentResponse>(BASE_PATH, data)
  return response.data
}

export async function updateAppointment(id: number, data: AppointmentFormData): Promise<Appointment> {
  const response = await apiPut<AppointmentResponse>(`${BASE_PATH}/${id}`, data)
  return response.data
}

export async function updateAppointmentStatus(
  id: number,
  status: AppointmentStatus
): Promise<Appointment> {
  const response = await apiPatch<AppointmentResponse>(`${BASE_PATH}/${id}/status`, { status })
  return response.data
}

export async function completeVisit(id: number, data?: VisitCompleteData): Promise<Visit> {
  const response = await apiPost<VisitResponse>(`${BASE_PATH}/${id}/complete`, data || {})
  return response.data
}

export async function deleteAppointment(id: number): Promise<void> {
  return apiDelete(`${BASE_PATH}/${id}`)
}
