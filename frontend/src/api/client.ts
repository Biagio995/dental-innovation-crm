const API_BASE = ''

interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

export class ApiRequestError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor({ message, status, errors }: ApiError) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.errors = errors
  }
}

function getXsrfToken(): string | null {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
  if (match) {
    return decodeURIComponent(match[1])
  }
  return null
}

export async function fetchCsrfCookie(): Promise<void> {
  await fetch(`${API_BASE}/sanctum/csrf-cookie`, {
    method: 'GET',
    credentials: 'include',
  })
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T
  }

  if (!response.ok) {
    let message = 'Si è verificato un errore'
    let errors: Record<string, string[]> | undefined

    try {
      const data = await response.json()
      message = data.message || message
      errors = data.errors
    } catch {
      if (response.status === 401) {
        message = 'Sessione scaduta o credenziali non valide'
      } else if (response.status === 422) {
        message = 'Dati non validi'
      } else if (response.status === 429) {
        message = 'Troppi tentativi. Riprova tra qualche minuto.'
      }
    }

    throw new ApiRequestError({
      message,
      status: response.status,
      errors,
    })
  }

  return response.json()
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  return handleResponse<T>(response)
}

export async function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
  const xsrfToken = getXsrfToken()
  
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
  
  if (xsrfToken) {
    headers['X-XSRF-TOKEN'] = xsrfToken
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })

  return handleResponse<T>(response)
}
