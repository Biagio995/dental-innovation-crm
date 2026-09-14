import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Edit,
  Loader2,
  Mail,
  Phone,
  Trash2,
  User,
  AlertCircle,
  CalendarPlus,
  ClipboardList,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Modal } from '@/components/Modal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { PatientForm } from '@/components/PatientForm'
import * as patientsApi from '@/api/patients'
import * as appointmentsApi from '@/api/appointments'
import * as visitsApi from '@/api/visits'
import type { Patient, PatientFormData } from '@/types/patient'
import type { Appointment, Visit } from '@/types/appointment'
import { APPOINTMENT_STATUS_LABELS } from '@/types/appointment'
import { ApiRequestError } from '@/api/client'

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { canDelete } = useAuth()

  const [patient, setPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadPatient = useCallback(async () => {
    if (!id) return

    setIsLoading(true)
    setError(null)

    try {
      const patientId = Number(id)
      const [patientData, appointmentsData, visitsData] = await Promise.all([
        patientsApi.getPatient(patientId),
        appointmentsApi.getAppointments({ patient_id: patientId }),
        visitsApi.getVisits({ patient_id: patientId }),
      ])
      setPatient(patientData)
      setAppointments(appointmentsData.data)
      setVisits(visitsData.data)
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 404) {
          setError('Paziente non trovato')
        } else if (err.status === 401) {
          return
        } else {
          setError('Errore nel caricamento dei dati')
        }
      } else {
        setError('Errore nel caricamento dei dati')
      }
      console.error('Failed to load patient:', err)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadPatient()
  }, [loadPatient])

  async function handleSubmit(data: PatientFormData) {
    if (!patient) return

    setIsSubmitting(true)
    try {
      const updated = await patientsApi.updatePatient(patient.id, data)
      setPatient(updated)
      setIsEditModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!patient) return

    setIsDeleting(true)
    try {
      await patientsApi.deletePatient(patient.id)
      navigate('/pazienti', { replace: true })
    } catch (err) {
      console.error('Failed to delete patient:', err)
      setIsDeleting(false)
    }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('it-IT')
  }

  function formatDateTime(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function calculateAge(dateOfBirth: string | null): string {
    if (!dateOfBirth) return ''
    const birth = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return `(${age} anni)`
  }

  if (isLoading) {
    return (
      <div className="page">
        <div className="loading-state">
          <Loader2 size={32} className="spinner-icon" />
          <span>Caricamento...</span>
        </div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="page">
        <div className="card">
          <div className="error-state">
            <AlertCircle size={48} className="error-icon" />
            <h3>{error || 'Paziente non trovato'}</h3>
            <Link to="/pazienti" className="btn btn-primary">
              <ArrowLeft size={18} />
              Torna ai pazienti
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-left">
          <Link to="/pazienti" className="btn btn-ghost back-link">
            <ArrowLeft size={18} />
          </Link>
          <h1>
            {patient.last_name} {patient.first_name}
          </h1>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(true)}>
            <Edit size={18} />
            Modifica
          </button>
          {canDelete() && (
            <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 size={18} />
              Elimina
            </button>
          )}
        </div>
      </header>

      <div className="page-content">
        <div className="detail-grid">
          <div className="card detail-card">
            <h2 className="card-title">
              <User size={20} />
              Informazioni personali
            </h2>
            <dl className="detail-list">
              <div className="detail-item">
                <dt>Nome completo</dt>
                <dd>
                  {patient.first_name} {patient.last_name}
                </dd>
              </div>
              <div className="detail-item">
                <dt>Data di nascita</dt>
                <dd>
                  {formatDate(patient.date_of_birth)}{' '}
                  <span className="text-muted">{calculateAge(patient.date_of_birth)}</span>
                </dd>
              </div>
              {patient.phone && (
                <div className="detail-item">
                  <dt>
                    <Phone size={16} /> Telefono
                  </dt>
                  <dd>
                    <a href={`tel:${patient.phone}`}>{patient.phone}</a>
                  </dd>
                </div>
              )}
              {patient.email && (
                <div className="detail-item">
                  <dt>
                    <Mail size={16} /> Email
                  </dt>
                  <dd>
                    <a href={`mailto:${patient.email}`}>{patient.email}</a>
                  </dd>
                </div>
              )}
            </dl>
            {patient.notes && (
              <div className="notes-section">
                <h3>Note</h3>
                <p className="notes-content">{patient.notes}</p>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Calendar size={20} />
                Appuntamenti
              </h2>
              <Link
                to={`/agenda?patient_id=${patient.id}`}
                className="btn btn-primary btn-sm"
              >
                <CalendarPlus size={16} />
                Nuovo
              </Link>
            </div>
            {appointments.length === 0 ? (
              <div className="empty-state-small">
                <p>Nessun appuntamento registrato</p>
              </div>
            ) : (
              <ul className="appointments-list">
                {appointments.map((apt) => (
                  <li key={apt.id} className="appointment-item">
                    <div className="appointment-time">
                      <Calendar size={16} />
                      {formatDateTime(apt.scheduled_at)}
                    </div>
                    <div className="appointment-details">
                      {apt.type && <span className="appointment-type">{apt.type}</span>}
                      <span className={`status-badge status-${apt.status}`}>
                        {APPOINTMENT_STATUS_LABELS[apt.status]}
                      </span>
                    </div>
                    {apt.notes && <p className="appointment-notes">{apt.notes}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {visits.length > 0 && (
            <div className="card">
              <h2 className="card-title">
                <ClipboardList size={20} />
                Visite completate
              </h2>
              <ul className="visits-list">
                {visits.map((visit) => (
                  <li key={visit.id} className="visit-item">
                    <div className="visit-date">
                      {formatDateTime(visit.created_at)}
                    </div>
                    {visit.treatment_notes && (
                      <p className="visit-notes">{visit.treatment_notes}</p>
                    )}
                    {visit.recommended_recall_date && (
                      <div className="visit-recall">
                        Richiamo consigliato: {formatDate(visit.recommended_recall_date)}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {!canDelete() && (
          <p className="permission-notice">
            <Trash2 size={16} />
            Come operatore, non hai i permessi per eliminare questo paziente.
          </p>
        )}
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifica Paziente"
        size="md"
      >
        <PatientForm
          patient={patient}
          onSubmit={handleSubmit}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Elimina paziente"
        message={`Sei sicuro di voler eliminare ${patient.first_name} ${patient.last_name}? Questa azione non può essere annullata.`}
        confirmLabel="Elimina"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  )
}
