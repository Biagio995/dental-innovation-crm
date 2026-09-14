import type { LoginCredentials, User } from '@/types/auth'
import { apiGet, apiPost } from './client'

export async function login(credentials: LoginCredentials): Promise<void> {
  await apiPost<void>('/api/login', credentials)
}

export async function logout(): Promise<void> {
  await apiPost<void>('/api/logout')
}

export async function getMe(): Promise<User> {
  return apiGet<User>('/api/me')
}
