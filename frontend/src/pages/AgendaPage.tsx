import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Loader2,
  Trash2,
  User,
  AlertCircle,
  CalendarOff,
  CheckCircle,
  XCircle,
  UserX,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Modal } from '@/components/Modal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { AppointmentForm } from '@/components/AppointmentForm'
import { CompleteVisitDialog } from '@/components/CompleteVisitDialog'
import * as appointmentsApi from '@/api/appointments'
import type { Appointment, AppointmentFormData, AppointmentStatus, VisitCompleteData } from '@/types/appointment'
import { APPOINTMENT_STATUS_LABELS, isEditableStatus, isCompletableStatus } from '@/types/appointment'
import { ApiRequestError } from '@/api/client'

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8)

function formatDateParam(date: Date): string {
  return date.toISOString().split('T')[0]
}

function parseDateParam(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getAppointmentPosition(appointment: Appointment): { top: number; height: number } {
  const start = new Date(appointment.scheduled_at)
  const startHour = start.getHours()
  const startMinutes = start.getMinutes()
  const top = (startHour - 8) * 60 + startMinutes
  const height = Math.max(appointment.duration_minutes, 20)
  return { top, height }
}

export function AgendaPage() {
  const { canDelete } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const dateParam = searchParams.get('date')
  const patientIdParam = searchParams.get('patient_id')

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (dateParam) {
      return parseDateParam(dateParam)
    }
    return new Date()
  })

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteAppointment, setDeleteAppointment] = useState<Appointment | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [statusMenuAppointment, setStatusMenuAppointment] = useState<Appointment | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const [completeAppointment, setCompleteAppointment] = useState<Appointment | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)

  useEffect(() => {
    if (patientIdParam) {
      setIsFormModalOpen(true)
    }
  }, [patientIdParam])

  const loadAppointments = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await appointmentsApi.getAppointments({
        date: formatDateParam(selectedDate),
      })
      setAppointments(response.data)
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        return
      }
      setError('Errore nel caricamento degli appuntamenti. Riprova più tardi.')
      console.error('Failed to load appointments:', err)
    } finally {
      setIsLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  function navigateDate(direction: 'prev' | 'next') {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    setSelectedDate(newDate)
    setSearchParams({ date: formatDateParam(newDate) })
  }

  function goToToday() {
    const today = new Date()
    setSelectedDate(today)
    setSearchParams({ date: formatDateParam(today) })
  }

  function openCreateModal() {
    setEditingAppointment(null)
    setIsFormModalOpen(true)
  }

  function openEditModal(appointment: Appointment) {
    if (!isEditableStatus(appointment.status)) {
      return
    }
    setEditingAppointment(appointment)
    setIsFormModalOpen(true)
  }

  function closeFormModal() {
    setIsFormModalOpen(false)
    setEditingAppointment(null)
    if (patientIdParam) {
      searchParams.delete('patient_id')
      setSearchParams(searchParams)
    }
  }

  async function handleSubmit(data: AppointmentFormData) {
    setIsSubmitting(true)
    try {
      if (editingAppointment) {
        await appointmentsApi.updateAppointment(editingAppointment.id, data)
      } else {
        await appointmentsApi.createAppointment(data)
      }
      closeFormModal()
      loadAppointments()
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleStatusChange(appointment: Appointment, newStatus: AppointmentStatus) {
    setIsUpdatingStatus(true)
    try {
      await appointmentsApi.updateAppointmentStatus(appointment.id, newStatus)
      setStatusMenuAppointment(null)
      loadAppointments()
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message)
      } else {
        setError('Errore durante l\'aggiornamento dello stato')
      }
      console.error('Failed to update status:', err)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  async function handleCompleteVisit(data: VisitCompleteData) {
    if (!completeAppointment) return

    setIsCompleting(true)
    try {
      await appointmentsApi.completeVisit(completeAppointment.id, data)
      setCompleteAppointment(null)
      loadAppointments()
    } finally {
      setIsCompleting(false)
    }
  }

  async function handleDelete() {
    if (!deleteAppointment) return

    setIsDeleting(true)
    try {
      await appointmentsApi.deleteAppointment(deleteAppointment.id)
      setDeleteAppointment(null)
      loadAppointments()
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message)
      } else {
        setError('Errore durante l\'eliminazione dell\'appuntamento')
      }
      setDeleteAppointment(null)
      console.error('Failed to delete appointment:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  function formatTime(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isToday = selectedDate.toDateString() === new Date().toDateString()

  return (
    <div className="page">
      <header className="page-header">
        <h1>Agenda</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreateModal}>
            <CalendarPlus size={18} />
            Nuovo Appuntamento
          </button>
        </div>
      </header>

      <div className="page-content">
        <div className="card agenda-card">
          <div className="agenda-header">
            <div className="agenda-nav">
              <button
                className="btn btn-icon"
                onClick={() => navigateDate('prev')}
                aria-label="Giorno precedente"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={goToToday}
                disabled={isToday}
              >
                Oggi
              </button>
              <button
                className="btn btn-icon"
                onClick={() => navigateDate('next')}
                aria-label="Giorno successivo"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <h2 className="agenda-date">{formatDisplayDate(selectedDate)}</h2>
            <div className="agenda-date-picker">
              <input
                type="date"
                value={formatDateParam(selectedDate)}
                onChange={(e) => {
                  const newDate = parseDateParam(e.target.value)
                  setSelectedDate(newDate)
                  setSearchParams({ date: formatDateParam(newDate) })
                }}
                aria-label="Seleziona data"
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              <AlertCircle size={18} />
              {error}
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setError(null)}
                style={{ marginLeft: 'auto' }}
              >
                Chiudi
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="loading-state">
              <Loader2 size={32} className="spinner-icon" />
              <span>Caricamento appuntamenti...</span>
            </div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">
              <CalendarOff size={48} className="empty-icon" />
              <h3>Nessun appuntamento</h3>
              <p>Non ci sono appuntamenti programmati per questa data</p>
              <button className="btn btn-primary" onClick={openCreateModal}>
                <CalendarPlus size={18} />
                Nuovo appuntamento
              </button>
            </div>
          ) : (
            <div className="day-view">
              <div className="time-slots">
                {HOURS.map((hour) => (
                  <div key={hour} className="time-slot">
                    <span className="time-label">{hour.toString().padStart(2, '0')}:00</span>
                    <div className="time-line" />
                  </div>
                ))}
              </div>
              <div className="appointments-container">
                {appointments.map((apt) => {
                  const { top, height } = getAppointmentPosition(apt)
                  const canEdit = isEditableStatus(apt.status)
                  const canComplete = isCompletableStatus(apt.status)
                  
                  return (
                    <div
                      key={apt.id}
                      className={`appointment-block status-${apt.status} ${!canEdit ? 'appointment-readonly' : ''}`}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        minHeight: '40px',
                      }}
                      role={canEdit ? 'button' : undefined}
                      tabIndex={canEdit ? 0 : undefined}
                      onClick={() => canEdit && openEditModal(apt)}
                      onKeyDown={(e) => {
                        if (canEdit && (e.key === 'Enter' || e.key === ' ')) {
                          openEditModal(apt)
                        }
                      }}
                    >
                      <div className="appointment-header">
                        <span className="appointment-time-range">
                          <Clock size={12} />
                          {formatTime(apt.scheduled_at)} - {apt.duration_minutes} min
                        </span>
                        <span className={`status-badge status-${apt.status}`}>
                          {APPOINTMENT_STATUS_LABELS[apt.status]}
                        </span>
                      </div>
                      {apt.patient && (
                        <Link
                          to={`/pazienti/${apt.patient.id}`}
                          className="appointment-patient"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <User size={14} />
                          {apt.patient.last_name} {apt.patient.first_name}
                        </Link>
                      )}
                      {apt.type && (
                        <span className="appointment-type">{apt.type}</span>
                      )}
                      <div className="appointment-actions">
                        {canComplete && (
                          <button
                            className="btn btn-icon btn-sm btn-complete"
                            onClick={(e) => {
                              e.stopPropagation()
                              setCompleteAppointment(apt)
                            }}
                            title="Completa visita"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {canEdit && (
                          <>
                            <button
                              className="btn btn-icon btn-sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setStatusMenuAppointment(apt)
                              }}
                              title="Cambia stato"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              className="btn btn-icon btn-sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                openEditModal(apt)
                              }}
                              title="Modifica"
                            >
                              <Edit size={14} />
                            </button>
                          </>
                        )}
                        {canDelete() && canEdit && (
                          <button
                            className="btn btn-icon btn-sm btn-danger"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteAppointment(apt)
                            }}
                            title="Elimina"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {!canDelete() && appointments.length > 0 && (
            <p className="permission-notice">
              <Trash2 size={16} />
              Come operatore, non hai i permessi per eliminare appuntamenti.
            </p>
          )}
        </div>
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        title={editingAppointment ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}
        size="md"
      >
        <AppointmentForm
          appointment={editingAppointment}
          selectedDate={formatDateParam(selectedDate)}
          preselectedPatientId={patientIdParam ? Number(patientIdParam) : null}
          onSubmit={handleSubmit}
          onCancel={closeFormModal}
          isLoading={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={!!statusMenuAppointment}
        onClose={() => setStatusMenuAppointment(null)}
        title="Cambia Stato"
        size="sm"
      >
        <div className="status-menu">
          <p className="status-menu-info">
            Seleziona il nuovo stato per l'appuntamento
          </p>
          <div className="status-options">
            <button
              className="status-option"
              onClick={() => statusMenuAppointment && handleStatusChange(statusMenuAppointment, 'confirmed')}
              disabled={isUpdatingStatus || statusMenuAppointment?.status === 'confirmed'}
            >
              <Check size={18} className="status-icon-confirmed" />
              <span>Confermato</span>
            </button>
            <button
              className="status-option"
              onClick={() => statusMenuAppointment && handleStatusChange(statusMenuAppointment, 'cancelled')}
              disabled={isUpdatingStatus}
            >
              <XCircle size={18} className="status-icon-cancelled" />
              <span>Annullato</span>
            </button>
            <button
              className="status-option"
              onClick={() => statusMenuAppointment && handleStatusChange(statusMenuAppointment, 'no_show')}
              disabled={isUpdatingStatus}
            >
              <UserX size={18} className="status-icon-no_show" />
              <span>Non presentato</span>
            </button>
          </div>
          {isUpdatingStatus && (
            <div className="status-loading">
              <Loader2 size={16} className="spinner-icon" />
              <span>Aggiornamento...</span>
            </div>
          )}
        </div>
      </Modal>

      <CompleteVisitDialog
        isOpen={!!completeAppointment}
        onClose={() => setCompleteAppointment(null)}
        onConfirm={handleCompleteVisit}
        patientName={
          completeAppointment?.patient
            ? `${completeAppointment.patient.first_name} ${completeAppointment.patient.last_name}`
            : ''
        }
        isLoading={isCompleting}
      />

      <ConfirmDialog
        isOpen={!!deleteAppointment}
        onClose={() => setDeleteAppointment(null)}
        onConfirm={handleDelete}
        title="Elimina appuntamento"
        message={
          deleteAppointment
            ? `Sei sicuro di voler eliminare l'appuntamento di ${deleteAppointment.patient?.last_name || ''} ${deleteAppointment.patient?.first_name || ''} del ${formatTime(deleteAppointment.scheduled_at)}?`
            : ''
        }
        confirmLabel="Elimina"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  )
}
