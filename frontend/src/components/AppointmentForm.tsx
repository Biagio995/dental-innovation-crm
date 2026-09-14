import { useState, useEffect, type FormEvent } from 'react'
import { Save, Loader2, Search } from 'lucide-react'
import type { Appointment, AppointmentFormData, AppointmentStatus } from '@/types/appointment'
import type { Patient } from '@/types/patient'
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_TYPES } from '@/types/appointment'
import { ApiRequestError } from '@/api/client'
import * as patientsApi from '@/api/patients'

interface AppointmentFormProps {
  appointment?: Appointment | null
  selectedDate?: string
  preselectedPatientId?: number | null
  onSubmit: (data: AppointmentFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function AppointmentForm({
  appointment,
  selectedDate,
  preselectedPatientId,
  onSubmit,
  onCancel,
  isLoading = false,
}: AppointmentFormProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    patient_id: preselectedPatientId || 0,
    scheduled_at: '',
    duration_minutes: 30,
    type: '',
    notes: '',
    status: 'scheduled',
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [patientSearch, setPatientSearch] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)

  useEffect(() => {
    if (appointment) {
      const scheduledDate = new Date(appointment.scheduled_at)
      const localDateTime = new Date(
        scheduledDate.getTime() - scheduledDate.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16)

      setFormData({
        patient_id: appointment.patient_id,
        scheduled_at: localDateTime,
        duration_minutes: appointment.duration_minutes,
        type: appointment.type || '',
        notes: appointment.notes || '',
        status: appointment.status,
      })
      if (appointment.patient) {
        setSelectedPatient(appointment.patient)
      }
    } else if (selectedDate) {
      const defaultTime = `${selectedDate}T09:00`
      setFormData((prev) => ({ ...prev, scheduled_at: defaultTime }))
    }
  }, [appointment, selectedDate])

  useEffect(() => {
    if (preselectedPatientId && !appointment) {
      loadPatientById(preselectedPatientId)
    }
  }, [preselectedPatientId, appointment])

  async function loadPatientById(id: number) {
    try {
      const patient = await patientsApi.getPatient(id)
      setSelectedPatient(patient)
      setFormData((prev) => ({ ...prev, patient_id: patient.id }))
    } catch (err) {
      console.error('Failed to load patient:', err)
    }
  }

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (patientSearch.length >= 2) {
        setIsSearching(true)
        try {
          const response = await patientsApi.getPatients({
            search: patientSearch,
            per_page: 10,
          })
          setPatients(response.data)
          setShowPatientDropdown(true)
        } catch (err) {
          console.error('Failed to search patients:', err)
        } finally {
          setIsSearching(false)
        }
      } else {
        setPatients([])
        setShowPatientDropdown(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [patientSearch])

  function selectPatient(patient: Patient) {
    setSelectedPatient(patient)
    setFormData((prev) => ({ ...prev, patient_id: patient.id }))
    setPatientSearch('')
    setShowPatientDropdown(false)
  }

  function clearPatient() {
    setSelectedPatient(null)
    setFormData((prev) => ({ ...prev, patient_id: 0 }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrors({})
    setSubmitError(null)

    if (!formData.patient_id) {
      setErrors({ patient_id: ['Seleziona un paziente'] })
      return
    }

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

  function handleChange<K extends keyof AppointmentFormData>(
    field: K,
    value: AppointmentFormData[K]
  ) {
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
    <form onSubmit={handleSubmit} className="appointment-form">
      {submitError && (
        <div className="alert alert-error" role="alert">
          {submitError}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="patient">
          Paziente <span className="required">*</span>
        </label>
        {selectedPatient ? (
          <div className="selected-patient">
            <span className="patient-avatar-sm">
              {selectedPatient.first_name.charAt(0)}
              {selectedPatient.last_name.charAt(0)}
            </span>
            <span>
              {selectedPatient.last_name} {selectedPatient.first_name}
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={clearPatient}
              disabled={isLoading}
            >
              Cambia
            </button>
          </div>
        ) : (
          <div className="patient-search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              id="patient"
              placeholder="Cerca paziente..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              disabled={isLoading}
              autoComplete="off"
              aria-invalid={!!errors.patient_id}
              aria-describedby={errors.patient_id ? 'patient-error' : undefined}
            />
            {isSearching && <Loader2 size={16} className="spinner-icon search-spinner" />}
            {showPatientDropdown && patients.length > 0 && (
              <ul className="patient-dropdown" role="listbox">
                {patients.map((patient) => (
                  <li key={patient.id}>
                    <button
                      type="button"
                      className="patient-option"
                      onClick={() => selectPatient(patient)}
                      role="option"
                    >
                      <span className="patient-avatar-sm">
                        {patient.first_name.charAt(0)}
                        {patient.last_name.charAt(0)}
                      </span>
                      <span>
                        {patient.last_name} {patient.first_name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {showPatientDropdown && patients.length === 0 && !isSearching && (
              <div className="patient-dropdown patient-no-results">
                Nessun paziente trovato
              </div>
            )}
          </div>
        )}
        {errors.patient_id && (
          <span id="patient-error" className="field-error">
            {errors.patient_id[0]}
          </span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="scheduled_at">
            Data e ora <span className="required">*</span>
          </label>
          <input
            type="datetime-local"
            id="scheduled_at"
            value={formData.scheduled_at}
            onChange={(e) => handleChange('scheduled_at', e.target.value)}
            disabled={isLoading}
            required
            aria-invalid={!!errors.scheduled_at}
            aria-describedby={errors.scheduled_at ? 'scheduled_at-error' : undefined}
          />
          {errors.scheduled_at && (
            <span id="scheduled_at-error" className="field-error">
              {errors.scheduled_at[0]}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="duration_minutes">
            Durata (minuti) <span className="required">*</span>
          </label>
          <select
            id="duration_minutes"
            value={formData.duration_minutes}
            onChange={(e) => handleChange('duration_minutes', Number(e.target.value))}
            disabled={isLoading}
            required
          >
            <option value={15}>15 minuti</option>
            <option value={30}>30 minuti</option>
            <option value={45}>45 minuti</option>
            <option value={60}>1 ora</option>
            <option value={90}>1 ora e 30 min</option>
            <option value={120}>2 ore</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="type">Tipo di appuntamento</label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            disabled={isLoading}
          >
            <option value="">Seleziona...</option>
            {APPOINTMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="status">Stato</label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value as AppointmentStatus)}
            disabled={isLoading}
          >
            {Object.entries(APPOINTMENT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
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
              {appointment ? 'Salva modifiche' : 'Crea appuntamento'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
