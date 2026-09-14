import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import * as authApi from '@/api/auth'
import { ApiRequestError } from '@/api/client'
import type { AuthContextType, LoginCredentials, User } from '@/types/auth'

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const userData = await authApi.getMe()
      setUser(userData)
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        setUser(null)
      } else {
        console.error('Failed to fetch user:', error)
        setUser(null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = useCallback(async (credentials: LoginCredentials) => {
    await authApi.login(credentials)
    await fetchUser()
  }, [fetchUser])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
    }
  }, [])

  const canDelete = useCallback(() => {
    return user?.role === 'owner' || user?.role === 'admin'
  }, [user])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    canDelete,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
