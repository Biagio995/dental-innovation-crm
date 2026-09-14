import { useState, useEffect, type FormEvent } from 'react'
import { Save, Loader2 } from 'lucide-react'
import type { Patient, PatientFormData } from '@/types/patient'
import { ApiRequestError } from '@/api/client'

interface PatientFormProps {
  patient?: Patient | null
  onSubmit: (data: PatientFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function PatientForm({ patient, onSubmit, onCancel, isLoading = false }: PatientFormProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (patient) {
      setFormData({
        first_name: patient.first_name,
        last_name: patient.last_name,
        email: patient.email || '',
        phone: patient.phone || '',
        date_of_birth: patient.date_of_birth || '',
        notes: patient.notes || '',
      })
    }
  }, [patient])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrors({})
    setSubmitError(null)

    try {
      await onSubmit(formData)
    } catch (error) {
      if (error instanceof ApiRequestError) {
        if (error.errors) {
          setErrors(error.errors)
        } else {
          setSubmitError(error.message)
        }
      } else {
        setSubmitError('Si è verificato un errore imprevisto')
      }
    }
  }

  function handleChange(field: keyof PatientFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="patient-form">
      {submitError && (
        <div className="alert alert-error" role="alert">
          {submitError}
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="first_name">
            Nome <span className="required">*</span>
          </label>
          <input
            type="text"
            id="first_name"
            value={formData.first_name}
            onChange={(e) => handleChange('first_name', e.target.value)}
            disabled={isLoading}
            required
            maxLength={100}
            aria-invalid={!!errors.first_name}
            aria-describedby={errors.first_name ? 'first_name-error' : undefined}
          />
          {errors.first_name && (
            <span id="first_name-error" className="field-error">
              {errors.first_name[0]}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="last_name">
            Cognome <span className="required">*</span>
          </label>
          <input
            type="text"
            id="last_name"
            value={formData.last_name}
            onChange={(e) => handleChange('last_name', e.target.value)}
            disabled={isLoading}
            required
            maxLength={100}
            aria-invalid={!!errors.last_name}
            aria-describedby={errors.last_name ? 'last_name-error' : undefined}
          />
          {errors.last_name && (
            <span id="last_name-error" className="field-error">
              {errors.last_name[0]}
            </span>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="phone">Telefono</label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            disabled={isLoading}
            maxLength={30}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone && (
            <span id="phone-error" className="field-error">
              {errors.phone[0]}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={isLoading}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <span id="email-error" className="field-error">
              {errors.email[0]}
            </span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="date_of_birth">Data di nascita</label>
        <input
          type="date"
          id="date_of_birth"
          value={formData.date_of_birth}
          onChange={(e) => handleChange('date_of_birth', e.target.value)}
          disabled={isLoading}
          aria-invalid={!!errors.date_of_birth}
          aria-describedby={errors.date_of_birth ? 'date_of_birth-error' : undefined}
        />
        {errors.date_of_birth && (
          <span id="date_of_birth-error" className="field-error">
            {errors.date_of_birth[0]}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="notes">Note</label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          disabled={isLoading}
          rows={3}
          aria-invalid={!!errors.notes}
          aria-describedby={errors.notes ? 'notes-error' : undefined}
        />
        {errors.notes && (
          <span id="notes-error" className="field-error">
            {errors.notes[0]}
          </span>
        )}
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Annulla
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 size={18} className="spinner-icon" />
              Salvataggio...
            </>
          ) : (
            <>
              <Save size={18} />
              {patient ? 'Salva modifiche' : 'Crea paziente'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
