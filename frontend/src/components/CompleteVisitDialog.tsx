import { useState, type FormEvent } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Modal } from './Modal'
import type { VisitCompleteData } from '@/types/appointment'

interface CompleteVisitDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: VisitCompleteData) => Promise<void>
  patientName: string
  isLoading?: boolean
}

export function CompleteVisitDialog({
  isOpen,
  onClose,
  onConfirm,
  patientName,
  isLoading = false,
}: CompleteVisitDialogProps) {
  const [treatmentNotes, setTreatmentNotes] = useState('')
  const [recommendedRecallDate, setRecommendedRecallDate] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      await onConfirm({
        treatment_notes: treatmentNotes || undefined,
        recommended_recall_date: recommendedRecallDate || undefined,
      })
      setTreatmentNotes('')
      setRecommendedRecallDate('')
    } catch (err) {
      setError('Errore durante il completamento della visita')
      console.error('Failed to complete visit:', err)
    }
  }

  function handleClose() {
    setTreatmentNotes('')
    setRecommendedRecallDate('')
    setError(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Completa Visita" size="md">
      <form onSubmit={handleSubmit} className="complete-visit-form">
        <div className="complete-visit-header">
          <CheckCircle size={24} className="complete-icon" />
          <p>
            Stai completando la visita di <strong>{patientName}</strong>
          </p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="treatment_notes">Note trattamento</label>
          <textarea
            id="treatment_notes"
            value={treatmentNotes}
            onChange={(e) => setTreatmentNotes(e.target.value)}
            disabled={isLoading}
            rows={4}
            placeholder="Descrivi il trattamento effettuato..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="recommended_recall_date">Data richiamo consigliata</label>
          <input
            type="date"
            id="recommended_recall_date"
            value={recommendedRecallDate}
            onChange={(e) => setRecommendedRecallDate(e.target.value)}
            disabled={isLoading}
            min={new Date().toISOString().split('T')[0]}
          />
          <span className="field-hint">
            Opzionale: suggerisci una data per il prossimo appuntamento
          </span>
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
          <button type="submit" className="btn btn-success" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="spinner-icon" />
                Completamento...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Completa visita
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}
