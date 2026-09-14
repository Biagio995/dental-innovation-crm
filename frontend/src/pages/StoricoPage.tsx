import { useState, useEffect, useCallback } from 'react'
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  History,
  Loader2,
  Mail,
  MessageSquare,
  Search,
  User,
  XCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import * as communicationsApi from '@/api/communications'
import type {
  CommunicationLog,
  CommunicationChannel,
  CommunicationStatus,
  ReminderType,
} from '@/types/communication'
import {
  COMMUNICATION_CHANNEL_LABELS,
  COMMUNICATION_STATUS_LABELS,
  REMINDER_TYPE_LABELS,
  getStatusColor,
} from '@/types/communication'
import { ApiRequestError } from '@/api/client'

export function StoricoPage() {
  const [communications, setCommunications] = useState<CommunicationLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [channelFilter, setChannelFilter] = useState<CommunicationChannel | ''>('')
  const [statusFilter, setStatusFilter] = useState<CommunicationStatus | ''>('')
  const [reminderTypeFilter, setReminderTypeFilter] = useState<ReminderType | ''>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCommunications, setTotalCommunications] = useState(0)

  function handleChannelFilterChange(channel: CommunicationChannel | '') {
    setChannelFilter(channel)
    setCurrentPage(1)
  }

  function handleStatusFilterChange(status: CommunicationStatus | '') {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  function handleReminderTypeFilterChange(type: ReminderType | '') {
    setReminderTypeFilter(type)
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

  const loadCommunications = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await communicationsApi.getCommunications({
        channel: channelFilter || undefined,
        status: statusFilter || undefined,
        reminder_type: reminderTypeFilter || undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        page: currentPage,
        per_page: 15,
      })
      setCommunications(response.data)
      setTotalPages(response.meta.last_page)
      setTotalCommunications(response.meta.total)
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        return
      }
      setError('Errore nel caricamento dello storico. Riprova più tardi.')
      console.error('Failed to load communications:', err)
    } finally {
      setIsLoading(false)
    }
  }, [channelFilter, statusFilter, reminderTypeFilter, dateFrom, dateTo, currentPage])

  useEffect(() => {
    loadCommunications()
  }, [loadCommunications])

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

  function getChannelIcon(channel: CommunicationChannel) {
    return channel === 'sms' ? <MessageSquare size={16} /> : <Mail size={16} />
  }

  function getStatusIcon(status: CommunicationStatus) {
    switch (status) {
      case 'delivered':
        return <CheckCircle size={16} className="status-icon-success" />
      case 'sent':
        return <CheckCircle size={16} className="status-icon-info" />
      case 'queued':
        return <Clock size={16} className="status-icon-warning" />
      case 'failed':
      case 'bounced':
        return <XCircle size={16} className="status-icon-danger" />
      default:
        return null
    }
  }

  function truncateContent(content: string, maxLength: number = 60): string {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + '...'
  }

  const hasFilters = channelFilter || statusFilter || reminderTypeFilter || dateFrom || dateTo

  return (
    <div className="page">
      <header className="page-header">
        <h1>Storico Comunicazioni</h1>
      </header>

      <div className="page-content">
        <div className="card">
          <div className="search-bar search-bar-wrap">
            <div className="filter-group">
              <Filter size={16} aria-hidden="true" />
              <select
                value={channelFilter}
                onChange={(e) => handleChannelFilterChange(e.target.value as CommunicationChannel | '')}
                className="filter-select"
                aria-label="Filtra per canale"
              >
                <option value="">Tutti i canali</option>
                {Object.entries(COMMUNICATION_CHANNEL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <select
                value={reminderTypeFilter}
                onChange={(e) => handleReminderTypeFilterChange(e.target.value as ReminderType | '')}
                className="filter-select"
                aria-label="Filtra per tipo"
              >
                <option value="">Tutti i tipi</option>
                {Object.entries(REMINDER_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value as CommunicationStatus | '')}
                className="filter-select"
                aria-label="Filtra per stato"
              >
                <option value="">Tutti gli stati</option>
                {Object.entries(COMMUNICATION_STATUS_LABELS).map(([value, label]) => (
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
              />
              <span className="filter-separator">—</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => handleDateToChange(e.target.value)}
                className="filter-input"
                aria-label="Data a"
              />
            </div>
            {totalCommunications > 0 && (
              <span className="results-count">
                {totalCommunications} comunicazion{totalCommunications === 1 ? 'e' : 'i'}
              </span>
            )}
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              <AlertCircle size={18} />
              {error}
              <button
                className="btn btn-secondary btn-sm"
                onClick={loadCommunications}
                style={{ marginLeft: 'auto' }}
              >
                Riprova
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="loading-state">
              <Loader2 size={32} className="spinner-icon" />
              <span>Caricamento storico...</span>
            </div>
          ) : communications.length === 0 ? (
            <div className="empty-state">
              <History size={48} className="empty-icon" />
              <h3>
                {hasFilters
                  ? 'Nessuna comunicazione trovata'
                  : 'Nessuna comunicazione registrata'}
              </h3>
              <p>
                {hasFilters
                  ? 'Prova a modificare i criteri di ricerca'
                  : 'Le comunicazioni inviate appariranno qui'}
              </p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Data/ora</th>
                      <th>Paziente</th>
                      <th>Canale</th>
                      <th>Tipo</th>
                      <th>Destinatario</th>
                      <th>Contenuto</th>
                      <th>Stato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {communications.map((comm) => (
                      <tr key={comm.id}>
                        <td>
                          <div className="date-cell">
                            <Clock size={14} />
                            {formatDateTime(comm.sent_at || comm.created_at)}
                          </div>
                        </td>
                        <td>
                          <div className="patient-name">
                            <span className="patient-avatar patient-avatar-sm">
                              {comm.patient ? (
                                <>
                                  {comm.patient.first_name.charAt(0)}
                                  {comm.patient.last_name.charAt(0)}
                                </>
                              ) : (
                                <User size={12} />
                              )}
                            </span>
                            {comm.patient ? (
                              <Link to={`/pazienti/${comm.patient_id}`} className="patient-link">
                                {comm.patient.last_name} {comm.patient.first_name}
                              </Link>
                            ) : (
                              <span>Paziente #{comm.patient_id}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="channel-badge channel-badge-sm">
                            {getChannelIcon(comm.channel)}
                            {comm.channel_label || COMMUNICATION_CHANNEL_LABELS[comm.channel]}
                          </span>
                        </td>
                        <td>
                          {comm.reminder_type ? (
                            <span className="badge badge-secondary badge-sm">
                              {comm.reminder_type_label || REMINDER_TYPE_LABELS[comm.reminder_type]}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <span className="text-small">{comm.recipient}</span>
                        </td>
                        <td>
                          <div className="content-preview-cell">
                            {comm.subject && (
                              <div className="text-muted text-xs">
                                {truncateContent(comm.subject, 30)}
                              </div>
                            )}
                            <span className="content-preview text-small">
                              {truncateContent(comm.body)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="status-cell">
                            {getStatusIcon(comm.status)}
                            <span className={`badge badge-${getStatusColor(comm.status)} badge-sm`}>
                              {comm.status_label || COMMUNICATION_STATUS_LABELS[comm.status]}
                            </span>
                            {comm.error_message && (
                              <span className="error-hint" title={comm.error_message}>
                                <AlertCircle size={14} />
                              </span>
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
    </div>
  )
}
