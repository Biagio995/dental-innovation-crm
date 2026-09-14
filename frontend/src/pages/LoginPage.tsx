import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ApiRequestError } from '@/api/client'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export function LoginPage() {
  const { isAuthenticated, isLoading: authLoading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const from = (location.state as { from?: Location })?.from?.pathname || '/'

  if (authLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Caricamento...</p>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsSubmitting(true)

    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message)
        if (err.errors) {
          setFieldErrors(err.errors)
        }
      } else {
        setError('Errore di connessione. Riprova.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Dental Innovation</h1>
          <p>Accedi al CRM</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@clinica.it"
              required
              autoComplete="email"
              autoFocus
              disabled={isSubmitting}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            {fieldErrors.email && (
              <span id="email-error" className="field-error">
                {fieldErrors.email[0]}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              disabled={isSubmitting}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            />
            {fieldErrors.password && (
              <span id="password-error" className="field-error">
                {fieldErrors.password[0]}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner /> Accesso in corso...
              </>
            ) : (
              'Accedi'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
