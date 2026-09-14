export type UserRole = 'owner' | 'admin' | 'operator'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  canDelete: () => boolean
}
