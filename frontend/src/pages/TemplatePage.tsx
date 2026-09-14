import { useState, useEffect, useCallback } from 'react'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Edit,
  FileText,
  Filter,
  FilePlus,
  Loader2,
  Mail,
  MessageSquare,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Modal } from '@/components/Modal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { TemplateForm } from '@/components/TemplateForm'
import * as templatesApi from '@/api/templates'
import type { Template, TemplateFormData, TemplateChannel, TemplateType } from '@/types/template'
import { TEMPLATE_CHANNEL_LABELS, TEMPLATE_TYPE_LABELS } from '@/types/template'
import { ApiRequestError } from '@/api/client'

export function TemplatePage() {
  const { canDelete } = useAuth()

  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [channelFilter, setChannelFilter] = useState<TemplateChannel | ''>('')
  const [typeFilter, setTypeFilter] = useState<TemplateType | ''>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTemplates, setTotalTemplates] = useState(0)

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTemplate, setDeleteTemplate] = useState<Template | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  function handleChannelFilterChange(channel: TemplateChannel | '') {
    setChannelFilter(channel)
    setCurrentPage(1)
  }

  function handleTypeFilterChange(type: TemplateType | '') {
    setTypeFilter(type)
    setCurrentPage(1)
  }

  const loadTemplates = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await templatesApi.getTemplates({
        channel: channelFilter || undefined,
        type: typeFilter || undefined,
        search: debouncedSearch || undefined,
        page: currentPage,
        per_page: 15,
      })
      setTemplates(response.data)
      setTotalPages(response.meta.last_page)
      setTotalTemplates(response.meta.total)
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        return
      }
      setError('Errore nel caricamento dei template. Riprova più tardi.')
      console.error('Failed to load templates:', err)
    } finally {
      setIsLoading(false)
    }
  }, [channelFilter, typeFilter, debouncedSearch, currentPage])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  function openCreateModal() {
    setEditingTemplate(null)
    setIsFormModalOpen(true)
  }

  function openEditModal(template: Template) {
    setEditingTemplate(template)
    setIsFormModalOpen(true)
  }

  function closeFormModal() {
    setIsFormModalOpen(false)
    setEditingTemplate(null)
  }

  async function handleSubmit(data: TemplateFormData) {
    setIsSubmitting(true)
    try {
      if (editingTemplate) {
        await templatesApi.updateTemplate(editingTemplate.id, data)
      } else {
        await templatesApi.createTemplate(data)
      }
      closeFormModal()
      loadTemplates()
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTemplate) return

    setIsDeleting(true)
    try {
      await templatesApi.deleteTemplate(deleteTemplate.id)
      setDeleteTemplate(null)
      loadTemplates()
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message)
      } else {
        setError('Errore durante l\'eliminazione del template')
      }
      setDeleteTemplate(null)
      console.error('Failed to delete template:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  function getChannelIcon(channel: TemplateChannel) {
    return channel === 'sms' ? <MessageSquare size={16} /> : <Mail size={16} />
  }

  function truncateContent(content: string, maxLength: number = 80): string {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + '...'
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Template</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreateModal}>
            <FilePlus size={18} />
            Nuovo Template
          </button>
        </div>
      </header>

      <div className="page-content">
        <div className="card">
          <div className="search-bar">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" aria-hidden="true" />
              <input
                type="search"
                placeholder="Cerca per nome o contenuto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                aria-label="Cerca template"
              />
            </div>
            <div className="filter-group">
              <Filter size={16} aria-hidden="true" />
              <select
                value={channelFilter}
                onChange={(e) => handleChannelFilterChange(e.target.value as TemplateChannel | '')}
                className="filter-select"
                aria-label="Filtra per canale"
              >
                <option value="">Tutti i canali</option>
                {Object.entries(TEMPLATE_CHANNEL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <select
                value={typeFilter}
                onChange={(e) => handleTypeFilterChange(e.target.value as TemplateType | '')}
                className="filter-select"
                aria-label="Filtra per tipo"
              >
                <option value="">Tutti i tipi</option>
                {Object.entries(TEMPLATE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {totalTemplates > 0 && (
              <span className="results-count">
                {totalTemplates} template
              </span>
            )}
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              <AlertCircle size={18} />
              {error}
              <button
                className="btn btn-secondary btn-sm"
                onClick={loadTemplates}
                style={{ marginLeft: 'auto' }}
              >
                Riprova
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="loading-state">
              <Loader2 size={32} className="spinner-icon" />
              <span>Caricamento template...</span>
            </div>
          ) : templates.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} className="empty-icon" />
              <h3>
                {debouncedSearch || channelFilter || typeFilter
                  ? 'Nessun template trovato'
                  : 'Nessun template presente'}
              </h3>
              <p>
                {debouncedSearch || channelFilter || typeFilter
                  ? 'Prova a modificare i criteri di ricerca'
                  : 'Clicca su "Nuovo Template" per crearne uno'}
              </p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Canale</th>
                      <th>Tipo</th>
                      <th>Contenuto</th>
                      <th>Stato</th>
                      <th>
                        <span className="sr-only">Azioni</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map((template) => (
                      <tr key={template.id}>
                        <td>
                          <strong>{template.name}</strong>
                          {template.subject && (
                            <div className="text-muted text-sm">
                              Oggetto: {truncateContent(template.subject, 40)}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="channel-badge">
                            {getChannelIcon(template.channel)}
                            {TEMPLATE_CHANNEL_LABELS[template.channel]}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-secondary">
                            {TEMPLATE_TYPE_LABELS[template.type]}
                          </span>
                        </td>
                        <td>
                          <span className="content-preview">
                            {truncateContent(template.content)}
                          </span>
                        </td>
                        <td>
                          {template.is_active ? (
                            <span className="status-active" title="Attivo">
                              <ToggleRight size={20} />
                            </span>
                          ) : (
                            <span className="status-inactive" title="Disattivato">
                              <ToggleLeft size={20} />
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="btn btn-icon"
                              onClick={() => openEditModal(template)}
                              title="Modifica"
                            >
                              <Edit size={18} />
                            </button>
                            {canDelete() ? (
                              <button
                                className="btn btn-icon btn-danger"
                                onClick={() => setDeleteTemplate(template)}
                                title="Elimina"
                              >
                                <Trash2 size={18} />
                              </button>
                            ) : null}
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

          {!canDelete() && templates.length > 0 && (
            <p className="permission-notice">
              <Trash2 size={16} />
              Come operatore, non hai i permessi per eliminare template.
            </p>
          )}
        </div>
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        title={editingTemplate ? 'Modifica Template' : 'Nuovo Template'}
        size="lg"
      >
        <TemplateForm
          template={editingTemplate}
          onSubmit={handleSubmit}
          onCancel={closeFormModal}
          isLoading={isSubmitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTemplate}
        onClose={() => setDeleteTemplate(null)}
        onConfirm={handleDelete}
        title="Elimina template"
        message={`Sei sicuro di voler eliminare il template "${deleteTemplate?.name}"? Questa azione non può essere annullata.`}
        confirmLabel="Elimina"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  )
}
