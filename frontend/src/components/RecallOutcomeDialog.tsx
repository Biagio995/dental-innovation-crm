import { useState } from 'react'
import { Modal } from './Modal'
import type { RecallTask, ContactOutcomeType } from '@/types/recall'
import { CONTACT_OUTCOME_LABELS } from '@/types/recall'

interface RecallOutcomeDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (outcome: ContactOutcomeType, notes: string | null, appointmentId: number | null) => void
  recall: RecallTask | null
  isLoading?: boolean
}

export function RecallOutcomeDialog({
  isOpen,
  onClose,
  onConfirm,
  recall,
  isLoading = false,
}: RecallOutcomeDialogProps) {
  const [outcome, setOutcome] = useState<ContactOutcomeType>('contacted')
  const [notes, setNotes] = useState('')
  const [appointmentId, setAppointmentId] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onConfirm(
      outcome,
      notes || null,
      outcome === 'scheduled' && appointmentId ? parseInt(appointmentId, 10) : null
    )
  }

  function handleClose() {
    setOutcome('contacted')
    setNotes('')
    setAppointmentId('')
    onClose()
  }

  if (!recall) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Registra esito contatto" size="md">
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <p className="text-muted" style={{ marginBottom: '1rem' }}>
            Paziente: <strong>{recall.patient?.full_name || `Paziente #${recall.patient_id}`}</strong>
            {recall.contact_attempts > 0 && (
              <span className="text-small" style={{ marginLeft: '0.5rem' }}>
                ({recall.contact_attempts} tentativ{recall.contact_attempts === 1 ? 'o' : 'i'} precedent{recall.contact_attempts === 1 ? 'e' : 'i'})
              </span>
            )}
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="outcome" className="form-label">
            Esito <span className="required">*</span>
          </label>
          <select
            id="outcome"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as ContactOutcomeType)}
            className="form-select"
            required
            disabled={isLoading}
          >
            {Object.entries(CONTACT_OUTCOME_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {outcome === 'scheduled' && (
          <div className="form-group">
            <label htmlFor="appointment-id" className="form-label">
              ID Appuntamento <span className="required">*</span>
            </label>
            <input
              type="number"
              id="appointment-id"
              value={appointmentId}
              onChange={(e) => setAppointmentId(e.target.value)}
              className="form-input"
              required={outcome === 'scheduled'}
              disabled={isLoading}
              placeholder="ID dell'appuntamento creato"
            />
            <p className="form-hint">
              Inserisci l'ID dell'appuntamento appena creato per questo paziente
            </p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="outcome-notes" className="form-label">
            Note
          </label>
          <textarea
            id="outcome-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-textarea"
            rows={3}
            placeholder="Note sull'esito del contatto..."
            disabled={isLoading}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Annulla
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Salvataggio...' : 'Registra esito'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
