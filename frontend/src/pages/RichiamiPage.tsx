import { useState, useEffect, useCallback } from 'react'
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Filter,
  Loader2,
  Phone,
  PhoneCall,
  Search,
  User,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { RecallOutcomeDialog } from '@/components/RecallOutcomeDialog'
import * as recallsApi from '@/api/recalls'
import type { Recall, RecallStatus, RecallOutcome } from '@/types/recall'
import { RECALL_STATUS_LABELS, RECALL_OUTCOME_LABELS } from '@/types/recall'
import { ApiRequestError } from '@/api/client'

export function RichiamiPage() {
  const [recalls, setRecalls] = useState<Recall[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<RecallStatus | ''>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecalls, setTotalRecalls] = useState(0)

  const [outcomeRecall, setOutcomeRecall] = useState<Recall | null>(null)
  const [isSubmittingOutcome, setIsSubmittingOutcome] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  function handleStatusFilterChange(status: RecallStatus | '') {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  function handleDateFromChange(date: string) {
    setDateFrom(date)
    setCurrentPage(1)
  }

  function handleDateToChange(date: string) {
    setDateTo(date)
    setCurrentPage(1)
  }

  const loadRecalls = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await recallsApi.getRecalls({
        status: statusFilter || undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        search: debouncedSearch || undefined,
        page: currentPage,
        per_page: 15,
      })
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
  }, [statusFilter, dateFrom, dateTo, debouncedSearch, currentPage])

  useEffect(() => {
    loadRecalls()
  }, [loadRecalls])

  async function handleOutcomeSubmit(outcome: RecallOutcome, notes: string | null) {
    if (!outcomeRecall) return

    setIsSubmittingOutcome(true)
    try {
      await recallsApi.updateRecallOutcome(outcomeRecall.id, {
        outcome,
        outcome_notes: notes,
      })
      setOutcomeRecall(null)
      loadRecalls()
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message)
      } else {
        setError('Errore durante il salvataggio dell\'esito')
      }
      console.error('Failed to update recall outcome:', err)
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
      case 'completed':
        return 'badge-success'
      case 'contacted':
        return 'badge-info'
      case 'scheduled':
        return 'badge-primary'
      case 'cancelled':
        return 'badge-danger'
      default:
        return 'badge-warning'
    }
  }

  function isActionable(recall: Recall): boolean {
    return recall.status === 'pending' || recall.status === 'contacted'
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Richiami</h1>
        <div className="page-actions">
          {totalRecalls > 0 && (
            <span className="badge badge-info" style={{ marginRight: '0.5rem' }}>
              {recalls.filter(r => r.status === 'pending').length} in attesa
            </span>
          )}
        </div>
      </header>

      <div className="page-content">
        <div className="card">
          <div className="search-bar">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" aria-hidden="true" />
              <input
                type="search"
                placeholder="Cerca per nome paziente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                aria-label="Cerca richiami"
              />
            </div>
            <div className="filter-group">
              <Filter size={16} aria-hidden="true" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value as RecallStatus | '')}
                className="filter-select"
                aria-label="Filtra per stato"
              >
                <option value="">Tutti gli stati</option>
                {Object.entries(RECALL_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <Calendar size={16} aria-hidden="true" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => handleDateFromChange(e.target.value)}
                className="filter-input"
                aria-label="Data da"
                placeholder="Da"
              />
              <span className="filter-separator">—</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => handleDateToChange(e.target.value)}
                className="filter-input"
                aria-label="Data a"
                placeholder="A"
              />
            </div>
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
                {debouncedSearch || statusFilter || dateFrom || dateTo
                  ? 'Nessun richiamo trovato'
                  : 'Nessun richiamo in coda'}
              </h3>
              <p>
                {debouncedSearch || statusFilter || dateFrom || dateTo
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
                      <th>Data richiamo</th>
                      <th>Motivo</th>
                      <th>Stato</th>
                      <th>Esito</th>
                      <th>
                        <span className="sr-only">Azioni</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recalls.map((recall) => (
                      <tr key={recall.id} className={recall.status === 'pending' ? 'row-highlight' : ''}>
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
                            <Calendar size={14} />
                            {formatDate(recall.recall_date)}
                          </div>
                        </td>
                        <td>
                          {recall.reason || <span className="text-muted">Controllo periodico</span>}
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(recall.status)}`}>
                            {RECALL_STATUS_LABELS[recall.status]}
                          </span>
                        </td>
                        <td>
                          {recall.outcome ? (
                            <div>
                              <span className="text-small">{RECALL_OUTCOME_LABELS[recall.outcome]}</span>
                              {recall.contacted_at && (
                                <div className="text-muted text-xs">
                                  {formatDateTime(recall.contacted_at)}
                                </div>
                              )}
                            </div>
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
