import { useState } from 'react'
import { Modal } from './Modal'
import type { Recall, RecallOutcome } from '@/types/recall'
import { RECALL_OUTCOME_LABELS } from '@/types/recall'

interface RecallOutcomeDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (outcome: RecallOutcome, notes: string | null) => void
  recall: Recall | null
  isLoading?: boolean
}

export function RecallOutcomeDialog({
  isOpen,
  onClose,
  onConfirm,
  recall,
  isLoading = false,
}: RecallOutcomeDialogProps) {
  const [outcome, setOutcome] = useState<RecallOutcome>('scheduled')
  const [notes, setNotes] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onConfirm(outcome, notes || null)
  }

  function handleClose() {
    setOutcome('scheduled')
    setNotes('')
    onClose()
  }

  if (!recall) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Registra esito richiamo" size="md">
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <p className="text-muted" style={{ marginBottom: '1rem' }}>
            Paziente: <strong>{recall.patient?.full_name || `Paziente #${recall.patient_id}`}</strong>
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="outcome" className="form-label">
            Esito <span className="required">*</span>
          </label>
          <select
            id="outcome"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as RecallOutcome)}
            className="form-select"
            required
            disabled={isLoading}
          >
            {Object.entries(RECALL_OUTCOME_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

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
            placeholder="Note sull'esito del richiamo..."
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
            {isLoading ? 'Salvataggio...' : 'Salva esito'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
