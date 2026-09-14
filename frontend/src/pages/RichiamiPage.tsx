import { useState, useEffect, useCallback } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Filter,
  Loader2,
  Phone,
  PhoneCall,
  RefreshCw,
  Search,
  User,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { RecallOutcomeDialog } from '@/components/RecallOutcomeDialog'
import * as recallsApi from '@/api/recalls'
import type { RecallTask, RecallStatus, ContactOutcomeType } from '@/types/recall'
import { RECALL_STATUS_LABELS } from '@/types/recall'
import { ApiRequestError } from '@/api/client'

export function RichiamiPage() {
  const [recalls, setRecalls] = useState<RecallTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<RecallStatus | ''>('')
  const [daysAhead, setDaysAhead] = useState(7)
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecalls, setTotalRecalls] = useState(0)

  const [outcomeRecall, setOutcomeRecall] = useState<RecallTask | null>(null)
  const [isSubmittingOutcome, setIsSubmittingOutcome] = useState(false)

  const [useQueueMode, setUseQueueMode] = useState(true)

  function handleStatusFilterChange(status: RecallStatus | '') {
    setStatusFilter(status)
    setCurrentPage(1)
    if (status) {
      setUseQueueMode(false)
    }
  }

  function handleDaysAheadChange(days: number) {
    setDaysAhead(days)
    setCurrentPage(1)
    setUseQueueMode(true)
    setStatusFilter('')
    setOverdueOnly(false)
  }

  function handleOverdueOnlyChange(checked: boolean) {
    setOverdueOnly(checked)
    setCurrentPage(1)
    if (checked) {
      setUseQueueMode(false)
    }
  }

  const loadRecalls = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      let response
      if (useQueueMode && !statusFilter && !overdueOnly) {
        response = await recallsApi.getRecallsQueue({
          days_ahead: daysAhead,
          page: currentPage,
          per_page: 15,
        })
      } else {
        response = await recallsApi.getRecalls({
          status: statusFilter || undefined,
          overdue_only: overdueOnly || undefined,
          page: currentPage,
          per_page: 15,
        })
      }
      setRecalls(response.data)
      setTotalPages(response.meta.last_page)
      setTotalRecalls(response.meta.total)
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        return
      }
      setError('Errore nel caricamento dei richiami. Riprova più tardi.')
      console.error('Failed to load recalls:', err)
    } finally {
      setIsLoading(false)
    }
  }, [useQueueMode, statusFilter, overdueOnly, daysAhead, currentPage])

  useEffect(() => {
    loadRecalls()
  }, [loadRecalls])

  async function handleOutcomeSubmit(
    outcome: ContactOutcomeType,
    notes: string | null,
    appointmentId: number | null
  ) {
    if (!outcomeRecall) return

    setIsSubmittingOutcome(true)
    try {
      await recallsApi.recordContactOutcome(outcomeRecall.id, {
        outcome,
        notes,
        resulting_appointment_id: appointmentId,
      })
      setOutcomeRecall(null)
      loadRecalls()
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message)
      } else {
        setError('Errore durante il salvataggio dell\'esito')
      }
      console.error('Failed to record contact outcome:', err)
    } finally {
      setIsSubmittingOutcome(false)
    }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('it-IT')
  }

  function formatDateTime(dateStr: string | null): string {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function getStatusBadgeClass(status: RecallStatus): string {
    switch (status) {
      case 'scheduled':
        return 'badge-success'
      case 'contacted':
        return 'badge-info'
      case 'pending':
        return 'badge-warning'
      case 'declined':
      case 'expired':
        return 'badge-danger'
      case 'no_answer':
        return 'badge-secondary'
      default:
        return 'badge-secondary'
    }
  }

  function isActionable(recall: RecallTask): boolean {
    return recall.status === 'pending' || recall.status === 'contacted' || recall.status === 'no_answer'
  }

  const pendingCount = recalls.filter(r => r.status === 'pending').length
  const overdueCount = recalls.filter(r => r.is_overdue).length

  return (
    <div className="page">
      <header className="page-header">
        <h1>Richiami</h1>
        <div className="page-actions">
          {totalRecalls > 0 && (
            <>
              <span className="badge badge-warning" style={{ marginRight: '0.5rem' }}>
                {pendingCount} in attesa
              </span>
              {overdueCount > 0 && (
                <span className="badge badge-danger" style={{ marginRight: '0.5rem' }}>
                  {overdueCount} scadut{overdueCount === 1 ? 'o' : 'i'}
                </span>
              )}
            </>
          )}
          <button
            className="btn btn-secondary"
            onClick={loadRecalls}
            disabled={isLoading}
            title="Aggiorna lista"
          >
            <RefreshCw size={18} className={isLoading ? 'spinner-icon' : ''} />
          </button>
        </div>
      </header>

      <div className="page-content">
        <div className="card">
          <div className="search-bar search-bar-wrap">
            <div className="filter-group">
              <Filter size={16} aria-hidden="true" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value as RecallStatus | '')}
                className="filter-select"
                aria-label="Filtra per stato"
              >
                <option value="">Coda attiva</option>
                {Object.entries(RECALL_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {useQueueMode && !statusFilter && (
              <div className="filter-group">
                <Calendar size={16} aria-hidden="true" />
                <select
                  value={daysAhead}
                  onChange={(e) => handleDaysAheadChange(parseInt(e.target.value, 10))}
                  className="filter-select"
                  aria-label="Giorni in anticipo"
                >
                  <option value={3}>Prossimi 3 giorni</option>
                  <option value={7}>Prossimi 7 giorni</option>
                  <option value={14}>Prossimi 14 giorni</option>
                  <option value={30}>Prossimi 30 giorni</option>
                </select>
              </div>
            )}
            <label className="form-checkbox" style={{ marginLeft: 'auto' }}>
              <input
                type="checkbox"
                checked={overdueOnly}
                onChange={(e) => handleOverdueOnlyChange(e.target.checked)}
              />
              <span>Solo scaduti</span>
            </label>
            {totalRecalls > 0 && (
              <span className="results-count">
                {totalRecalls} richiam{totalRecalls === 1 ? 'o' : 'i'}
              </span>
            )}
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              <AlertCircle size={18} />
              {error}
              <button
                className="btn btn-secondary btn-sm"
                onClick={loadRecalls}
                style={{ marginLeft: 'auto' }}
              >
                Riprova
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="loading-state">
              <Loader2 size={32} className="spinner-icon" />
              <span>Caricamento richiami...</span>
            </div>
          ) : recalls.length === 0 ? (
            <div className="empty-state">
              <PhoneCall size={48} className="empty-icon" />
              <h3>
                {statusFilter || overdueOnly
                  ? 'Nessun richiamo trovato'
                  : 'Nessun richiamo in coda'}
              </h3>
              <p>
                {statusFilter || overdueOnly
                  ? 'Prova a modificare i criteri di ricerca'
                  : 'I richiami appariranno qui quando le visite avranno una data di richiamo consigliata'}
              </p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Paziente</th>
                      <th>Scadenza</th>
                      <th>Stato</th>
                      <th>Tentativi</th>
                      <th>Ultimo contatto</th>
                      <th>
                        <span className="sr-only">Azioni</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recalls.map((recall) => (
                      <tr key={recall.id} className={recall.is_overdue ? 'row-highlight' : ''}>
                        <td>
                          <div className="patient-name">
                            <span className="patient-avatar">
                              {recall.patient ? (
                                <>
                                  {recall.patient.first_name.charAt(0)}
                                  {recall.patient.last_name.charAt(0)}
                                </>
                              ) : (
                                <User size={16} />
                              )}
                            </span>
                            <div>
                              {recall.patient ? (
                                <Link to={`/pazienti/${recall.patient_id}`} className="patient-link">
                                  <strong>
                                    {recall.patient.last_name} {recall.patient.first_name}
                                  </strong>
                                </Link>
                              ) : (
                                <strong>Paziente #{recall.patient_id}</strong>
                              )}
                              {recall.patient?.phone && (
                                <a
                                  href={`tel:${recall.patient.phone}`}
                                  className="contact-link"
                                  title={recall.patient.phone}
                                >
                                  <Phone size={12} />
                                  {recall.patient.phone}
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="date-cell">
                            {recall.is_overdue && (
                              <AlertTriangle size={14} className="status-icon-danger" title="Scaduto" />
                            )}
                            <Calendar size={14} />
                            {formatDate(recall.due_date)}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(recall.status)}`}>
                            {recall.status_label || RECALL_STATUS_LABELS[recall.status]}
                          </span>
                        </td>
                        <td>
                          <span className="text-muted">
                            {recall.contact_attempts}
                          </span>
                        </td>
                        <td>
                          {recall.last_contact_at ? (
                            <span className="text-small text-muted">
                              {formatDateTime(recall.last_contact_at)}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <div className="row-actions">
                            {isActionable(recall) && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setOutcomeRecall(recall)}
                                title="Registra esito"
                              >
                                <ClipboardCheck size={16} />
                                Esito
                              </button>
                            )}
                            {recall.patient && (
                              <Link
                                to={`/pazienti/${recall.patient_id}`}
                                className="btn btn-icon btn-sm"
                                title="Vedi paziente"
                              >
                                <User size={16} />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    aria-label="Pagina precedente"
                  >
                    <ChevronLeft size={16} />
                    Precedente
                  </button>
                  <span className="pagination-info">
                    Pagina {currentPage} di {totalPages}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Pagina successiva"
                  >
                    Successiva
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <RecallOutcomeDialog
        isOpen={!!outcomeRecall}
        onClose={() => setOutcomeRecall(null)}
        onConfirm={handleOutcomeSubmit}
        recall={outcomeRecall}
        isLoading={isSubmittingOutcome}
      />
    </div>
  )
}
