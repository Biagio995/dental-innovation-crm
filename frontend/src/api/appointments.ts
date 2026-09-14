import type {
  Appointment,
  AppointmentFormData,
  AppointmentsListResponse,
  AppointmentFilters,
} from '@/types/appointment'
import { apiGet, apiPost, apiPatch, apiDelete } from './client'

const BASE_PATH = '/api/appointments'

export async function getAppointments(filters?: AppointmentFilters): Promise<AppointmentsListResponse> {
  const params = new URLSearchParams()

  if (filters?.date) {
    params.set('date', filters.date)
  }
  if (filters?.patient_id) {
    params.set('patient_id', String(filters.patient_id))
  }

  const query = params.toString()
  const url = query ? `${BASE_PATH}?${query}` : BASE_PATH

  return apiGet<AppointmentsListResponse>(url)
}

export async function getAppointment(id: number): Promise<Appointment> {
  return apiGet<Appointment>(`${BASE_PATH}/${id}`)
}

export async function createAppointment(data: AppointmentFormData): Promise<Appointment> {
  return apiPost<Appointment>(BASE_PATH, data)
}

export async function updateAppointment(
  id: number,
  data: Partial<AppointmentFormData>
): Promise<Appointment> {
  return apiPatch<Appointment>(`${BASE_PATH}/${id}`, data)
}

export async function deleteAppointment(id: number): Promise<void> {
  return apiDelete(`${BASE_PATH}/${id}`)
}
