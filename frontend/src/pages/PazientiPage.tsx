import { useState, useEffect, useCallback } from 'react'
import {
  Edit,
  Eye,
  Loader2,
  Phone,
  Mail,
  Search,
  Trash2,
  UserPlus,
  AlertCircle,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Modal } from '@/components/Modal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { PatientForm } from '@/components/PatientForm'
import * as patientsApi from '@/api/patients'
import type { Patient, PatientFormData } from '@/types/patient'
import { ApiRequestError } from '@/api/client'

export function PazientiPage() {
  const { canDelete } = useAuth()

  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPatients, setTotalPatients] = useState(0)

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deletePatient, setDeletePatient] = useState<Patient | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const loadPatients = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await patientsApi.getPatients({
        search: debouncedSearch || undefined,
        page: currentPage,
        per_page: 15,
      })
      setPatients(response.data)
      setTotalPages(response.meta.last_page)
      setTotalPatients(response.meta.total)
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        return
      }
      setError('Errore nel caricamento dei pazienti. Riprova più tardi.')
      console.error('Failed to load patients:', err)
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, currentPage])

  useEffect(() => {
    loadPatients()
  }, [loadPatients])

  function openCreateModal() {
    setEditingPatient(null)
    setIsFormModalOpen(true)
  }

  function openEditModal(patient: Patient) {
    setEditingPatient(patient)
    setIsFormModalOpen(true)
  }

  function closeFormModal() {
    setIsFormModalOpen(false)
    setEditingPatient(null)
  }

  async function handleSubmit(data: PatientFormData) {
    setIsSubmitting(true)
    try {
      if (editingPatient) {
        await patientsApi.updatePatient(editingPatient.id, data)
      } else {
        await patientsApi.createPatient(data)
      }
      closeFormModal()
      loadPatients()
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deletePatient) return

    setIsDeleting(true)
    try {
      await patientsApi.deletePatient(deletePatient.id)
      setDeletePatient(null)
      loadPatients()
    } catch (err) {
      console.error('Failed to delete patient:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('it-IT')
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Pazienti</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreateModal}>
            <UserPlus size={18} />
            Nuovo Paziente
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
                placeholder="Cerca per nome, cognome, email o telefono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                aria-label="Cerca pazienti"
              />
            </div>
            {totalPatients > 0 && (
              <span className="results-count">
                {totalPatients} pazient{totalPatients === 1 ? 'e' : 'i'}
              </span>
            )}
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              <AlertCircle size={18} />
              {error}
              <button
                className="btn btn-secondary btn-sm"
                onClick={loadPatients}
                style={{ marginLeft: 'auto' }}
              >
                Riprova
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="loading-state">
              <Loader2 size={32} className="spinner-icon" />
              <span>Caricamento pazienti...</span>
            </div>
          ) : patients.length === 0 ? (
            <div className="empty-state">
              <Users size={48} className="empty-icon" />
              <h3>
                {debouncedSearch
                  ? 'Nessun paziente trovato'
                  : 'Nessun paziente presente'}
              </h3>
              <p>
                {debouncedSearch
                  ? 'Prova a modificare i criteri di ricerca'
                  : 'Clicca su "Nuovo Paziente" per aggiungerne uno'}
              </p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Paziente</th>
                      <th>Contatti</th>
                      <th>Data di nascita</th>
                      <th>
                        <span className="sr-only">Azioni</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient.id}>
                        <td>
                          <div className="patient-name">
                            <span className="patient-avatar">
                              {patient.first_name.charAt(0)}
                              {patient.last_name.charAt(0)}
                            </span>
                            <div>
                              <strong>
                                {patient.last_name} {patient.first_name}
                              </strong>
                              {patient.notes && (
                                <span className="patient-notes-preview">
                                  {patient.notes.length > 50
                                    ? `${patient.notes.slice(0, 50)}...`
                                    : patient.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="contact-info">
                            {patient.phone && (
                              <a
                                href={`tel:${patient.phone}`}
                                className="contact-link"
                                title={patient.phone}
                              >
                                <Phone size={14} />
                                {patient.phone}
                              </a>
                            )}
                            {patient.email && (
                              <a
                                href={`mailto:${patient.email}`}
                                className="contact-link"
                                title={patient.email}
                              >
                                <Mail size={14} />
                                {patient.email}
                              </a>
                            )}
                            {!patient.phone && !patient.email && (
                              <span className="text-muted">-</span>
                            )}
                          </div>
                        </td>
                        <td>{formatDate(patient.date_of_birth)}</td>
                        <td>
                          <div className="row-actions">
                            <Link
                              to={`/pazienti/${patient.id}`}
                              className="btn btn-icon"
                              title="Visualizza dettagli"
                            >
                              <Eye size={18} />
                            </Link>
                            <button
                              className="btn btn-icon"
                              onClick={() => openEditModal(patient)}
                              title="Modifica"
                            >
                              <Edit size={18} />
                            </button>
                            {canDelete() ? (
                              <button
                                className="btn btn-icon btn-danger"
                                onClick={() => setDeletePatient(patient)}
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

          {!canDelete() && patients.length > 0 && (
            <p className="permission-notice">
              <Trash2 size={16} />
              Come operatore, non hai i permessi per eliminare pazienti.
            </p>
          )}
        </div>
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        title={editingPatient ? 'Modifica Paziente' : 'Nuovo Paziente'}
        size="md"
      >
        <PatientForm
          patient={editingPatient}
          onSubmit={handleSubmit}
          onCancel={closeFormModal}
          isLoading={isSubmitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deletePatient}
        onClose={() => setDeletePatient(null)}
        onConfirm={handleDelete}
        title="Elimina paziente"
        message={`Sei sicuro di voler eliminare ${deletePatient?.first_name} ${deletePatient?.last_name}? Questa azione non può essere annullata.`}
        confirmLabel="Elimina"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  )
}
